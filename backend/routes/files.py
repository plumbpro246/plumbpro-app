"""Blueprints, Photos, Plumbing Code, Export, Sync routes."""
from fastapi import APIRouter, Depends, UploadFile, File, Request
from routes.deps import *
from plumbing_codes import PLUMBING_CODES, get_plumbing_code

router = APIRouter()


# ==================== BLUEPRINTS ====================
@router.post("/blueprints")
async def upload_blueprint(name: str, description: str = "", file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    file_data = base64.b64encode(content).decode('utf-8')
    blueprint_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "name": name, "description": description, "file_name": file.filename, "file_size": len(content), "file_data": file_data, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.blueprints.insert_one(blueprint_doc)
    return {"id": blueprint_doc["id"], "name": name, "file_name": file.filename, "file_size": len(content)}

@router.get("/blueprints")
async def get_blueprints(user: dict = Depends(get_current_user)):
    return await db.blueprints.find({"user_id": user["id"]}, {"_id": 0, "file_data": 0}).sort("created_at", -1).to_list(100)

@router.get("/blueprints/{blueprint_id}")
async def get_blueprint(blueprint_id: str, user: dict = Depends(get_current_user)):
    blueprint = await db.blueprints.find_one({"id": blueprint_id, "user_id": user["id"]}, {"_id": 0})
    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return blueprint

@router.delete("/blueprints/{blueprint_id}")
async def delete_blueprint(blueprint_id: str, user: dict = Depends(get_current_user)):
    result = await db.blueprints.delete_one({"id": blueprint_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return {"status": "deleted"}


# ==================== PHOTOS ====================
@router.post("/photos")
async def upload_photo(file: UploadFile = File(...), linked_type: str = "note", linked_id: str = "", caption: str = "", user: dict = Depends(get_current_user)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and HEIC images are allowed")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    file_data = base64.b64encode(content).decode('utf-8')
    photo_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "file_name": file.filename, "file_type": file.content_type, "file_size": len(content), "file_data": file_data, "linked_type": linked_type, "linked_id": linked_id, "caption": caption, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.photos.insert_one(photo_doc)
    return {"id": photo_doc["id"], "file_name": file.filename, "file_size": len(content), "linked_type": linked_type, "linked_id": linked_id}

@router.get("/photos")
async def get_photos(linked_type: str = None, linked_id: str = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if linked_type: query["linked_type"] = linked_type
    if linked_id: query["linked_id"] = linked_id
    return await db.photos.find(query, {"_id": 0, "file_data": 0}).sort("created_at", -1).to_list(100)

@router.get("/photos/{photo_id}")
async def get_photo(photo_id: str, user: dict = Depends(get_current_user)):
    photo = await db.photos.find_one({"id": photo_id, "user_id": user["id"]}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, user: dict = Depends(get_current_user)):
    result = await db.photos.delete_one({"id": photo_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"status": "deleted"}

@router.put("/photos/{photo_id}/link")
async def link_photo(photo_id: str, linked_type: str, linked_id: str, user: dict = Depends(get_current_user)):
    result = await db.photos.update_one({"id": photo_id, "user_id": user["id"]}, {"$set": {"linked_type": linked_type, "linked_id": linked_id}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"status": "linked"}


# ==================== PLUMBING CODE ====================
@router.get("/plumbing-code")
async def get_plumbing_code_endpoint(code_type: str = "upc", edition: str = "2024", search: str = None):
    return get_plumbing_code(code_type, edition, search)

@router.get("/plumbing-code/types")
async def get_plumbing_code_types():
    result = {}
    for code_type, code_data in PLUMBING_CODES.items():
        result[code_type] = {"name": code_data["name"], "publisher": code_data["publisher"], "editions": list(code_data["editions"].keys())}
    return result

@router.get("/plumbing-code/bookmarks")
async def get_bookmarks(user: dict = Depends(get_current_user)):
    return await db.code_bookmarks.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)

@router.post("/plumbing-code/bookmarks")
async def add_bookmark(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    code_type = body.get("code_type", "upc")
    edition = body.get("edition", "2024")
    section_code = body.get("section_code")
    if not section_code:
        raise HTTPException(status_code=400, detail="section_code is required")
    existing = await db.code_bookmarks.find_one({"user_id": user["id"], "code_type": code_type, "edition": edition, "section_code": section_code})
    if existing:
        raise HTTPException(status_code=409, detail="Already bookmarked")
    bookmark = {"id": str(uuid.uuid4()), "user_id": user["id"], "code_type": code_type, "edition": edition, "section_code": section_code, "section_title": body.get("section_title", ""), "chapter_title": body.get("chapter_title", ""), "chapter_id": body.get("chapter_id", ""), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.code_bookmarks.insert_one(bookmark)
    del bookmark["_id"]
    return bookmark

@router.delete("/plumbing-code/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, user: dict = Depends(get_current_user)):
    result = await db.code_bookmarks.delete_one({"id": bookmark_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "deleted"}

@router.get("/plumbing-code/{chapter_id}")
async def get_plumbing_code_chapter(chapter_id: str, code_type: str = "upc", edition: str = "2024"):
    chapters = get_plumbing_code(code_type, edition)
    for chapter in chapters:
        if chapter["id"] == chapter_id:
            return chapter
    raise HTTPException(status_code=404, detail="Chapter not found")


# ==================== EXPORT ====================
@router.get("/export/timesheets")
async def export_timesheets(start_date: str = None, end_date: str = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if start_date: query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query: query["date"]["$lte"] = end_date
        else: query["date"] = {"$lte": end_date}
    timesheets = await db.timesheets.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    total_hours = sum(t.get("hours_worked", 0) for t in timesheets)
    jobs_summary = {}
    for t in timesheets:
        job = t.get("job_name", "Unknown")
        if job not in jobs_summary: jobs_summary[job] = {"hours": 0, "entries": 0}
        jobs_summary[job]["hours"] += t.get("hours_worked", 0)
        jobs_summary[job]["entries"] += 1
    return {"user": {"name": user.get("full_name"), "email": user.get("email"), "company": user.get("company")}, "period": {"start": start_date or "All time", "end": end_date or "Present"}, "summary": {"total_hours": round(total_hours, 2), "total_entries": len(timesheets), "jobs_summary": jobs_summary}, "entries": timesheets, "generated_at": datetime.now(timezone.utc).isoformat()}

@router.get("/export/bids/{bid_id}")
async def export_bid(bid_id: str, user: dict = Depends(get_current_user)):
    bid = await db.bids.find_one({"id": bid_id, "user_id": user["id"]}, {"_id": 0})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    return {"user": {"name": user.get("full_name"), "email": user.get("email"), "company": user.get("company")}, "bid": bid, "generated_at": datetime.now(timezone.utc).isoformat()}


# ==================== SYNC ====================
@router.get("/sync/data")
async def get_sync_data(user: dict = Depends(get_current_user)):
    notes = await db.notes.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    timesheets = await db.timesheets.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    materials = await db.material_lists.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    bids = await db.bids.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    events = await db.calendar_events.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    photos = await db.photos.find({"user_id": user["id"]}, {"_id": 0, "file_data": 0}).to_list(100)
    return {"user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "company": user.get("company"), "subscription_tier": user.get("subscription_tier", "free")}, "notes": notes, "timesheets": timesheets, "materials": materials, "bids": bids, "events": events, "photos": photos, "synced_at": datetime.now(timezone.utc).isoformat()}

@router.post("/sync/pending")
async def sync_pending_data(pending_notes: List[dict] = [], pending_timesheets: List[dict] = [], pending_events: List[dict] = [], user: dict = Depends(get_current_user)):
    synced = {"notes": 0, "timesheets": 0, "events": 0}
    for note in pending_notes:
        note["user_id"] = user["id"]; note["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.notes.update_one({"id": note["id"]}, {"$set": note}, upsert=True); synced["notes"] += 1
    for ts in pending_timesheets:
        ts["user_id"] = user["id"]; ts["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.timesheets.update_one({"id": ts["id"]}, {"$set": ts}, upsert=True); synced["timesheets"] += 1
    for event in pending_events:
        event["user_id"] = user["id"]; event["synced_at"] = datetime.now(timezone.utc).isoformat()
        await db.calendar_events.update_one({"id": event["id"]}, {"$set": event}, upsert=True); synced["events"] += 1
    return {"status": "synced", "synced_items": synced}


# ==================== NOTIFICATIONS ====================
@router.get("/notifications/settings")
async def get_notification_settings(user: dict = Depends(get_current_user)):
    settings = await db.notification_settings.find_one({"user_id": user["id"]}, {"_id": 0})
    if not settings:
        return {"user_id": user["id"], "calendar_reminders": True, "reminder_minutes_before": 30, "daily_safety_talk": True, "safety_talk_time": "07:00", "browser_notifications": False}
    return settings

@router.put("/notifications/settings")
async def update_notification_settings(calendar_reminders: bool = True, reminder_minutes_before: int = 30, daily_safety_talk: bool = True, safety_talk_time: str = "07:00", browser_notifications: bool = False, user: dict = Depends(get_current_user)):
    settings = {"user_id": user["id"], "calendar_reminders": calendar_reminders, "reminder_minutes_before": reminder_minutes_before, "daily_safety_talk": daily_safety_talk, "safety_talk_time": safety_talk_time, "browser_notifications": browser_notifications, "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.notification_settings.update_one({"user_id": user["id"]}, {"$set": settings}, upsert=True)
    return settings

@router.get("/notifications/upcoming")
async def get_upcoming_notifications(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return await db.calendar_events.find({"user_id": user["id"], "date": {"$gte": today}}, {"_id": 0}).sort("date", 1).to_list(20)
