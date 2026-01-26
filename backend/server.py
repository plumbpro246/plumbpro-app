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
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Subscription Models
SUBSCRIPTION_TIERS = {
    "basic": {"name": "Basic", "price": 9.99, "features": ["notes", "calculator", "formulas"]},
    "pro": {"name": "Pro", "price": 19.99, "features": ["notes", "calculator", "formulas", "timesheet", "materials", "calendar", "safety_talks"]},
    "enterprise": {"name": "Enterprise", "price": 29.99, "features": ["all"]}
}

class SubscriptionRequest(BaseModel):
    tier: str
    origin_url: str

# Notes Models
class NoteCreate(BaseModel):
    title: str
    content: str
    job_id: Optional[str] = None
    tags: List[str] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    job_id: Optional[str] = None
    tags: List[str] = []
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

class MaterialListResponse(BaseModel):
    id: str
    user_id: str
    job_name: str
    job_id: Optional[str] = None
    items: List[Dict]
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

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "company": user_data.company,
        "subscription_tier": "free",
        "subscription_status": "inactive",
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
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        company=user.get("company"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_status=user.get("subscription_status", "inactive"),
        created_at=user["created_at"]
    )

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.get("/subscriptions/tiers")
async def get_subscription_tiers():
    return SUBSCRIPTION_TIERS

@api_router.post("/subscriptions/checkout")
async def create_checkout_session(req: SubscriptionRequest, request: Request, user: dict = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    if req.tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    tier_info = SUBSCRIPTION_TIERS[req.tier]
    amount = tier_info["price"]
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscription"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "tier": req.tier,
            "user_email": user["email"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session.session_id,
        "tier": req.tier,
        "amount": amount,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/subscriptions/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and user if paid
    if status.payment_status == "paid":
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
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            metadata = webhook_response.metadata
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
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "completed"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

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
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"safety-talk-{today}",
            system_message="You are a safety expert for plumbing and construction workers. Generate concise, practical safety talks that can be read in 5 minutes. Include specific hazards, prevention measures, and best practices."
        ).with_model("openai", "gpt-5.2")
        
        message = UserMessage(text=f"Generate a 5-minute safety talk about '{topic}' for plumbers working in the field. Include: 1) Why this topic matters, 2) Common hazards, 3) Prevention measures, 4) Action items for today. Keep it practical and engaging.")
        
        content = await chat.send_message(message)
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
