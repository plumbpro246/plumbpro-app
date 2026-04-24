"""Support, Push Notifications, Teams, Voice Notes, Weather, Suppliers."""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from pywebpush import webpush, WebPushException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import tempfile
from routes.deps import *

router = APIRouter()


# ==================== SUPPORT ====================
SUPPORT_EMAIL = "plumbpro246@gmail.com"

@router.post("/support/ticket")
async def create_support_ticket(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    category = body.get("category", "general")
    subject = body.get("subject", "")
    message = body.get("message", "")
    if not subject or not message:
        raise HTTPException(status_code=400, detail="Subject and message are required")
    ticket = {"id": str(uuid.uuid4()), "user_id": user["id"], "user_email": user.get("email", ""), "user_name": user.get("full_name", ""), "user_tier": user.get("subscription_tier", "free"), "category": category, "subject": subject, "message": message, "status": "open", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.support_tickets.insert_one(ticket)
    send_support_email(ticket)
    return {"status": "submitted", "ticket_id": ticket["id"], "support_email": SUPPORT_EMAIL}

@router.get("/support/tickets")
async def get_support_tickets(user: dict = Depends(get_current_user)):
    return await db.support_tickets.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


# ==================== PUSH NOTIFICATIONS ====================
@router.get("/push/vapid-key")
async def get_vapid_key():
    return {"public_key": VAPID_PUBLIC_KEY}

@router.post("/push/subscribe")
async def push_subscribe(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    subscription = body.get("subscription")
    if not subscription:
        raise HTTPException(status_code=400, detail="subscription required")
    await db.push_subscriptions.update_one(
        {"user_id": user["id"], "endpoint": subscription.get("endpoint")},
        {"$set": {"user_id": user["id"], "subscription": subscription, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"status": "subscribed"}

@router.post("/push/unsubscribe")
async def push_unsubscribe(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    endpoint = body.get("endpoint")
    if endpoint:
        await db.push_subscriptions.delete_one({"user_id": user["id"], "endpoint": endpoint})
    return {"status": "unsubscribed"}

@router.post("/push/send")
async def send_push_notification(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    target_user_id = body.get("user_id", user["id"])
    title = body.get("title", "PlumbPro")
    message = body.get("message", "You have a new notification")
    url = body.get("url", "/dashboard")
    subs = await db.push_subscriptions.find({"user_id": target_user_id}).to_list(50)
    sent = 0
    for sub in subs:
        try:
            webpush(subscription_info=sub["subscription"], data=json_module.dumps({"title": title, "body": message, "url": url}), vapid_private_key=VAPID_PRIVATE_KEY, vapid_claims=VAPID_CLAIMS)
            sent += 1
        except WebPushException as e:
            if e.response and e.response.status_code in (404, 410):
                await db.push_subscriptions.delete_one({"_id": sub["_id"]})
            logger.error(f"Push failed: {e}")
    return {"sent": sent}


# ==================== TEAMS ====================
@router.post("/teams")
async def create_team(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    team_name = body.get("name", "").strip()
    if not team_name:
        raise HTTPException(status_code=400, detail="Team name is required")
    existing = await db.teams.find_one({"owner_id": user["id"]})
    if existing:
        raise HTTPException(status_code=409, detail="You already have a team")
    team = {"id": str(uuid.uuid4()), "name": team_name, "owner_id": user["id"], "owner_name": user.get("full_name", ""), "owner_email": user.get("email", ""), "members": [], "created_at": datetime.now(timezone.utc).isoformat()}
    await db.teams.insert_one(team)
    del team["_id"]
    return team

@router.get("/teams")
async def get_my_team(user: dict = Depends(get_current_user)):
    team = await db.teams.find_one({"$or": [{"owner_id": user["id"]}, {"members.user_id": user["id"]}]}, {"_id": 0})
    return team

@router.post("/teams/invite")
async def invite_member(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    email = body.get("email", "").strip().lower()
    role = body.get("role", "plumber")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    team = await db.teams.find_one({"owner_id": user["id"]})
    if not team:
        raise HTTPException(status_code=404, detail="You don't have a team")
    if any(m["email"] == email for m in team.get("members", [])):
        raise HTTPException(status_code=409, detail="Member already invited")
    invited_user = await db.users.find_one({"email": email})
    member = {"id": str(uuid.uuid4()), "email": email, "user_id": invited_user["id"] if invited_user else None, "name": invited_user.get("full_name", email) if invited_user else email, "role": role, "status": "active" if invited_user else "pending", "invited_at": datetime.now(timezone.utc).isoformat()}
    await db.teams.update_one({"id": team["id"]}, {"$push": {"members": member}})
    if GMAIL_ADDRESS and GMAIL_APP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg["From"] = GMAIL_ADDRESS; msg["To"] = email
            msg["Subject"] = f"You're invited to join {team['name']} on PlumbPro!"
            invite_body = f"Hi!\n\n{user.get('full_name', 'A team leader')} has invited you to join their team \"{team['name']}\" on PlumbPro Field Companion.\n\nPlumbPro is the all-in-one field app for professional plumbers.\n\n{'Sign in to PlumbPro to see your team:' if invited_user else 'Sign up for free at:'} plumbpro-app.vercel.app\n\n- The PlumbPro Team"
            msg.attach(MIMEText(invite_body, "plain"))
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD); server.send_message(msg)
        except Exception as e:
            logger.error(f"Failed to send invite email: {e}")
    return member

@router.delete("/teams/members/{member_id}")
async def remove_member(member_id: str, user: dict = Depends(get_current_user)):
    team = await db.teams.find_one({"owner_id": user["id"]})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    await db.teams.update_one({"id": team["id"]}, {"$pull": {"members": {"id": member_id}}})
    return {"status": "removed"}

@router.get("/teams/timesheets")
async def get_team_timesheets(user: dict = Depends(get_current_user)):
    team = await db.teams.find_one({"owner_id": user["id"]})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member_ids = [m["user_id"] for m in team.get("members", []) if m.get("user_id")]
    member_ids.append(user["id"])
    timesheets = await db.timesheets.find({"user_id": {"$in": member_ids}}, {"_id": 0}).sort("date", -1).to_list(200)
    user_map = {user["id"]: user.get("full_name", "Owner")}
    for m in team.get("members", []):
        if m.get("user_id"): user_map[m["user_id"]] = m.get("name", m["email"])
    for ts in timesheets:
        ts["member_name"] = user_map.get(ts.get("user_id"), "Unknown")
    return timesheets

@router.delete("/teams")
async def delete_team(user: dict = Depends(get_current_user)):
    result = await db.teams.delete_one({"owner_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"status": "deleted"}


# ==================== VOICE NOTES ====================
@router.post("/voice-notes")
async def create_voice_note(request: Request, user: dict = Depends(get_current_user)):
    form = await request.form()
    audio_file = form.get("audio")
    job_name = form.get("job_name", "")
    if not audio_file:
        raise HTTPException(status_code=400, detail="Audio file required")
    audio_bytes = await audio_file.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")
    transcript = ""
    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        stt = OpenAISpeechToText(api_key=os.environ.get("EMERGENT_LLM_KEY"))
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as tmp:
            tmp.write(audio_bytes); tmp.flush()
            with open(tmp.name, "rb") as f:
                response = await stt.transcribe(file=f, model="whisper-1", response_format="json", language="en", prompt="Plumbing field notes. Job site observations, measurements, materials needed.")
                transcript = response.text
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        transcript = "[Transcription unavailable]"
    audio_b64 = base64.b64encode(audio_bytes).decode()
    note = {"id": str(uuid.uuid4()), "user_id": user["id"], "job_name": job_name, "transcript": transcript, "audio_data": audio_b64, "audio_type": audio_file.content_type or "audio/webm", "duration": form.get("duration", "0"), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.voice_notes.insert_one(note)
    return {"id": note["id"], "job_name": note["job_name"], "transcript": note["transcript"], "duration": note["duration"], "created_at": note["created_at"]}

@router.get("/voice-notes")
async def get_voice_notes(user: dict = Depends(get_current_user)):
    return await db.voice_notes.find({"user_id": user["id"]}, {"_id": 0, "audio_data": 0}).sort("created_at", -1).to_list(100)

@router.get("/voice-notes/{note_id}/audio")
async def get_voice_note_audio(note_id: str, t: str = None):
    if not t:
        raise HTTPException(status_code=401, detail="Token required")
    try:
        payload = jwt.decode(t, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    note = await db.voice_notes.find_one({"id": note_id, "user_id": user_id})
    if not note:
        raise HTTPException(status_code=404, detail="Voice note not found")
    audio_bytes = base64.b64decode(note["audio_data"])
    return Response(content=audio_bytes, media_type=note.get("audio_type", "audio/webm"))

@router.delete("/voice-notes/{note_id}")
async def delete_voice_note(note_id: str, user: dict = Depends(get_current_user)):
    result = await db.voice_notes.delete_one({"id": note_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Voice note not found")
    return {"status": "deleted"}


# ==================== WEATHER ====================
@router.get("/weather")
async def get_weather(lat: float = None, lon: float = None, location: str = None):
    if location and (not lat or not lon):
        async with httpx.AsyncClient(timeout=15.0) as client:
            geo = await client.get("https://geocoding-api.open-meteo.com/v1/search", params={"name": location, "count": 1, "language": "en"})
            geo_data = geo.json()
            if not geo_data.get("results"):
                raise HTTPException(status_code=404, detail="Location not found")
            result = geo_data["results"][0]
            lat = result["latitude"]; lon = result["longitude"]
            location = f"{result['name']}, {result.get('admin1', '')}, {result.get('country', '')}"
    if not lat or not lon:
        raise HTTPException(status_code=400, detail="Location required (lat/lon or location name)")
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get("https://api.open-meteo.com/v1/forecast", params={
            "latitude": lat, "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max,sunrise,sunset",
            "temperature_unit": "fahrenheit", "wind_speed_unit": "mph", "precipitation_unit": "inch", "timezone": "auto", "forecast_days": 7
        })
        weather = resp.json()
    wmo_codes = {0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Light showers", 81: "Showers", 82: "Heavy showers", 85: "Light snow showers", 86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail"}
    current = weather.get("current", {}); daily = weather.get("daily", {})
    alerts = []
    temp = current.get("temperature_2m", 70)
    if temp <= 32: alerts.append({"type": "freeze", "message": "Freeze warning! Protect exposed pipes. Risk of pipe bursting."})
    if temp >= 100: alerts.append({"type": "heat", "message": "Extreme heat! Stay hydrated. Take breaks in shade."})
    if current.get("wind_gusts_10m", 0) >= 40: alerts.append({"type": "wind", "message": "High winds! Secure materials and equipment on scaffolding."})
    if current.get("precipitation", 0) > 0: alerts.append({"type": "rain", "message": "Precipitation active. Trenches may flood. Watch for slip hazards."})
    return {
        "location": location or f"{lat}, {lon}",
        "current": {"temp": current.get("temperature_2m"), "feels_like": current.get("apparent_temperature"), "humidity": current.get("relative_humidity_2m"), "wind_speed": current.get("wind_speed_10m"), "wind_gusts": current.get("wind_gusts_10m"), "wind_direction": current.get("wind_direction_10m"), "precipitation": current.get("precipitation"), "condition": wmo_codes.get(current.get("weather_code", 0), "Unknown")},
        "alerts": alerts,
        "forecast": [{"date": daily["time"][i], "high": daily["temperature_2m_max"][i], "low": daily["temperature_2m_min"][i], "condition": wmo_codes.get(daily["weather_code"][i], "Unknown"), "precipitation": daily["precipitation_sum"][i], "wind_max": daily["wind_speed_10m_max"][i], "sunrise": daily["sunrise"][i], "sunset": daily["sunset"][i]} for i in range(len(daily.get("time", [])))]
    }


# ==================== SUPPLIERS ====================
PLUMBING_SUPPLIERS = [
    {"name": "Ferguson Enterprises", "type": "Wholesale", "website": "https://www.ferguson.com", "phone": "1-888-334-0004", "specialties": ["Pipes & Fittings", "Water Heaters", "Fixtures", "Tools"]},
    {"name": "HD Supply", "type": "Wholesale", "website": "https://www.hdsupply.com", "phone": "1-800-431-3000", "specialties": ["MRO", "Pipes", "Valves", "Fittings"]},
    {"name": "Winsupply", "type": "Wholesale", "website": "https://www.winsupply.com", "phone": "1-937-294-5331", "specialties": ["HVAC", "Plumbing", "Industrial", "Waterworks"]},
    {"name": "Hajoca Corporation", "type": "Wholesale", "website": "https://www.hajoca.com", "phone": "1-610-825-6400", "specialties": ["Pipes", "Valves", "Fittings", "Water Heaters", "Fixtures"]},
    {"name": "Johnstone Supply", "type": "Wholesale", "website": "https://www.johnstonesupply.com", "phone": "1-800-669-4328", "specialties": ["HVAC/R", "Plumbing", "Electrical"]},
    {"name": "Reece Group (Morsco)", "type": "Wholesale", "website": "https://www.reece.com", "phone": "1-877-567-7736", "specialties": ["Plumbing", "HVAC", "Waterworks"]},
    {"name": "Home Depot Pro", "type": "Retail/Pro", "website": "https://www.homedepot.com/c/Pro", "phone": "1-800-466-3337", "specialties": ["Tools", "Pipes", "Fittings", "Fixtures", "Water Heaters"]},
    {"name": "Lowe's Pro", "type": "Retail/Pro", "website": "https://www.lowes.com/l/Pro", "phone": "1-800-445-6937", "specialties": ["Tools", "Pipes", "Fittings", "Appliances"]},
    {"name": "Grainger", "type": "Industrial", "website": "https://www.grainger.com", "phone": "1-800-472-4643", "specialties": ["Safety", "Tools", "Pumps", "Valves", "Pipes"]},
    {"name": "MSC Industrial", "type": "Industrial", "website": "https://www.mscdirect.com", "phone": "1-800-645-7270", "specialties": ["Tools", "Safety", "Metalworking", "MRO"]},
    {"name": "SupplyHouse.com", "type": "Online", "website": "https://www.supplyhouse.com", "phone": "1-888-757-4774", "specialties": ["PEX", "Boilers", "Water Heaters", "Radiant Heat"]},
    {"name": "PlumbersStock", "type": "Online", "website": "https://www.plumbersstock.com", "phone": "1-801-805-4200", "specialties": ["Fixtures", "Pipes", "Valves", "Tools", "Water Heaters"]},
]

@router.get("/suppliers")
async def get_suppliers(search: str = None, type: str = None):
    results = PLUMBING_SUPPLIERS
    if search:
        s = search.lower()
        results = [sup for sup in results if s in sup["name"].lower() or any(s in sp.lower() for sp in sup["specialties"])]
    if type:
        results = [sup for sup in results if type.lower() in sup["type"].lower()]
    return results

@router.get("/suppliers/nearby")
async def get_nearby_suppliers(lat: float, lon: float):
    maps_url = f"https://www.google.com/maps/search/plumbing+supply+store/@{lat},{lon},13z"
    return {"maps_url": maps_url, "search_text": "plumbing supply store", "lat": lat, "lon": lon}
