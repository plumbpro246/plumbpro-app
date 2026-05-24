"""Notes, Timesheets, Materials, Bids, Calendar CRUD routes."""
from fastapi import APIRouter, Depends, HTTPException
from routes.deps import (
    db, uuid, datetime, timezone, List,
    NoteCreate, NoteUpdate, NoteResponse,
    TimesheetEntry, TimesheetResponse,
    MaterialListCreate, MaterialListResponse,
    BidCreate, BidResponse,
    CommonMaterialCreate, CommonMaterialResponse,
    CalendarEvent, CalendarEventResponse,
    get_current_user
)

router = APIRouter()


# ==================== NOTES ====================
@router.post("/notes", response_model=NoteResponse)
async def create_note(note: NoteCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    note_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "title": note.title, "content": note.content, "job_id": note.job_id, "tags": note.tags, "created_at": now, "updated_at": now}
    await db.notes.insert_one(note_doc)
    return NoteResponse(**note_doc)

@router.get("/notes", response_model=List[NoteResponse])
async def get_notes(user: dict = Depends(get_current_user)):
    return await db.notes.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note: NoteUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in note.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.notes.update_one({"id": note_id, "user_id": user["id"]}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    updated = await db.notes.find_one({"id": note_id}, {"_id": 0})
    return NoteResponse(**updated)

@router.delete("/notes/{note_id}")
async def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    result = await db.notes.delete_one({"id": note_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted"}


# ==================== TIMESHEETS ====================
@router.post("/timesheets", response_model=TimesheetResponse)
async def create_timesheet(entry: TimesheetEntry, user: dict = Depends(get_current_user)):
    start = datetime.strptime(entry.start_time, "%H:%M")
    end = datetime.strptime(entry.end_time, "%H:%M")
    diff = (end - start).total_seconds() / 3600
    hours_worked = max(0, diff - (entry.break_minutes / 60))
    now = datetime.now(timezone.utc).isoformat()
    timesheet_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "job_name": entry.job_name, "job_id": entry.job_id, "date": entry.date, "start_time": entry.start_time, "end_time": entry.end_time, "break_minutes": entry.break_minutes, "hours_worked": round(hours_worked, 2), "notes": entry.notes, "created_at": now}
    await db.timesheets.insert_one(timesheet_doc)
    return TimesheetResponse(**timesheet_doc)

@router.get("/timesheets", response_model=List[TimesheetResponse])
async def get_timesheets(user: dict = Depends(get_current_user)):
    return await db.timesheets.find({"user_id": user["id"]}, {"_id": 0}).sort("date", -1).to_list(1000)

@router.delete("/timesheets/{timesheet_id}")
async def delete_timesheet(timesheet_id: str, user: dict = Depends(get_current_user)):
    result = await db.timesheets.delete_one({"id": timesheet_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return {"status": "deleted"}


# ==================== MATERIALS ====================
@router.post("/materials", response_model=MaterialListResponse)
async def create_material_list(material_list: MaterialListCreate, user: dict = Depends(get_current_user)):
    items = [item.model_dump() for item in material_list.items]
    total_cost = sum(item["quantity"] * item["unit_price"] for item in items)
    now = datetime.now(timezone.utc).isoformat()
    material_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "job_name": material_list.job_name, "job_id": material_list.job_id, "items": items, "total_cost": round(total_cost, 2), "created_at": now, "updated_at": now}
    await db.material_lists.insert_one(material_doc)
    return MaterialListResponse(**material_doc)

@router.get("/materials", response_model=List[MaterialListResponse])
async def get_material_lists(user: dict = Depends(get_current_user)):
    return await db.material_lists.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@router.delete("/materials/{material_id}")
async def delete_material_list(material_id: str, user: dict = Depends(get_current_user)):
    result = await db.material_lists.delete_one({"id": material_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material list not found")
    return {"status": "deleted"}


# ==================== BIDS ====================
@router.post("/bids", response_model=BidResponse)
async def create_bid(bid: BidCreate, user: dict = Depends(get_current_user)):
    labor_cost = bid.labor_hours * bid.hourly_rate
    # If materials list provided, compute total from items; otherwise use scalar material_cost
    if bid.materials:
        material_total = sum(m.quantity * m.unit_price for m in bid.materials)
        materials_dump = [m.model_dump() for m in bid.materials]
    else:
        material_total = bid.material_cost
        materials_dump = None
    subtotal = labor_cost + material_total
    markup_amount = subtotal * (bid.markup_percent / 100)
    total_bid = subtotal + markup_amount
    now = datetime.now(timezone.utc).isoformat()
    bid_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "job_name": bid.job_name, "client_name": bid.client_name, "client_contact": bid.client_contact, "description": bid.description, "labor_hours": bid.labor_hours, "hourly_rate": bid.hourly_rate, "labor_cost": round(labor_cost, 2), "material_cost": round(material_total, 2), "materials": materials_dump, "markup_percent": bid.markup_percent, "markup_amount": round(markup_amount, 2), "total_bid": round(total_bid, 2), "status": "draft", "notes": bid.notes, "created_at": now}
    await db.bids.insert_one(bid_doc)
    return BidResponse(**bid_doc)

@router.get("/bids", response_model=List[BidResponse])
async def get_bids(user: dict = Depends(get_current_user)):
    return await db.bids.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@router.put("/bids/{bid_id}/status")
async def update_bid_status(bid_id: str, status: str, user: dict = Depends(get_current_user)):
    if status not in ["draft", "sent", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.bids.update_one({"id": bid_id, "user_id": user["id"]}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bid not found")
    return {"status": "updated"}

@router.delete("/bids/{bid_id}")
async def delete_bid(bid_id: str, user: dict = Depends(get_current_user)):
    result = await db.bids.delete_one({"id": bid_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bid not found")
    return {"status": "deleted"}


# ==================== COMMON MATERIALS (saved favorites for bids) ====================
async def _get_user_team(user_id: str):
    """Return the team document the user belongs to (as owner or member), or None."""
    return await db.teams.find_one(
        {"$or": [{"owner_id": user_id}, {"members.user_id": user_id}]},
        {"_id": 0}
    )

@router.get("/common-materials", response_model=List[CommonMaterialResponse])
async def get_common_materials(user: dict = Depends(get_current_user)):
    team = await _get_user_team(user["id"])
    if team:
        query = {"$or": [{"user_id": user["id"]}, {"team_id": team["id"]}]}
    else:
        query = {"user_id": user["id"]}
    return await db.common_materials.find(query, {"_id": 0}).sort("name", 1).to_list(500)

@router.post("/common-materials", response_model=CommonMaterialResponse)
async def create_common_material(item: CommonMaterialCreate, user: dict = Depends(get_current_user)):
    name_clean = item.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Material name required")

    team_id = None
    shared_by_name = None
    if item.shared:
        team = await _get_user_team(user["id"])
        if not team:
            raise HTTPException(status_code=400, detail="Create or join a team first to share materials")
        team_id = team["id"]
        shared_by_name = user.get("full_name") or user.get("email")

    # Avoid duplicates within same scope
    duplicate_query = {"name": name_clean}
    if team_id:
        duplicate_query["team_id"] = team_id
    else:
        duplicate_query["user_id"] = user["id"]
        duplicate_query["team_id"] = None
    existing = await db.common_materials.find_one(duplicate_query)
    now = datetime.now(timezone.utc).isoformat()
    if existing:
        await db.common_materials.update_one(
            {"id": existing["id"]},
            {"$set": {"unit_price": item.unit_price}}
        )
        existing["unit_price"] = item.unit_price
        return CommonMaterialResponse(**{k: v for k, v in existing.items() if k != "_id"})

    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": name_clean,
        "unit_price": item.unit_price,
        "team_id": team_id,
        "shared_by_name": shared_by_name,
        "created_at": now,
    }
    await db.common_materials.insert_one(doc)
    return CommonMaterialResponse(**{k: v for k, v in doc.items() if k != "_id"})

@router.delete("/common-materials/{item_id}")
async def delete_common_material(item_id: str, user: dict = Depends(get_current_user)):
    mat = await db.common_materials.find_one({"id": item_id}, {"_id": 0})
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    # User can delete their own; team owner can delete team-shared
    is_owner = mat.get("user_id") == user["id"]
    is_team_owner = False
    if mat.get("team_id"):
        team = await db.teams.find_one({"id": mat["team_id"], "owner_id": user["id"]})
        is_team_owner = team is not None
    if not (is_owner or is_team_owner):
        raise HTTPException(status_code=403, detail="Not allowed to delete this material")
    await db.common_materials.delete_one({"id": item_id})
    return {"status": "deleted"}


# ==================== CALENDAR ====================
@router.post("/calendar", response_model=CalendarEventResponse)
async def create_event(event: CalendarEvent, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    event_doc = {"id": str(uuid.uuid4()), "user_id": user["id"], **event.model_dump(), "created_at": now}
    await db.calendar_events.insert_one(event_doc)
    return CalendarEventResponse(**event_doc)

@router.get("/calendar", response_model=List[CalendarEventResponse])
async def get_events(user: dict = Depends(get_current_user)):
    return await db.calendar_events.find({"user_id": user["id"]}, {"_id": 0}).sort("date", 1).to_list(1000)

@router.delete("/calendar/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    result = await db.calendar_events.delete_one({"id": event_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "deleted"}
