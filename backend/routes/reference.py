"""Safety Talks, Formulas, OSHA, SDS, Total Station — reference & AI content."""
from fastapi import APIRouter, Depends
import math
from routes.deps import *

router = APIRouter()

# ==================== SAFETY TALKS ====================
SAFETY_TOPICS = [
    "Personal Protective Equipment (PPE)", "Confined Space Entry", "Trench Safety",
    "Hot Work Permits", "Chemical Handling", "Electrical Safety", "Ladder Safety",
    "Heat Stress Prevention", "Cold Weather Safety", "Tool Safety", "Back Injury Prevention",
    "Eye Protection", "Hand Safety", "Respiratory Protection", "Fire Prevention",
    "Slip, Trip, and Fall Prevention", "Excavation Safety", "Working at Heights",
    "Lockout/Tagout Procedures", "Emergency Response"
]

@router.get("/safety-talks/today", response_model=SafetyTalkResponse, summary="Get today's safety talk")
async def get_daily_safety_talk(user: dict = Depends(get_current_user)):
    """Returns today's AI-generated 5-minute safety talk. A new topic is auto-generated each day via GPT-4o."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.safety_talks.find_one({"date": today}, {"_id": 0})
    if existing:
        return SafetyTalkResponse(**existing)
    
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
    
    talk_doc = {"id": str(uuid.uuid4()), "title": title, "content": content, "topic": topic, "date": today, "generated_at": datetime.now(timezone.utc).isoformat()}
    await db.safety_talks.insert_one(talk_doc)
    return SafetyTalkResponse(**talk_doc)

@router.get("/safety-talks/history", response_model=List[SafetyTalkResponse])
async def get_safety_talk_history(user: dict = Depends(get_current_user)):
    return await db.safety_talks.find({}, {"_id": 0}).sort("date", -1).to_list(30)


# ==================== FORMULAS ====================
PLUMBING_FORMULAS = [
    {"id": "pipe-volume", "name": "Pipe Volume", "formula": "V = π × r² × L", "description": "Calculate volume of water in a pipe", "variables": {"r": "Pipe radius (inches)", "L": "Pipe length (feet)"}, "unit": "gallons"},
    {"id": "flow-rate", "name": "Flow Rate (GPM)", "formula": "Q = V × A", "description": "Calculate flow rate through a pipe", "variables": {"V": "Velocity (ft/s)", "A": "Cross-sectional area (sq ft)"}, "unit": "GPM"},
    {"id": "head-pressure", "name": "Head Pressure", "formula": "P = 0.433 × H", "description": "Convert feet of head to PSI", "variables": {"H": "Height of water column (feet)"}, "unit": "PSI"},
    {"id": "pipe-expansion", "name": "Pipe Thermal Expansion", "formula": "ΔL = α × L × ΔT", "description": "Calculate pipe expansion due to temperature change", "variables": {"α": "Expansion coefficient", "L": "Pipe length", "ΔT": "Temperature change"}, "unit": "inches"},
    {"id": "drainage-slope", "name": "Drainage Slope", "formula": "Drop = Length × (Slope/100)", "description": "Calculate required drop for drainage", "variables": {"Length": "Pipe length (feet)", "Slope": "Grade percentage"}, "unit": "inches"},
    {"id": "water-heater-size", "name": "Water Heater Sizing", "formula": "Size = Peak Demand × 0.7", "description": "Estimate water heater tank size", "variables": {"Peak Demand": "Peak hour demand (gallons)"}, "unit": "gallons"},
    {"id": "friction-loss", "name": "Friction Loss", "formula": "hf = f × (L/D) × (V²/2g)", "description": "Calculate friction loss in pipes (Darcy-Weisbach)", "variables": {"f": "Friction factor", "L": "Length", "D": "Diameter", "V": "Velocity"}, "unit": "feet of head"},
    {"id": "pump-horsepower", "name": "Pump Horsepower", "formula": "HP = (Q × H) / (3960 × η)", "description": "Calculate required pump horsepower", "variables": {"Q": "Flow rate (GPM)", "H": "Total head (feet)", "η": "Pump efficiency"}, "unit": "HP"},
    {"id": "offset-45", "name": "45° Pipe Offset", "formula": "Travel = Offset × 1.414", "description": "Calculate travel (fitting-to-fitting) for a 45° offset. Also gives the set (run).", "variables": {"Offset": "Offset distance (inches)"}, "unit": "inches"},
    {"id": "offset-22", "name": "22.5° Pipe Offset", "formula": "Travel = Offset × 2.613", "description": "Calculate travel (fitting-to-fitting) for a 22.5° offset. Also gives the set (run).", "variables": {"Offset": "Offset distance (inches)"}, "unit": "inches"},
]

@router.get("/formulas", summary="List all plumbing formulas")
async def get_formulas():
    """Returns all 10 plumbing formulas including pipe offset calculators (45° and 22.5°)."""
    return PLUMBING_FORMULAS

@router.post("/formulas/calculate", summary="Calculate a plumbing formula")
async def calculate_formula(formula_id: str, values: Dict[str, float]):
    """Submit variable values for a formula. Offset formulas return both travel and set (run) in extras."""
    if formula_id == "pipe-volume":
        r = values.get("r", 0); L = values.get("L", 0)
        volume_cubic_inches = math.pi * (r ** 2) * (L * 12)
        result = volume_cubic_inches / 231
    elif formula_id == "flow-rate":
        V = values.get("V", 0); A = values.get("A", 0)
        result = V * A * 448.831
    elif formula_id == "head-pressure":
        result = 0.433 * values.get("H", 0)
    elif formula_id == "pipe-expansion":
        alpha = values.get("alpha", 0.0000065); L = values.get("L", 0); delta_t = values.get("delta_t", 0)
        result = alpha * L * delta_t * 12
    elif formula_id == "drainage-slope":
        length = values.get("Length", 0); slope = values.get("Slope", 0.25)
        result = length * (slope / 100) * 12
    elif formula_id == "water-heater-size":
        result = values.get("Peak Demand", 0) * 0.7
    elif formula_id == "friction-loss":
        f = values.get("f", 0.02); L = values.get("L", 0); D = values.get("D", 1); V = values.get("V", 0)
        result = f * (L / D) * ((V ** 2) / (2 * 32.174))
    elif formula_id == "pump-horsepower":
        Q = values.get("Q", 0); H = values.get("H", 0); eta = values.get("eta", 0.7)
        result = (Q * H) / (3960 * eta)
    elif formula_id == "offset-45":
        offset = values.get("Offset", 0)
        travel = offset * 1.41421356
        set_run = offset
        return {"result": round(travel, 4), "formula_id": formula_id, "extras": {"travel": round(travel, 4), "set": round(set_run, 4)}}
    elif formula_id == "offset-22":
        offset = values.get("Offset", 0)
        travel = offset * 2.61312593
        set_run = offset * 2.41421356
        return {"result": round(travel, 4), "formula_id": formula_id, "extras": {"travel": round(travel, 4), "set": round(set_run, 4)}}
    else:
        raise HTTPException(status_code=404, detail="Formula not found")
    return {"result": round(result, 4), "formula_id": formula_id}


# ==================== OSHA ====================
OSHA_REQUIREMENTS = [
    {"id": "ppe", "category": "Personal Protective Equipment", "standard": "29 CFR 1926.95", "title": "PPE Requirements", "requirements": ["Employers must provide PPE at no cost to employees", "PPE must be properly fitted", "Training on proper use required", "Damaged PPE must be replaced immediately"], "penalties": "Up to $15,625 per violation"},
    {"id": "confined-space", "category": "Confined Spaces", "standard": "29 CFR 1926.1200-1213", "title": "Confined Space Entry", "requirements": ["Identify all permit-required confined spaces", "Develop written entry program", "Test atmosphere before entry", "Provide rescue equipment and trained personnel"], "penalties": "Up to $15,625 per violation"},
    {"id": "excavation", "category": "Excavation", "standard": "29 CFR 1926.650-652", "title": "Trenching and Excavation", "requirements": ["Trenches 5 feet or deeper require protective systems", "Competent person must inspect daily", "Safe access within 25 feet of workers", "Keep spoils at least 2 feet from edge"], "penalties": "Up to $15,625 per violation"},
    {"id": "fall-protection", "category": "Fall Protection", "standard": "29 CFR 1926.501", "title": "Fall Protection Requirements", "requirements": ["Protection required at 6 feet or more", "Guardrails, safety nets, or personal fall arrest", "Floor holes must be covered or guarded", "Training on fall hazards required"], "penalties": "Up to $15,625 per violation"},
    {"id": "hazcom", "category": "Hazard Communication", "standard": "29 CFR 1926.59", "title": "HazCom Program", "requirements": ["Written hazard communication program", "Safety Data Sheets (SDS) available", "Labels on all containers", "Employee training required"], "penalties": "Up to $15,625 per violation"},
    {"id": "electrical", "category": "Electrical Safety", "standard": "29 CFR 1926.400-449", "title": "Electrical Safety", "requirements": ["GFCI protection required on job sites", "Assured equipment grounding program", "Proper extension cord use", "Qualified persons for electrical work"], "penalties": "Up to $15,625 per violation"},
    {"id": "scaffolding", "category": "Scaffolding", "standard": "29 CFR 1926.451", "title": "Scaffold Safety", "requirements": ["Competent person to supervise erection", "Support capacity 4x intended load", "Planking fully planked and secured", "Guardrails on all open sides above 10 feet"], "penalties": "Up to $15,625 per violation"},
    {"id": "lockout-tagout", "category": "Energy Control", "standard": "29 CFR 1926.417", "title": "Lockout/Tagout", "requirements": ["Written energy control procedure", "Each worker applies own lock", "Verify zero energy state before work", "Only authorized employees remove locks"], "penalties": "Up to $15,625 per violation"},
]

@router.get("/osha", summary="List all OSHA requirements")
async def get_osha_requirements():
    """Returns 8 OSHA construction safety requirements with standards, penalties, and checklists."""
    return OSHA_REQUIREMENTS

@router.get("/osha/{requirement_id}")
async def get_osha_requirement(requirement_id: str):
    for req in OSHA_REQUIREMENTS:
        if req["id"] == requirement_id:
            return req
    raise HTTPException(status_code=404, detail="Requirement not found")


# ==================== SDS ====================
SDS_DATABASE = [
    {"id": "pvc-cement", "product_name": "PVC Cement", "manufacturer": "Generic", "hazards": ["Flammable", "Eye Irritant", "Respiratory Irritant"], "ppe_required": ["Safety Glasses", "Chemical Resistant Gloves", "Ventilation"], "first_aid": {"eye_contact": "Flush with water for 15 minutes. Seek medical attention.", "skin_contact": "Wash with soap and water.", "inhalation": "Move to fresh air. Seek medical attention if symptoms persist.", "ingestion": "Do not induce vomiting. Seek medical attention."}, "storage": "Keep away from heat and ignition sources. Store in well-ventilated area.", "disposal": "Dispose according to local regulations."},
    {"id": "flux", "product_name": "Soldering Flux", "manufacturer": "Generic", "hazards": ["Corrosive", "Skin Irritant"], "ppe_required": ["Safety Glasses", "Chemical Resistant Gloves"], "first_aid": {"eye_contact": "Flush immediately with water for 15-20 minutes.", "skin_contact": "Wash thoroughly with soap and water.", "inhalation": "Move to fresh air.", "ingestion": "Rinse mouth. Do not induce vomiting."}, "storage": "Store in cool, dry place. Keep container closed.", "disposal": "Dispose according to local regulations."},
    {"id": "propane", "product_name": "Propane (LP Gas)", "manufacturer": "Generic", "hazards": ["Extremely Flammable", "Asphyxiant", "Pressurized Container"], "ppe_required": ["Safety Glasses", "Leather Gloves for cold surfaces"], "first_aid": {"eye_contact": "Flush with water if liquid contact occurs.", "skin_contact": "For frostbite, immerse in warm water.", "inhalation": "Move to fresh air. Give oxygen if breathing difficult.", "ingestion": "Not applicable for gas."}, "storage": "Store upright in well-ventilated area away from ignition sources.", "disposal": "Return empty cylinders to supplier."},
    {"id": "thread-sealant", "product_name": "Thread Sealant (Teflon Tape/Paste)", "manufacturer": "Generic", "hazards": ["Low hazard material"], "ppe_required": ["Safety Glasses (paste)", "None typically required for tape"], "first_aid": {"eye_contact": "Flush with water.", "skin_contact": "Wash with soap and water.", "inhalation": "Not typically a concern.", "ingestion": "Not toxic, but avoid ingestion."}, "storage": "Store in cool, dry place.", "disposal": "Dispose with regular waste."},
    {"id": "drain-cleaner", "product_name": "Chemical Drain Cleaner", "manufacturer": "Generic", "hazards": ["Corrosive", "Severe Burns", "Reactive with metals"], "ppe_required": ["Face Shield", "Chemical Resistant Gloves", "Apron", "Safety Goggles"], "first_aid": {"eye_contact": "Flush immediately for 30 minutes. Seek emergency medical care.", "skin_contact": "Flush with water for 20 minutes. Remove contaminated clothing.", "inhalation": "Move to fresh air. Seek medical attention.", "ingestion": "Do NOT induce vomiting. Drink water/milk. Call poison control."}, "storage": "Store upright in original container. Keep away from metals and children.", "disposal": "Hazardous waste - dispose according to regulations."},
]

@router.get("/sds", summary="List all Safety Data Sheets")
async def get_safety_data_sheets():
    """Returns SDS entries for common plumbing chemicals (PVC cement, flux, propane, etc.)."""
    return SDS_DATABASE

@router.get("/sds/{sds_id}")
async def get_safety_data_sheet(sds_id: str):
    for sds in SDS_DATABASE:
        if sds["id"] == sds_id:
            return sds
    raise HTTPException(status_code=404, detail="SDS not found")


# ==================== TOTAL STATION ====================
TOTAL_STATION_INFO = {
    "basics": {"title": "Total Station Basics", "content": ["A total station is an electronic/optical instrument used for surveying and building construction.", "Combines EDM (Electronic Distance Measurement) with electronic theodolite.", "Measures angles and distances simultaneously.", "Data can be downloaded to a computer for analysis."]},
    "setup": {"title": "Setup Procedure", "steps": ["1. Set up tripod over known point, level roughly", "2. Mount instrument on tripod", "3. Level using circular bubble", "4. Center over point using optical/laser plummet", "5. Fine level using plate bubble", "6. Input station coordinates and height"]},
    "common_operations": {"title": "Common Operations for Plumbers", "operations": [{"name": "Grade Shooting", "description": "Establish pipe elevations and grades", "procedure": "Set benchmark, shoot points, calculate cut/fill"}, {"name": "Layout", "description": "Stake out pipe locations from plans", "procedure": "Input coordinates, navigate to point, mark location"}, {"name": "As-Built", "description": "Document installed pipe locations", "procedure": "Shoot points on installed pipes, record data"}]},
    "troubleshooting": {"title": "Troubleshooting", "issues": [{"issue": "Battery won't charge", "solution": "Check connections, try different outlet, may need new battery"}, {"issue": "Prism won't lock", "solution": "Clean prism face, check for obstructions, adjust search settings"}, {"issue": "Readings inconsistent", "solution": "Re-level instrument, check for vibration, verify setup over point"}, {"issue": "Can't communicate with controller", "solution": "Check cable connections, verify Bluetooth pairing, restart devices"}]},
    "safety": {"title": "Safety Considerations", "points": ["Never look directly at the laser beam", "Secure tripod to prevent tipping", "Protect instrument from weather", "Use proper lifting technique - instruments are heavy", "Ensure vehicle traffic awareness when working near roads"]},
}

@router.get("/total-station")
async def get_total_station_info():
    return TOTAL_STATION_INFO
