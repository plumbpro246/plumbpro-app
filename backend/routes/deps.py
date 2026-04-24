"""Shared dependencies, models, and helpers for all route modules."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import os
import logging
import uuid
import jwt
import bcrypt
import base64
import json as json_module
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Load env
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'plumbpro_secret_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')
VAPID_CLAIMS = {"sub": "mailto:plumbpro246@gmail.com"}
GMAIL_ADDRESS = os.environ.get('GMAIL_ADDRESS')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')

# Security
security = HTTPBearer()
logger = logging.getLogger(__name__)

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

GOOGLE_PLAY_PRODUCT_IDS = {
    "basic": "com.plumbpro.fieldcompanion.basic_monthly",
    "pro": "com.plumbpro.fieldcompanion.pro_monthly",
    "enterprise": "com.plumbpro.fieldcompanion.enterprise_monthly",
}

FREE_TRIAL_DAYS = 7

def get_tier_from_product_id(product_id: str) -> str:
    for tier, pid in GOOGLE_PLAY_PRODUCT_IDS.items():
        if pid == product_id:
            return tier
    return "free"

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
    photos: List[str] = []

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
    photos: List[str] = []

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

# Calendar Models
class CalendarEvent(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    event_type: str = "general"
    location: Optional[str] = None
    reminder: bool = False

class CalendarEventResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    event_type: str
    location: Optional[str] = None
    reminder: bool
    created_at: str

# Email helper
def send_support_email(ticket: dict):
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.warning("Gmail SMTP not configured, skipping email")
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        msg = MIMEMultipart()
        msg["From"] = GMAIL_ADDRESS
        msg["To"] = GMAIL_ADDRESS
        msg["Subject"] = f"[PlumbPro Support] [{ticket['category'].upper()}] {ticket['subject']}"
        body = f"""New Support Ticket Received

Ticket ID: {ticket['id']}
From: {ticket['user_name']} ({ticket['user_email']})
Tier: {ticket['user_tier']}
Category: {ticket['category']}
Date: {ticket['created_at']}

Subject: {ticket['subject']}

Message:
{ticket['message']}

---
Reply directly to: {ticket['user_email']}
"""
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send support email: {e}")
        return False
