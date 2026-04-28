"""Auth & Promo routes."""
from fastapi import APIRouter, Depends, HTTPException
from routes.deps import (
    db, uuid, datetime, timezone,
    UserCreate, UserLogin, UserResponse, TokenResponse,
    hash_password, verify_password, create_token, get_current_user
)

router = APIRouter()


@router.get("/promo/status", summary="Get early-bird promo status")
async def get_promo_status():
    """Returns how many of the first 300 early-bird spots remain. Active promo = 3 months free trial."""
    total_users = await db.users.count_documents({})
    spots_remaining = max(0, 300 - total_users)
    return {
        "total_users": total_users,
        "spots_remaining": spots_remaining,
        "promo_active": spots_remaining > 0,
        "promo_offer": "3 months free" if spots_remaining > 0 else "7-day free trial",
        "promo_days": 90 if spots_remaining > 0 else 7
    }


@router.post("/auth/register", response_model=TokenResponse, summary="Register a new user")
async def register(user_data: UserCreate):
    """Create a new account. Returns JWT token + user info. Early-bird status auto-assigned."""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
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
        id=user_id, email=user_data.email, full_name=user_data.full_name,
        company=user_data.company, subscription_tier="free",
        subscription_status="inactive", created_at=now
    )
    return TokenResponse(access_token=token, user=user_response)


@router.post("/auth/login", response_model=TokenResponse, summary="Login")
async def login(login_data: UserLogin):
    """Authenticate with email/password. Returns JWT token + user info."""
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    user_response = UserResponse(
        id=user["id"], email=user["email"], full_name=user["full_name"],
        company=user.get("company"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_status=user.get("subscription_status", "inactive"),
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)


@router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    trial_ends_at = user.get("trial_ends_at")
    subscription_status = user.get("subscription_status", "inactive")
    
    if trial_ends_at and subscription_status == "trial":
        trial_end = datetime.fromisoformat(trial_ends_at.replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > trial_end:
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"subscription_status": "expired", "subscription_tier": "free"}}
            )
            subscription_status = "expired"
            user["subscription_tier"] = "free"
    
    return UserResponse(
        id=user["id"], email=user["email"], full_name=user["full_name"],
        company=user.get("company"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_status=subscription_status,
        trial_ends_at=user.get("trial_ends_at"),
        trial_started=user.get("trial_started", False),
        created_at=user["created_at"]
    )
