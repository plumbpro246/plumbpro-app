"""Referral system routes — Refer a Plumber, Get a Month Free."""
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from routes.deps import db, datetime, timezone, timedelta, get_current_user

router = APIRouter()

REFERRAL_REWARD_DAYS = 30  # 1 month free for both referrer and referee


def generate_referral_code() -> str:
    """Generate a 6-character alphanumeric uppercase referral code."""
    alphabet = string.ascii_uppercase + string.digits
    # Remove easily confused chars
    alphabet = alphabet.replace("O", "").replace("0", "").replace("I", "").replace("1", "")
    return "".join(secrets.choice(alphabet) for _ in range(6))


async def ensure_user_referral_code(user_id: str) -> str:
    """Get or generate a unique referral code for a user."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user and user.get("referral_code"):
        return user["referral_code"]
    # Generate unique code
    for _ in range(10):
        code = generate_referral_code()
        existing = await db.users.find_one({"referral_code": code})
        if not existing:
            await db.users.update_one({"id": user_id}, {"$set": {"referral_code": code}})
            return code
    raise HTTPException(status_code=500, detail="Could not generate referral code")


async def apply_referral_reward(referee_user_id: str):
    """Called when a referred user activates a paid subscription for the first time.
    Grants REFERRAL_REWARD_DAYS to BOTH the referrer and the referee."""
    referee = await db.users.find_one({"id": referee_user_id}, {"_id": 0})
    if not referee:
        return
    if referee.get("referral_reward_applied"):
        return  # already applied — don't double-grant
    referred_by_code = referee.get("referred_by")
    if not referred_by_code:
        return
    referrer = await db.users.find_one({"referral_code": referred_by_code}, {"_id": 0})
    if not referrer:
        return

    now = datetime.now(timezone.utc)
    delta = timedelta(days=REFERRAL_REWARD_DAYS)

    def _extend(user_doc):
        # If user already has a future trial_ends_at, push it out; else create one
        current_ends = user_doc.get("trial_ends_at")
        base = now
        if current_ends:
            try:
                parsed = datetime.fromisoformat(current_ends.replace("Z", "+00:00"))
                if parsed > now:
                    base = parsed
            except Exception:
                pass
        return (base + delta).isoformat()

    # Extend referee
    referee_new_ends = _extend(referee)
    await db.users.update_one(
        {"id": referee["id"]},
        {
            "$set": {
                "trial_ends_at": referee_new_ends,
                "referral_reward_applied": True,
            },
            "$inc": {"referral_credits_days": REFERRAL_REWARD_DAYS},
        },
    )

    # Extend referrer
    referrer_new_ends = _extend(referrer)
    await db.users.update_one(
        {"id": referrer["id"]},
        {
            "$set": {"trial_ends_at": referrer_new_ends},
            "$inc": {"referral_credits_days": REFERRAL_REWARD_DAYS},
        },
    )

    # Log the completion
    await db.referrals.update_one(
        {"referee_id": referee["id"]},
        {
            "$set": {
                "referrer_id": referrer["id"],
                "referrer_code": referred_by_code,
                "referee_email": referee["email"],
                "referrer_email": referrer["email"],
                "status": "completed",
                "reward_days": REFERRAL_REWARD_DAYS,
                "completed_at": now.isoformat(),
            }
        },
        upsert=True,
    )


@router.get("/referrals/me", summary="Get my referral code, stats, and history")
async def get_my_referral(user: dict = Depends(get_current_user)):
    code = await ensure_user_referral_code(user["id"])
    # Refresh user doc after potential code generation
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})

    # Count all users who signed up with my code
    pending_referrals = await db.users.count_documents({
        "referred_by": code,
        "referral_reward_applied": {"$ne": True},
    })
    completed = await db.referrals.find(
        {"referrer_id": user["id"], "status": "completed"},
        {"_id": 0},
    ).sort("completed_at", -1).to_list(100)

    return {
        "referral_code": code,
        "credits_days_earned": fresh.get("referral_credits_days", 0),
        "completed_count": len(completed),
        "pending_count": pending_referrals,
        "reward_days_per_referral": REFERRAL_REWARD_DAYS,
        "completed_referrals": [
            {
                "referee_email": r.get("referee_email"),
                "reward_days": r.get("reward_days", REFERRAL_REWARD_DAYS),
                "completed_at": r.get("completed_at"),
            }
            for r in completed
        ],
    }


@router.get("/referrals/validate/{code}", summary="Validate a referral code (used during signup)")
async def validate_referral_code(code: str):
    code_clean = (code or "").strip().upper()
    if not code_clean:
        return {"valid": False}
    referrer = await db.users.find_one({"referral_code": code_clean}, {"_id": 0})
    if not referrer:
        return {"valid": False}
    return {
        "valid": True,
        "referrer_name": referrer.get("full_name", "A PlumbPro user"),
        "reward_days": REFERRAL_REWARD_DAYS,
    }
