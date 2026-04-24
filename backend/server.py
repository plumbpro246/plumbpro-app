"""PlumbPro Field Companion API — Entry Point."""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create app
app = FastAPI(
    title="PlumbPro Field Companion API",
    description="""The backend API for PlumbPro — the all-in-one field companion for professional plumbers.

## Features
- **Auth & Subscriptions** — JWT auth, Stripe billing, Google Play Billing, free trials
- **Field Tools** — Notes, Timesheets, Materials, Job Bidding, Calendar
- **Reference** — AI Safety Talks, Plumbing Formulas (incl. 45°/22.5° offsets), OSHA, SDS, Total Station
- **Files** — Blueprints (PDF), Photos, Plumbing Code (UPC/IPC), Export, Offline Sync
- **Services** — Voice Notes (Whisper), Weather (Open-Meteo), Supplier Lookup, Push Notifications, Teams, Support
""",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)
api_router = APIRouter(prefix="/api")

# Import route modules
from routes.auth import router as auth_router
from routes.subscriptions import router as subscriptions_router
from routes.crud import router as crud_router
from routes.reference import router as reference_router
from routes.files import router as files_router
from routes.services import router as services_router

# Register all routers
api_router.include_router(auth_router, tags=["Auth & Promo"])
api_router.include_router(subscriptions_router, tags=["Subscriptions & Billing"])
api_router.include_router(crud_router, tags=["Field Tools (CRUD)"])
api_router.include_router(reference_router, tags=["Reference & AI"])
api_router.include_router(files_router, tags=["Files, Codes & Sync"])
api_router.include_router(services_router, tags=["Services"])

# Health check
@api_router.get("/", tags=["System"], summary="API root")
async def root():
    return {"message": "PlumbPro Field Companion API", "status": "running"}

@api_router.get("/health", tags=["System"], summary="Health check")
async def health_check():
    """Returns API health status and current server timestamp."""
    from datetime import datetime, timezone
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
    from routes.deps import client
    client.close()
