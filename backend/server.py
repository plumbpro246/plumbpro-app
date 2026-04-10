from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'plumbpro_secret_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI(title="PlumbPro Field Companion API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company: Optional[str] = None
    subscription_tier: str = "free"
    subscription_status: str = "inactive"
    trial_ends_at: Optional[str] = None
    trial_started: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Subscription Models
SUBSCRIPTION_TIERS = {
    "basic": {"name": "Basic", "price": 4.99, "features": ["notes", "calculator", "formulas"], "trial_days": 7},
    "pro": {"name": "Pro", "price": 9.99, "features": ["notes", "calculator", "formulas", "timesheet", "materials", "calendar", "safety_talks"], "trial_days": 7},
    "enterprise": {"name": "Enterprise", "price": 19.99, "features": ["all"], "trial_days": 7}
}

# Google Play Billing Product IDs
GOOGLE_PLAY_PRODUCT_IDS = {
    "basic": "com.plumbpro.fieldcompanion.basic_monthly",
    "pro": "com.plumbpro.fieldcompanion.pro_monthly",
    "enterprise": "com.plumbpro.fieldcompanion.enterprise_monthly",
}

def get_tier_from_product_id(product_id: str) -> str:
    """Map Google Play product ID to tier name"""
    for tier, pid in GOOGLE_PLAY_PRODUCT_IDS.items():
        if pid == product_id:
            return tier
    return "free"

FREE_TRIAL_DAYS = 7

class SubscriptionRequest(BaseModel):
    tier: str
    origin_url: str

class StartTrialRequest(BaseModel):
    tier: str

class GooglePlayVerifyRequest(BaseModel):
    purchase_token: str
    product_id: str
    order_id: Optional[str] = None

# Notes Models
class NoteCreate(BaseModel):
    title: str
    content: str
    job_id: Optional[str] = None
    tags: List[str] = []
    photos: List[str] = []  # List of photo IDs

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    photos: Optional[List[str]] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    job_id: Optional[str] = None
    tags: List[str] = []
    photos: List[str] = []
    created_at: str
    updated_at: str

# Timesheet Models
class TimesheetEntry(BaseModel):
    job_name: str
    job_id: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    break_minutes: int = 0
    notes: Optional[str] = None

class TimesheetResponse(BaseModel):
    id: str
    user_id: str
    job_name: str
    job_id: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    break_minutes: int
    hours_worked: float
    notes: Optional[str] = None
    created_at: str

# Material List Models
class MaterialItem(BaseModel):
    name: str
    quantity: float
    unit: str
    unit_price: float = 0.0
    notes: Optional[str] = None

class MaterialListCreate(BaseModel):
    job_name: str
    job_id: Optional[str] = None
    items: List[MaterialItem] = []
    photos: List[str] = []  # List of photo IDs

class MaterialListResponse(BaseModel):
    id: str
    user_id: str
    job_name: str
    job_id: Optional[str] = None
    items: List[Dict]
    photos: List[str] = []
    total_cost: float
    created_at: str
    updated_at: str

# Job Bidding Models
class BidCreate(BaseModel):
    job_name: str
    client_name: str
    client_contact: Optional[str] = None
    description: str
    labor_hours: float
    hourly_rate: float
    material_cost: float
    markup_percent: float = 15.0
    notes: Optional[str] = None

class BidResponse(BaseModel):
    id: str
    user_id: str
    job_name: str
    client_name: str
    client_contact: Optional[str] = None
    description: str
    labor_hours: float
    hourly_rate: float
    labor_cost: float
    material_cost: float
    markup_percent: float
    markup_amount: float
    total_bid: float
    status: str
    notes: Optional[str] = None
    created_at: str

# Blueprint Models
class BlueprintResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    file_name: str
    file_size: int
    file_data: Optional[str] = None
    created_at: str

# Safety Talk Models
class SafetyTalkResponse(BaseModel):
    id: str
    title: str
    content: str
    topic: str
    date: str
    generated_at: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.get("/promo/status")
async def get_promo_status():
    """Get the current promo status - first 300 users get 3 months free"""
    total_users = await db.users.count_documents({})
    spots_remaining = max(0, 300 - total_users)
    return {
        "total_users": total_users,
        "spots_remaining": spots_remaining,
        "promo_active": spots_remaining > 0,
        "promo_offer": "3 months free" if spots_remaining > 0 else "7-day free trial",
        "promo_days": 90 if spots_remaining > 0 else 7
    }

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Check if this user qualifies for the first-100 promo
    total_users = await db.users.count_documents({})
    is_early_bird = total_users < 300
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "company": user_data.company,
        "subscription_tier": "free",
        "subscription_status": "inactive",
        "is_early_bird": is_early_bird,
        "user_number": total_users + 1,
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        company=user_data.company,
        subscription_tier="free",
        subscription_status="inactive",
        created_at=now
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        company=user.get("company"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_status=user.get("subscription_status", "inactive"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    # Check if trial has expired
    trial_ends_at = user.get("trial_ends_at")
    subscription_status = user.get("subscription_status", "inactive")
    
    if trial_ends_at and subscription_status == "trial":
        trial_end = datetime.fromisoformat(trial_ends_at.replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > trial_end:
            # Trial expired, update status
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"subscription_status": "expired", "subscription_tier": "free"}}
            )
            subscription_status = "expired"
            user["subscription_tier"] = "free"
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        company=user.get("company"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_status=subscription_status,
        trial_ends_at=user.get("trial_ends_at"),
        trial_started=user.get("trial_started", False),
        created_at=user["created_at"]
    )

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.get("/subscriptions/tiers")
async def get_subscription_tiers():
    return SUBSCRIPTION_TIERS

@api_router.post("/subscriptions/start-trial")
async def start_free_trial(req: StartTrialRequest, user: dict = Depends(get_current_user)):
    """Start a free trial for a subscription tier. Early birds (first 100) get 3 months, others get 7 days."""
    if req.tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    # Check if user already had a trial
    if user.get("trial_started"):
        raise HTTPException(status_code=400, detail="You've already used your free trial")
    
    # Check if user already has an active subscription
    if user.get("subscription_status") == "active":
        raise HTTPException(status_code=400, detail="You already have an active subscription")
    
    # Early bird users get 90 days, others get 7 days
    is_early_bird = user.get("is_early_bird", False)
    trial_days = 90 if is_early_bird else FREE_TRIAL_DAYS
    trial_end = datetime.now(timezone.utc) + timedelta(days=trial_days)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "subscription_tier": req.tier,
            "subscription_status": "trial",
            "trial_started": True,
            "trial_ends_at": trial_end.isoformat(),
            "trial_started_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "status": "trial_started",
        "tier": req.tier,
        "trial_ends_at": trial_end.isoformat(),
        "days_remaining": trial_days,
        "is_early_bird": is_early_bird
    }

@api_router.get("/subscriptions/trial-status")
async def get_trial_status(user: dict = Depends(get_current_user)):
    """Get current trial status"""
    trial_ends_at = user.get("trial_ends_at")
    subscription_status = user.get("subscription_status", "inactive")
    
    if not trial_ends_at or subscription_status != "trial":
        return {
            "has_trial": False,
            "trial_started": user.get("trial_started", False),
            "can_start_trial": not user.get("trial_started", False)
        }
    
    trial_end = datetime.fromisoformat(trial_ends_at.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    
    if now > trial_end:
        return {
            "has_trial": False,
            "trial_expired": True,
            "trial_started": True,
            "can_start_trial": False
        }
    
    days_remaining = (trial_end - now).days
    hours_remaining = ((trial_end - now).seconds // 3600)
    
    return {
        "has_trial": True,
        "tier": user.get("subscription_tier"),
        "trial_ends_at": trial_ends_at,
        "days_remaining": days_remaining,
        "hours_remaining": hours_remaining,
        "trial_started": True,
        "can_start_trial": False
    }

import stripe as stripe_lib

@api_router.post("/subscriptions/checkout")
async def create_checkout_session(req: SubscriptionRequest, request: Request, user: dict = Depends(get_current_user)):
    if req.tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    tier_info = SUBSCRIPTION_TIERS[req.tier]
    amount = int(tier_info["price"] * 100)  # Stripe uses cents
    
    stripe_lib.api_key = STRIPE_API_KEY
    
    success_url = f"{req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscription"
    
    try:
        session = stripe_lib.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": amount,
                    "recurring": {"interval": "month"},
                    "product_data": {"name": f"PlumbPro {tier_info['name']} Plan"},
                },
                "quantity": 1,
            }],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user["id"],
                "tier": req.tier,
                "user_email": user["email"]
            },
            subscription_data={
                "trial_period_days": tier_info.get("trial_days", 7)
            } if not user.get("trial_started") else {}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session.id,
        "tier": req.tier,
        "amount": tier_info["price"],
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/subscriptions/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    stripe_lib.api_key = STRIPE_API_KEY
    
    try:
        session = stripe_lib.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if session.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction.get("payment_status") != "completed":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "subscription_tier": transaction["tier"],
                    "subscription_status": "active",
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {
        "status": session.status,
        "payment_status": session.payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
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
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {
                        "subscription_tier": tier,
                        "subscription_status": "active",
                        "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                await db.payment_transactions.update_one(
                    {"session_id": session.get("id")},
                    {"$set": {"payment_status": "completed"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ==================== GOOGLE PLAY BILLING ====================

@api_router.post("/subscriptions/google-play/verify")
async def verify_google_play_purchase(req: GooglePlayVerifyRequest, user: dict = Depends(get_current_user)):
    """Verify a Google Play subscription purchase and activate the user's subscription."""
    
    tier = get_tier_from_product_id(req.product_id)
    if tier == "free":
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    # Check if this purchase token was already processed (replay protection)
    existing = await db.google_play_purchases.find_one(
        {"purchase_token": req.purchase_token}, {"_id": 0}
    )
    if existing and existing.get("user_id") != user["id"]:
        raise HTTPException(status_code=400, detail="Purchase token already used by another account")
    
    # In production, verify with Google Play Developer API using service account
    # For now, we trust the purchase token from the client and record it
    # When you have a Google Cloud Service Account JSON, uncomment the verification below:
    #
    # from google.oauth2 import service_account
    # from googleapiclient.discovery import build
    # credentials = service_account.Credentials.from_service_account_file(
    #     os.environ.get('GOOGLE_SERVICE_ACCOUNT_PATH', './service-account.json'),
    #     scopes=["https://www.googleapis.com/auth/androidpublisher"]
    # )
    # service = build("androidpublisher", "v3", credentials=credentials)
    # result = service.purchases().subscriptions().get(
    #     packageName="com.plumbpro.fieldcompanion",
    #     subscriptionId=req.product_id,
    #     token=req.purchase_token
    # ).execute()
    # Validate result['paymentState'], result['expiryTimeMillis'], etc.
    
    now = datetime.now(timezone.utc)
    
    # Record the Google Play purchase
    purchase_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "purchase_token": req.purchase_token,
        "product_id": req.product_id,
        "order_id": req.order_id,
        "tier": tier,
        "platform": "android",
        "verified": True,
        "created_at": now.isoformat()
    }
    await db.google_play_purchases.update_one(
        {"purchase_token": req.purchase_token},
        {"$set": purchase_doc},
        upsert=True
    )
    
    # Update user subscription
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "subscription_tier": tier,
            "subscription_status": "active",
            "subscription_platform": "google_play",
            "google_play_product_id": req.product_id,
            "google_play_purchase_token": req.purchase_token,
            "subscription_updated_at": now.isoformat()
        }}
    )
    
    return {
        "status": "verified",
        "tier": tier,
        "message": f"Subscription activated: {SUBSCRIPTION_TIERS[tier]['name']}"
    }

@api_router.get("/subscriptions/google-play/products")
async def get_google_play_products():
    """Get the Google Play product IDs for each subscription tier."""
    products = []
    for tier_id, tier_info in SUBSCRIPTION_TIERS.items():
        products.append({
            "tier": tier_id,
            "name": tier_info["name"],
            "price": tier_info["price"],
            "product_id": GOOGLE_PLAY_PRODUCT_IDS.get(tier_id, ""),
            "features": tier_info["features"]
        })
    return products

# ==================== NOTES ROUTES ====================

@api_router.post("/notes", response_model=NoteResponse)
async def create_note(note: NoteCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    note_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": note.title,
        "content": note.content,
        "job_id": note.job_id,
        "tags": note.tags,
        "created_at": now,
        "updated_at": now
    }
    await db.notes.insert_one(note_doc)
    return NoteResponse(**note_doc)

@api_router.get("/notes", response_model=List[NoteResponse])
async def get_notes(user: dict = Depends(get_current_user)):
    notes = await db.notes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return notes

@api_router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note: NoteUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in note.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.notes.update_one(
        {"id": note_id, "user_id": user["id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    updated = await db.notes.find_one({"id": note_id}, {"_id": 0})
    return NoteResponse(**updated)

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    result = await db.notes.delete_one({"id": note_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted"}

# ==================== TIMESHEET ROUTES ====================

@api_router.post("/timesheets", response_model=TimesheetResponse)
async def create_timesheet(entry: TimesheetEntry, user: dict = Depends(get_current_user)):
    # Calculate hours worked
    start = datetime.strptime(entry.start_time, "%H:%M")
    end = datetime.strptime(entry.end_time, "%H:%M")
    diff = (end - start).total_seconds() / 3600
    hours_worked = max(0, diff - (entry.break_minutes / 60))
    
    now = datetime.now(timezone.utc).isoformat()
    timesheet_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "job_name": entry.job_name,
        "job_id": entry.job_id,
        "date": entry.date,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "break_minutes": entry.break_minutes,
        "hours_worked": round(hours_worked, 2),
        "notes": entry.notes,
        "created_at": now
    }
    await db.timesheets.insert_one(timesheet_doc)
    return TimesheetResponse(**timesheet_doc)

@api_router.get("/timesheets", response_model=List[TimesheetResponse])
async def get_timesheets(user: dict = Depends(get_current_user)):
    timesheets = await db.timesheets.find({"user_id": user["id"]}, {"_id": 0}).sort("date", -1).to_list(1000)
    return timesheets

@api_router.delete("/timesheets/{timesheet_id}")
async def delete_timesheet(timesheet_id: str, user: dict = Depends(get_current_user)):
    result = await db.timesheets.delete_one({"id": timesheet_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return {"status": "deleted"}

# ==================== MATERIAL LIST ROUTES ====================

@api_router.post("/materials", response_model=MaterialListResponse)
async def create_material_list(material_list: MaterialListCreate, user: dict = Depends(get_current_user)):
    items = [item.model_dump() for item in material_list.items]
    total_cost = sum(item["quantity"] * item["unit_price"] for item in items)
    
    now = datetime.now(timezone.utc).isoformat()
    material_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "job_name": material_list.job_name,
        "job_id": material_list.job_id,
        "items": items,
        "total_cost": round(total_cost, 2),
        "created_at": now,
        "updated_at": now
    }
    await db.material_lists.insert_one(material_doc)
    return MaterialListResponse(**material_doc)

@api_router.get("/materials", response_model=List[MaterialListResponse])
async def get_material_lists(user: dict = Depends(get_current_user)):
    materials = await db.material_lists.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return materials

@api_router.delete("/materials/{material_id}")
async def delete_material_list(material_id: str, user: dict = Depends(get_current_user)):
    result = await db.material_lists.delete_one({"id": material_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material list not found")
    return {"status": "deleted"}

# ==================== JOB BIDDING ROUTES ====================

@api_router.post("/bids", response_model=BidResponse)
async def create_bid(bid: BidCreate, user: dict = Depends(get_current_user)):
    labor_cost = bid.labor_hours * bid.hourly_rate
    subtotal = labor_cost + bid.material_cost
    markup_amount = subtotal * (bid.markup_percent / 100)
    total_bid = subtotal + markup_amount
    
    now = datetime.now(timezone.utc).isoformat()
    bid_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "job_name": bid.job_name,
        "client_name": bid.client_name,
        "client_contact": bid.client_contact,
        "description": bid.description,
        "labor_hours": bid.labor_hours,
        "hourly_rate": bid.hourly_rate,
        "labor_cost": round(labor_cost, 2),
        "material_cost": bid.material_cost,
        "markup_percent": bid.markup_percent,
        "markup_amount": round(markup_amount, 2),
        "total_bid": round(total_bid, 2),
        "status": "draft",
        "notes": bid.notes,
        "created_at": now
    }
    await db.bids.insert_one(bid_doc)
    return BidResponse(**bid_doc)

@api_router.get("/bids", response_model=List[BidResponse])
async def get_bids(user: dict = Depends(get_current_user)):
    bids = await db.bids.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bids

@api_router.put("/bids/{bid_id}/status")
async def update_bid_status(bid_id: str, status: str, user: dict = Depends(get_current_user)):
    if status not in ["draft", "sent", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.bids.update_one(
        {"id": bid_id, "user_id": user["id"]},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bid not found")
    return {"status": "updated"}

@api_router.delete("/bids/{bid_id}")
async def delete_bid(bid_id: str, user: dict = Depends(get_current_user)):
    result = await db.bids.delete_one({"id": bid_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bid not found")
    return {"status": "deleted"}

# ==================== CALENDAR ROUTES ====================

class CalendarEvent(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    job_id: Optional[str] = None
    event_type: str = "general"

class CalendarEventResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    job_id: Optional[str] = None
    event_type: str
    created_at: str

@api_router.post("/calendar", response_model=CalendarEventResponse)
async def create_event(event: CalendarEvent, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    event_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **event.model_dump(),
        "created_at": now
    }
    await db.calendar_events.insert_one(event_doc)
    return CalendarEventResponse(**event_doc)

@api_router.get("/calendar", response_model=List[CalendarEventResponse])
async def get_events(user: dict = Depends(get_current_user)):
    events = await db.calendar_events.find({"user_id": user["id"]}, {"_id": 0}).sort("date", 1).to_list(1000)
    return events

@api_router.delete("/calendar/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    result = await db.calendar_events.delete_one({"id": event_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "deleted"}

# ==================== SAFETY TALKS (AI GENERATED) ====================

SAFETY_TOPICS = [
    "Personal Protective Equipment (PPE)",
    "Confined Space Entry",
    "Trench Safety",
    "Hot Work Permits",
    "Chemical Handling",
    "Electrical Safety",
    "Ladder Safety",
    "Heat Stress Prevention",
    "Cold Weather Safety",
    "Tool Safety",
    "Back Injury Prevention",
    "Eye Protection",
    "Hand Safety",
    "Respiratory Protection",
    "Fire Prevention",
    "Slip, Trip, and Fall Prevention",
    "Excavation Safety",
    "Working at Heights",
    "Lockout/Tagout Procedures",
    "Emergency Response"
]

@api_router.get("/safety-talks/today", response_model=SafetyTalkResponse)
async def get_daily_safety_talk(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if we already have a talk for today
    existing = await db.safety_talks.find_one({"date": today}, {"_id": 0})
    if existing:
        return SafetyTalkResponse(**existing)
    
    # Generate new talk with AI
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    topic = SAFETY_TOPICS[day_of_year % len(SAFETY_TOPICS)]
    
    try:
        import openai
        
        client = openai.OpenAI(api_key=EMERGENT_LLM_KEY)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a safety expert for plumbing and construction workers. Generate concise, practical safety talks that can be read in 5 minutes. Include specific hazards, prevention measures, and best practices."},
                {"role": "user", "content": f"Generate a 5-minute safety talk about '{topic}' for plumbers working in the field. Include: 1) Why this topic matters, 2) Common hazards, 3) Prevention measures, 4) Action items for today. Keep it practical and engaging."}
            ]
        )
        
        content = response.choices[0].message.content
        title = f"Daily Safety Talk: {topic}"
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        content = f"Today's topic: {topic}\n\nKey Points:\n- Always follow proper safety protocols\n- Use appropriate PPE\n- Report any hazards immediately\n- Stay alert and aware of your surroundings"
        title = f"Daily Safety Talk: {topic}"
    
    talk_doc = {
        "id": str(uuid.uuid4()),
        "title": title,
        "content": content,
        "topic": topic,
        "date": today,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.safety_talks.insert_one(talk_doc)
    return SafetyTalkResponse(**talk_doc)

@api_router.get("/safety-talks/history", response_model=List[SafetyTalkResponse])
async def get_safety_talk_history(user: dict = Depends(get_current_user)):
    talks = await db.safety_talks.find({}, {"_id": 0}).sort("date", -1).to_list(30)
    return talks

# ==================== BLUEPRINTS ROUTES ====================

@api_router.post("/blueprints")
async def upload_blueprint(
    name: str,
    description: str = "",
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    file_data = base64.b64encode(content).decode('utf-8')
    
    blueprint_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": name,
        "description": description,
        "file_name": file.filename,
        "file_size": len(content),
        "file_data": file_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.blueprints.insert_one(blueprint_doc)
    
    return {
        "id": blueprint_doc["id"],
        "name": name,
        "file_name": file.filename,
        "file_size": len(content)
    }

@api_router.get("/blueprints")
async def get_blueprints(user: dict = Depends(get_current_user)):
    blueprints = await db.blueprints.find(
        {"user_id": user["id"]},
        {"_id": 0, "file_data": 0}
    ).sort("created_at", -1).to_list(100)
    return blueprints

@api_router.get("/blueprints/{blueprint_id}")
async def get_blueprint(blueprint_id: str, user: dict = Depends(get_current_user)):
    blueprint = await db.blueprints.find_one(
        {"id": blueprint_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return blueprint

@api_router.delete("/blueprints/{blueprint_id}")
async def delete_blueprint(blueprint_id: str, user: dict = Depends(get_current_user)):
    result = await db.blueprints.delete_one({"id": blueprint_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return {"status": "deleted"}

# ==================== PLUMBING FORMULAS ====================

PLUMBING_FORMULAS = [
    {
        "id": "pipe-volume",
        "name": "Pipe Volume",
        "formula": "V = π × r² × L",
        "description": "Calculate volume of water in a pipe",
        "variables": {"r": "Pipe radius (inches)", "L": "Pipe length (feet)"},
        "unit": "gallons"
    },
    {
        "id": "flow-rate",
        "name": "Flow Rate (GPM)",
        "formula": "Q = V × A",
        "description": "Calculate flow rate through a pipe",
        "variables": {"V": "Velocity (ft/s)", "A": "Cross-sectional area (sq ft)"},
        "unit": "GPM"
    },
    {
        "id": "head-pressure",
        "name": "Head Pressure",
        "formula": "P = 0.433 × H",
        "description": "Convert feet of head to PSI",
        "variables": {"H": "Height of water column (feet)"},
        "unit": "PSI"
    },
    {
        "id": "pipe-expansion",
        "name": "Pipe Thermal Expansion",
        "formula": "ΔL = α × L × ΔT",
        "description": "Calculate pipe expansion due to temperature change",
        "variables": {"α": "Expansion coefficient", "L": "Pipe length", "ΔT": "Temperature change"},
        "unit": "inches"
    },
    {
        "id": "drainage-slope",
        "name": "Drainage Slope",
        "formula": "Drop = Length × (Slope/100)",
        "description": "Calculate required drop for drainage",
        "variables": {"Length": "Pipe length (feet)", "Slope": "Grade percentage"},
        "unit": "inches"
    },
    {
        "id": "water-heater-size",
        "name": "Water Heater Sizing",
        "formula": "Size = Peak Demand × 0.7",
        "description": "Estimate water heater tank size",
        "variables": {"Peak Demand": "Peak hour demand (gallons)"},
        "unit": "gallons"
    },
    {
        "id": "friction-loss",
        "name": "Friction Loss",
        "formula": "hf = f × (L/D) × (V²/2g)",
        "description": "Calculate friction loss in pipes (Darcy-Weisbach)",
        "variables": {"f": "Friction factor", "L": "Length", "D": "Diameter", "V": "Velocity"},
        "unit": "feet of head"
    },
    {
        "id": "pump-horsepower",
        "name": "Pump Horsepower",
        "formula": "HP = (Q × H) / (3960 × η)",
        "description": "Calculate required pump horsepower",
        "variables": {"Q": "Flow rate (GPM)", "H": "Total head (feet)", "η": "Pump efficiency"},
        "unit": "HP"
    }
]

@api_router.get("/formulas")
async def get_formulas():
    return PLUMBING_FORMULAS

@api_router.post("/formulas/calculate")
async def calculate_formula(formula_id: str, values: Dict[str, float]):
    import math
    
    if formula_id == "pipe-volume":
        r = values.get("r", 0)
        L = values.get("L", 0)
        volume_cubic_inches = math.pi * (r ** 2) * (L * 12)
        result = volume_cubic_inches / 231  # Convert to gallons
    elif formula_id == "flow-rate":
        V = values.get("V", 0)
        A = values.get("A", 0)
        result = V * A * 448.831  # Convert to GPM
    elif formula_id == "head-pressure":
        H = values.get("H", 0)
        result = 0.433 * H
    elif formula_id == "pipe-expansion":
        alpha = values.get("alpha", 0.0000065)  # Default for copper
        L = values.get("L", 0)
        delta_t = values.get("delta_t", 0)
        result = alpha * L * delta_t * 12  # Convert to inches
    elif formula_id == "drainage-slope":
        length = values.get("Length", 0)
        slope = values.get("Slope", 0.25)  # Default 1/4" per foot
        result = length * (slope / 100) * 12
    elif formula_id == "water-heater-size":
        peak_demand = values.get("Peak Demand", 0)
        result = peak_demand * 0.7
    elif formula_id == "friction-loss":
        f = values.get("f", 0.02)
        L = values.get("L", 0)
        D = values.get("D", 1)
        V = values.get("V", 0)
        g = 32.174
        result = f * (L / D) * ((V ** 2) / (2 * g))
    elif formula_id == "pump-horsepower":
        Q = values.get("Q", 0)
        H = values.get("H", 0)
        eta = values.get("eta", 0.7)
        result = (Q * H) / (3960 * eta)
    else:
        raise HTTPException(status_code=404, detail="Formula not found")
    
    return {"result": round(result, 4), "formula_id": formula_id}

# ==================== OSHA REQUIREMENTS ====================

OSHA_REQUIREMENTS = [
    {
        "id": "ppe",
        "category": "Personal Protective Equipment",
        "standard": "29 CFR 1926.95",
        "title": "PPE Requirements",
        "requirements": [
            "Employers must provide PPE at no cost to employees",
            "PPE must be properly fitted",
            "Training on proper use required",
            "Damaged PPE must be replaced immediately"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "confined-space",
        "category": "Confined Spaces",
        "standard": "29 CFR 1926.1200-1213",
        "title": "Confined Space Entry",
        "requirements": [
            "Identify all permit-required confined spaces",
            "Develop written entry program",
            "Test atmosphere before entry",
            "Provide rescue equipment and trained personnel"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "excavation",
        "category": "Excavation",
        "standard": "29 CFR 1926.650-652",
        "title": "Trenching and Excavation",
        "requirements": [
            "Trenches 5 feet or deeper require protective systems",
            "Competent person must inspect daily",
            "Safe access within 25 feet of workers",
            "Keep spoils at least 2 feet from edge"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "fall-protection",
        "category": "Fall Protection",
        "standard": "29 CFR 1926.501",
        "title": "Fall Protection Requirements",
        "requirements": [
            "Protection required at 6 feet or more",
            "Guardrails, safety nets, or personal fall arrest",
            "Floor holes must be covered or guarded",
            "Training on fall hazards required"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "hazcom",
        "category": "Hazard Communication",
        "standard": "29 CFR 1926.59",
        "title": "HazCom Program",
        "requirements": [
            "Written hazard communication program",
            "Safety Data Sheets (SDS) available",
            "Labels on all containers",
            "Employee training required"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "electrical",
        "category": "Electrical Safety",
        "standard": "29 CFR 1926.400-449",
        "title": "Electrical Safety",
        "requirements": [
            "GFCI protection required on job sites",
            "Assured equipment grounding program",
            "Proper extension cord use",
            "Qualified persons for electrical work"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "scaffolding",
        "category": "Scaffolding",
        "standard": "29 CFR 1926.451",
        "title": "Scaffold Safety",
        "requirements": [
            "Competent person to supervise erection",
            "Support capacity 4x intended load",
            "Planking fully planked and secured",
            "Guardrails on all open sides above 10 feet"
        ],
        "penalties": "Up to $15,625 per violation"
    },
    {
        "id": "lockout-tagout",
        "category": "Energy Control",
        "standard": "29 CFR 1926.417",
        "title": "Lockout/Tagout",
        "requirements": [
            "Written energy control procedure",
            "Each worker applies own lock",
            "Verify zero energy state before work",
            "Only authorized employees remove locks"
        ],
        "penalties": "Up to $15,625 per violation"
    }
]

@api_router.get("/osha")
async def get_osha_requirements():
    return OSHA_REQUIREMENTS

@api_router.get("/osha/{requirement_id}")
async def get_osha_requirement(requirement_id: str):
    for req in OSHA_REQUIREMENTS:
        if req["id"] == requirement_id:
            return req
    raise HTTPException(status_code=404, detail="Requirement not found")

# ==================== SAFETY DATA SHEETS ====================

SDS_DATABASE = [
    {
        "id": "pvc-cement",
        "product_name": "PVC Cement",
        "manufacturer": "Generic",
        "hazards": ["Flammable", "Eye Irritant", "Respiratory Irritant"],
        "ppe_required": ["Safety Glasses", "Chemical Resistant Gloves", "Ventilation"],
        "first_aid": {
            "eye_contact": "Flush with water for 15 minutes. Seek medical attention.",
            "skin_contact": "Wash with soap and water.",
            "inhalation": "Move to fresh air. Seek medical attention if symptoms persist.",
            "ingestion": "Do not induce vomiting. Seek medical attention."
        },
        "storage": "Keep away from heat and ignition sources. Store in well-ventilated area.",
        "disposal": "Dispose according to local regulations."
    },
    {
        "id": "flux",
        "product_name": "Soldering Flux",
        "manufacturer": "Generic",
        "hazards": ["Corrosive", "Skin Irritant"],
        "ppe_required": ["Safety Glasses", "Chemical Resistant Gloves"],
        "first_aid": {
            "eye_contact": "Flush immediately with water for 15-20 minutes.",
            "skin_contact": "Wash thoroughly with soap and water.",
            "inhalation": "Move to fresh air.",
            "ingestion": "Rinse mouth. Do not induce vomiting."
        },
        "storage": "Store in cool, dry place. Keep container closed.",
        "disposal": "Dispose according to local regulations."
    },
    {
        "id": "propane",
        "product_name": "Propane (LP Gas)",
        "manufacturer": "Generic",
        "hazards": ["Extremely Flammable", "Asphyxiant", "Pressurized Container"],
        "ppe_required": ["Safety Glasses", "Leather Gloves for cold surfaces"],
        "first_aid": {
            "eye_contact": "Flush with water if liquid contact occurs.",
            "skin_contact": "For frostbite, immerse in warm water.",
            "inhalation": "Move to fresh air. Give oxygen if breathing difficult.",
            "ingestion": "Not applicable for gas."
        },
        "storage": "Store upright in well-ventilated area away from ignition sources.",
        "disposal": "Return empty cylinders to supplier."
    },
    {
        "id": "thread-sealant",
        "product_name": "Thread Sealant (Teflon Tape/Paste)",
        "manufacturer": "Generic",
        "hazards": ["Low hazard material"],
        "ppe_required": ["Safety Glasses (paste)", "None typically required for tape"],
        "first_aid": {
            "eye_contact": "Flush with water.",
            "skin_contact": "Wash with soap and water.",
            "inhalation": "Not typically a concern.",
            "ingestion": "Not toxic, but avoid ingestion."
        },
        "storage": "Store in cool, dry place.",
        "disposal": "Dispose with regular waste."
    },
    {
        "id": "drain-cleaner",
        "product_name": "Chemical Drain Cleaner",
        "manufacturer": "Generic",
        "hazards": ["Corrosive", "Severe Burns", "Reactive with metals"],
        "ppe_required": ["Face Shield", "Chemical Resistant Gloves", "Apron", "Safety Goggles"],
        "first_aid": {
            "eye_contact": "Flush immediately for 30 minutes. Seek emergency medical care.",
            "skin_contact": "Flush with water for 20 minutes. Remove contaminated clothing.",
            "inhalation": "Move to fresh air. Seek medical attention.",
            "ingestion": "Do NOT induce vomiting. Drink water/milk. Call poison control."
        },
        "storage": "Store upright in original container. Keep away from metals and children.",
        "disposal": "Hazardous waste - dispose according to regulations."
    }
]

@api_router.get("/sds")
async def get_safety_data_sheets():
    return SDS_DATABASE

@api_router.get("/sds/{sds_id}")
async def get_safety_data_sheet(sds_id: str):
    for sds in SDS_DATABASE:
        if sds["id"] == sds_id:
            return sds
    raise HTTPException(status_code=404, detail="SDS not found")

# ==================== TOTAL STATION REFERENCE ====================

TOTAL_STATION_INFO = {
    "basics": {
        "title": "Total Station Basics",
        "content": [
            "A total station is an electronic/optical instrument used for surveying and building construction.",
            "Combines EDM (Electronic Distance Measurement) with electronic theodolite.",
            "Measures angles and distances simultaneously.",
            "Data can be downloaded to a computer for analysis."
        ]
    },
    "setup": {
        "title": "Setup Procedure",
        "steps": [
            "1. Set up tripod over known point, level roughly",
            "2. Mount instrument on tripod",
            "3. Level using circular bubble",
            "4. Center over point using optical/laser plummet",
            "5. Fine level using plate bubble",
            "6. Input station coordinates and height"
        ]
    },
    "common_operations": {
        "title": "Common Operations for Plumbers",
        "operations": [
            {
                "name": "Grade Shooting",
                "description": "Establish pipe elevations and grades",
                "procedure": "Set benchmark, shoot points, calculate cut/fill"
            },
            {
                "name": "Layout",
                "description": "Stake out pipe locations from plans",
                "procedure": "Input coordinates, navigate to point, mark location"
            },
            {
                "name": "As-Built",
                "description": "Document installed pipe locations",
                "procedure": "Shoot points on installed pipes, record data"
            }
        ]
    },
    "troubleshooting": {
        "title": "Troubleshooting",
        "issues": [
            {"issue": "Battery won't charge", "solution": "Check connections, try different outlet, may need new battery"},
            {"issue": "Prism won't lock", "solution": "Clean prism face, check for obstructions, adjust search settings"},
            {"issue": "Readings inconsistent", "solution": "Re-level instrument, check for vibration, verify setup over point"},
            {"issue": "Can't communicate with controller", "solution": "Check cable connections, verify Bluetooth pairing, restart devices"}
        ]
    },
    "safety": {
        "title": "Safety Considerations",
        "points": [
            "Never look directly at the laser beam",
            "Secure tripod to prevent tipping",
            "Protect instrument from weather",
            "Use proper lifting technique - instruments are heavy",
            "Ensure vehicle traffic awareness when working near roads"
        ]
    }
}

@api_router.get("/total-station")
async def get_total_station_info():
    return TOTAL_STATION_INFO

# ==================== PHOTOS ROUTES ====================

@api_router.post("/photos")
async def upload_photo(
    file: UploadFile = File(...),
    linked_type: str = "note",
    linked_id: str = "",
    caption: str = "",
    user: dict = Depends(get_current_user)
):
    """Upload a photo and optionally link it to a note or material list"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and HEIC images are allowed")
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    file_data = base64.b64encode(content).decode('utf-8')
    
    photo_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "file_name": file.filename,
        "file_type": file.content_type,
        "file_size": len(content),
        "file_data": file_data,
        "linked_type": linked_type,
        "linked_id": linked_id,
        "caption": caption,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.photos.insert_one(photo_doc)
    
    return {
        "id": photo_doc["id"],
        "file_name": file.filename,
        "file_size": len(content),
        "linked_type": linked_type,
        "linked_id": linked_id
    }

@api_router.get("/photos")
async def get_photos(linked_type: str = None, linked_id: str = None, user: dict = Depends(get_current_user)):
    """Get photos, optionally filtered by linked item"""
    query = {"user_id": user["id"]}
    if linked_type:
        query["linked_type"] = linked_type
    if linked_id:
        query["linked_id"] = linked_id
    
    photos = await db.photos.find(query, {"_id": 0, "file_data": 0}).sort("created_at", -1).to_list(100)
    return photos

@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str, user: dict = Depends(get_current_user)):
    """Get a single photo with its data"""
    photo = await db.photos.find_one({"id": photo_id, "user_id": user["id"]}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, user: dict = Depends(get_current_user)):
    result = await db.photos.delete_one({"id": photo_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"status": "deleted"}

@api_router.put("/photos/{photo_id}/link")
async def link_photo(photo_id: str, linked_type: str, linked_id: str, user: dict = Depends(get_current_user)):
    """Link a photo to a note or material list"""
    result = await db.photos.update_one(
        {"id": photo_id, "user_id": user["id"]},
        {"$set": {"linked_type": linked_type, "linked_id": linked_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"status": "linked"}

# ==================== NOTIFICATION SETTINGS ====================

@api_router.get("/notifications/settings")
async def get_notification_settings(user: dict = Depends(get_current_user)):
    """Get user's notification settings"""
    settings = await db.notification_settings.find_one({"user_id": user["id"]}, {"_id": 0})
    if not settings:
        # Return defaults
        return {
            "user_id": user["id"],
            "calendar_reminders": True,
            "reminder_minutes_before": 30,
            "daily_safety_talk": True,
            "safety_talk_time": "07:00",
            "browser_notifications": False
        }
    return settings

@api_router.put("/notifications/settings")
async def update_notification_settings(
    calendar_reminders: bool = True,
    reminder_minutes_before: int = 30,
    daily_safety_talk: bool = True,
    safety_talk_time: str = "07:00",
    browser_notifications: bool = False,
    user: dict = Depends(get_current_user)
):
    """Update user's notification settings"""
    settings = {
        "user_id": user["id"],
        "calendar_reminders": calendar_reminders,
        "reminder_minutes_before": reminder_minutes_before,
        "daily_safety_talk": daily_safety_talk,
        "safety_talk_time": safety_talk_time,
        "browser_notifications": browser_notifications,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notification_settings.update_one(
        {"user_id": user["id"]},
        {"$set": settings},
        upsert=True
    )
    return settings

@api_router.get("/notifications/upcoming")
async def get_upcoming_notifications(user: dict = Depends(get_current_user)):
    """Get upcoming calendar events for notification purposes"""
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    
    # Get events for today and tomorrow
    events = await db.calendar_events.find(
        {
            "user_id": user["id"],
            "date": {"$gte": today}
        },
        {"_id": 0}
    ).sort("date", 1).to_list(20)
    
    return events

# ==================== EXPORT DATA ROUTES ====================

@api_router.get("/export/timesheets")
async def export_timesheets(
    start_date: str = None,
    end_date: str = None,
    user: dict = Depends(get_current_user)
):
    """Get timesheet data for PDF export"""
    query = {"user_id": user["id"]}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    
    timesheets = await db.timesheets.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    
    # Calculate totals
    total_hours = sum(t.get("hours_worked", 0) for t in timesheets)
    total_entries = len(timesheets)
    
    # Group by job
    jobs_summary = {}
    for t in timesheets:
        job = t.get("job_name", "Unknown")
        if job not in jobs_summary:
            jobs_summary[job] = {"hours": 0, "entries": 0}
        jobs_summary[job]["hours"] += t.get("hours_worked", 0)
        jobs_summary[job]["entries"] += 1
    
    return {
        "user": {
            "name": user.get("full_name"),
            "email": user.get("email"),
            "company": user.get("company")
        },
        "period": {
            "start": start_date or "All time",
            "end": end_date or "Present"
        },
        "summary": {
            "total_hours": round(total_hours, 2),
            "total_entries": total_entries,
            "jobs_summary": jobs_summary
        },
        "entries": timesheets,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/export/bids/{bid_id}")
async def export_bid(bid_id: str, user: dict = Depends(get_current_user)):
    """Get bid data for PDF export"""
    bid = await db.bids.find_one({"id": bid_id, "user_id": user["id"]}, {"_id": 0})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    return {
        "user": {
            "name": user.get("full_name"),
            "email": user.get("email"),
            "company": user.get("company")
        },
        "bid": bid,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== OFFLINE SYNC ROUTES ====================

@api_router.get("/sync/data")
async def get_sync_data(user: dict = Depends(get_current_user)):
    """Get all user data for offline caching"""
    notes = await db.notes.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    timesheets = await db.timesheets.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    materials = await db.material_lists.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    bids = await db.bids.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    events = await db.calendar_events.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    photos = await db.photos.find({"user_id": user["id"]}, {"_id": 0, "file_data": 0}).to_list(100)
    
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company": user.get("company"),
            "subscription_tier": user.get("subscription_tier", "free")
        },
        "notes": notes,
        "timesheets": timesheets,
        "materials": materials,
        "bids": bids,
        "events": events,
        "photos": photos,
        "synced_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/sync/pending")
async def sync_pending_data(
    pending_notes: List[dict] = [],
    pending_timesheets: List[dict] = [],
    pending_events: List[dict] = [],
    user: dict = Depends(get_current_user)
):
    """Sync pending offline data to server"""
    synced = {"notes": 0, "timesheets": 0, "events": 0}
    
    for note in pending_notes:
        note["user_id"] = user["id"]
        note["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.notes.update_one(
            {"id": note["id"]},
            {"$set": note},
            upsert=True
        )
        synced["notes"] += 1
    
    for ts in pending_timesheets:
        ts["user_id"] = user["id"]
        ts["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.timesheets.update_one(
            {"id": ts["id"]},
            {"$set": ts},
            upsert=True
        )
        synced["timesheets"] += 1
    
    for event in pending_events:
        event["user_id"] = user["id"]
        event["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.calendar_events.update_one(
            {"id": event["id"]},
            {"$set": event},
            upsert=True
        )
        synced["events"] += 1
    
    return {"status": "synced", "synced_items": synced}

# ==================== PLUMBING CODE ====================
from plumbing_codes import PLUMBING_CODES, get_plumbing_code

@api_router.get("/plumbing-code")
async def get_plumbing_code_endpoint(code_type: str = "upc", edition: str = "2024", search: str = None):
    """Get plumbing code chapters by code type (upc/ipc) and edition (2015/2018/2021/2024)"""
    chapters = get_plumbing_code(code_type, edition, search)
    return chapters

@api_router.get("/plumbing-code/types")
async def get_plumbing_code_types():
    """Get available plumbing code types and editions"""
    result = {}
    for code_type, code_data in PLUMBING_CODES.items():
        result[code_type] = {
            "name": code_data["name"],
            "publisher": code_data["publisher"],
            "editions": list(code_data["editions"].keys())
        }
    return result

# Bookmarks routes MUST be before {chapter_id} catch-all
@api_router.get("/plumbing-code/bookmarks")
async def get_bookmarks(user: dict = Depends(get_current_user)):
    bookmarks = await db.code_bookmarks.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookmarks

@api_router.post("/plumbing-code/bookmarks")
async def add_bookmark(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    code_type = body.get("code_type", "upc")
    edition = body.get("edition", "2024")
    section_code = body.get("section_code")
    section_title = body.get("section_title")
    chapter_title = body.get("chapter_title")
    chapter_id = body.get("chapter_id")

    if not section_code:
        raise HTTPException(status_code=400, detail="section_code is required")

    existing = await db.code_bookmarks.find_one({
        "user_id": user["id"], "code_type": code_type,
        "edition": edition, "section_code": section_code
    })
    if existing:
        raise HTTPException(status_code=409, detail="Already bookmarked")

    bookmark = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "code_type": code_type,
        "edition": edition,
        "section_code": section_code,
        "section_title": section_title or "",
        "chapter_title": chapter_title or "",
        "chapter_id": chapter_id or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.code_bookmarks.insert_one(bookmark)
    del bookmark["_id"]
    return bookmark

@api_router.delete("/plumbing-code/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, user: dict = Depends(get_current_user)):
    result = await db.code_bookmarks.delete_one({"id": bookmark_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "deleted"}

@api_router.get("/plumbing-code/{chapter_id}")
async def get_plumbing_code_chapter(chapter_id: str, code_type: str = "upc", edition: str = "2024"):
    """Get a specific chapter of a plumbing code"""
    chapters = get_plumbing_code(code_type, edition)
    for chapter in chapters:
        if chapter["id"] == chapter_id:
            return chapter
    raise HTTPException(status_code=404, detail="Chapter not found")

# ==================== SUPPORT ====================

SUPPORT_EMAIL = "plumbpro246@gmail.com"

@api_router.post("/support/ticket")
async def create_support_ticket(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    category = body.get("category", "general")
    subject = body.get("subject", "")
    message = body.get("message", "")

    if not subject or not message:
        raise HTTPException(status_code=400, detail="Subject and message are required")

    ticket = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user.get("email", ""),
        "user_name": user.get("full_name", ""),
        "user_tier": user.get("subscription_tier", "free"),
        "category": category,
        "subject": subject,
        "message": message,
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.support_tickets.insert_one(ticket)

    # Log for email forwarding (owner checks DB or sets up email trigger)
    logger.info(f"SUPPORT TICKET [{category}] from {user.get('email')} ({user.get('full_name')}): {subject}")

    return {"status": "submitted", "ticket_id": ticket["id"], "support_email": SUPPORT_EMAIL}

@api_router.get("/support/tickets")
async def get_support_tickets(user: dict = Depends(get_current_user)):
    tickets = await db.support_tickets.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return tickets

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "PlumbPro Field Companion API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
