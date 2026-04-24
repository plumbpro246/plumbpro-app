"""Subscription, Stripe, Google Play Billing routes."""
from fastapi import APIRouter, Depends, Request
import stripe as stripe_lib
from routes.deps import *

router = APIRouter()


@router.get("/subscriptions/tiers")
async def get_subscription_tiers():
    return SUBSCRIPTION_TIERS


@router.post("/subscriptions/start-trial")
async def start_free_trial(req: StartTrialRequest, user: dict = Depends(get_current_user)):
    if req.tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    if user.get("trial_started"):
        raise HTTPException(status_code=400, detail="You've already used your free trial")
    if user.get("subscription_status") == "active":
        raise HTTPException(status_code=400, detail="You already have an active subscription")
    
    is_early_bird = user.get("is_early_bird", False)
    trial_days = 90 if is_early_bird else FREE_TRIAL_DAYS
    trial_end = datetime.now(timezone.utc) + timedelta(days=trial_days)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "subscription_tier": req.tier, "subscription_status": "trial",
            "trial_started": True, "trial_ends_at": trial_end.isoformat(),
            "trial_started_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"status": "trial_started", "tier": req.tier, "trial_ends_at": trial_end.isoformat(), "days_remaining": trial_days, "is_early_bird": is_early_bird}


@router.get("/subscriptions/trial-status")
async def get_trial_status(user: dict = Depends(get_current_user)):
    trial_ends_at = user.get("trial_ends_at")
    subscription_status = user.get("subscription_status", "inactive")
    
    if not trial_ends_at or subscription_status != "trial":
        return {"has_trial": False, "trial_started": user.get("trial_started", False), "can_start_trial": not user.get("trial_started", False)}
    
    trial_end = datetime.fromisoformat(trial_ends_at.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    
    if now > trial_end:
        return {"has_trial": False, "trial_expired": True, "trial_started": True, "can_start_trial": False}
    
    days_remaining = (trial_end - now).days
    hours_remaining = ((trial_end - now).seconds // 3600)
    return {"has_trial": True, "tier": user.get("subscription_tier"), "trial_ends_at": trial_ends_at, "days_remaining": days_remaining, "hours_remaining": hours_remaining, "trial_started": True, "can_start_trial": False}


@router.post("/subscriptions/checkout")
async def create_checkout_session(req: SubscriptionRequest, request: Request, user: dict = Depends(get_current_user)):
    if req.tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    tier_info = SUBSCRIPTION_TIERS[req.tier]
    amount = int(tier_info["price"] * 100)
    stripe_lib.api_key = STRIPE_API_KEY
    
    success_url = f"{req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscription"
    
    trial_days = 0
    if not user.get("trial_started"):
        total_users = await db.users.count_documents({})
        is_early_bird = total_users < 300
        trial_days = 90 if is_early_bird else FREE_TRIAL_DAYS
    
    try:
        checkout_params = {
            "payment_method_types": ["card"], "mode": "subscription",
            "line_items": [{"price_data": {"currency": "usd", "unit_amount": amount, "recurring": {"interval": "month"}, "product_data": {"name": f"PlumbPro {tier_info['name']} Plan"}}, "quantity": 1}],
            "success_url": success_url, "cancel_url": cancel_url,
            "metadata": {"user_id": user["id"], "tier": req.tier, "user_email": user["email"]},
        }
        if trial_days > 0:
            checkout_params["subscription_data"] = {"trial_period_days": trial_days}
        session = stripe_lib.checkout.Session.create(**checkout_params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    transaction_doc = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "session_id": session.id,
        "tier": req.tier, "amount": tier_info["price"], "currency": "usd",
        "payment_status": "pending", "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    return {"url": session.url, "session_id": session.id}


@router.get("/subscriptions/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    stripe_lib.api_key = STRIPE_API_KEY
    try:
        session = stripe_lib.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if session.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction.get("payment_status") != "completed":
            await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"payment_status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}})
            await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_tier": transaction["tier"], "subscription_status": "active", "subscription_updated_at": datetime.now(timezone.utc).isoformat()}})
    
    return {"status": session.status, "payment_status": session.payment_status, "amount_total": session.amount_total, "currency": session.currency}


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    stripe_lib.api_key = STRIPE_API_KEY
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    try:
        WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
        event = stripe_lib.Webhook.construct_event(body, signature, WEBHOOK_SECRET)
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            metadata = session.get("metadata", {})
            user_id = metadata.get("user_id")
            tier = metadata.get("tier")
            if user_id and tier:
                await db.users.update_one({"id": user_id}, {"$set": {"subscription_tier": tier, "subscription_status": "active", "subscription_updated_at": datetime.now(timezone.utc).isoformat()}})
                await db.payment_transactions.update_one({"session_id": session.get("id")}, {"$set": {"payment_status": "completed"}})
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


# Google Play Billing
@router.post("/subscriptions/google-play/verify")
async def verify_google_play_purchase(req: GooglePlayVerifyRequest, user: dict = Depends(get_current_user)):
    tier = get_tier_from_product_id(req.product_id)
    if tier == "free":
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    existing = await db.google_play_purchases.find_one({"purchase_token": req.purchase_token}, {"_id": 0})
    if existing and existing.get("user_id") != user["id"]:
        raise HTTPException(status_code=400, detail="Purchase token already used by another account")
    
    now = datetime.now(timezone.utc)
    purchase_doc = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "purchase_token": req.purchase_token,
        "product_id": req.product_id, "order_id": req.order_id, "tier": tier,
        "platform": "android", "verified": True, "created_at": now.isoformat()
    }
    await db.google_play_purchases.update_one({"purchase_token": req.purchase_token}, {"$set": purchase_doc}, upsert=True)
    await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_tier": tier, "subscription_status": "active", "subscription_platform": "google_play", "google_play_product_id": req.product_id, "google_play_purchase_token": req.purchase_token, "subscription_updated_at": now.isoformat()}})
    return {"status": "verified", "tier": tier, "message": f"Subscription activated: {SUBSCRIPTION_TIERS[tier]['name']}"}


@router.get("/subscriptions/google-play/products")
async def get_google_play_products():
    products = []
    for tier_id, tier_info in SUBSCRIPTION_TIERS.items():
        products.append({"tier": tier_id, "name": tier_info["name"], "price": tier_info["price"], "product_id": GOOGLE_PLAY_PRODUCT_IDS.get(tier_id, ""), "features": tier_info["features"]})
    return products
