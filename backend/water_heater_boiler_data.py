"""Water Heater & Boiler reference data — manufacturers, install, troubleshooting, codes, diagrams."""

WATER_HEATER_DATA = {
    "manufacturers": [
        {
            "id": "ao-smith",
            "name": "A.O. Smith",
            "type": "tank",
            "models": ["ProLine", "Signature Premier", "ProLine XE", "Voltex (Heat Pump)"],
            "fuel_types": ["Gas", "Electric", "Heat Pump"],
            "install": {
                "steps": [
                    "Shut off gas/electric and water supply to old unit",
                    "Drain old water heater via drain valve at bottom",
                    "Disconnect gas line/electrical, T&P valve discharge pipe, and water lines",
                    "Remove old unit (use appliance dolly — units are 100-150 lbs)",
                    "Set new unit on drain pan in approved location",
                    "Connect cold water inlet (right) and hot water outlet (left) — use dielectric unions to prevent galvanic corrosion",
                    "Install new T&P relief valve if not pre-installed — discharge pipe must run downward to within 6\" of floor or to exterior",
                    "For gas: Connect gas supply with flexible connector, apply pipe dope on male threads only, check all connections with soapy water for leaks",
                    "For gas: Connect vent to draft hood — must slope upward 1/4\" per foot to chimney",
                    "Open cold water supply and open a hot faucet to purge air from tank — run until steady flow",
                    "For gas: Light pilot per manufacturer instructions on label",
                    "For electric: Turn on breaker only after tank is full of water",
                    "Set thermostat to 120°F (recommended) — check after 1 hour"
                ],
                "warnings": [
                    "Never light pilot on a gas water heater with standing water or gas smell — evacuate and call gas company",
                    "Electric units require dedicated 240V/30A circuit — verify breaker size",
                    "Expansion tank required on closed water systems (check with local code)",
                    "Seismic straps required in earthquake zones (CA, OR, WA, etc.)"
                ]
            },
            "troubleshooting": [
                {"problem": "No hot water (gas)", "causes": ["Pilot light out", "Thermocouple failed", "Gas valve defective"], "fixes": ["Relight pilot per label instructions", "Replace thermocouple ($10-20 part, 15 min job)", "Replace gas valve assembly"]},
                {"problem": "No hot water (electric)", "causes": ["Tripped breaker", "Upper element burned out", "Upper thermostat failed"], "fixes": ["Reset breaker", "Test elements with multimeter — replace if open circuit", "Replace thermostat"]},
                {"problem": "Not enough hot water", "causes": ["Thermostat set too low", "Dip tube broken", "Sediment buildup", "Lower element failed (electric)"], "fixes": ["Increase thermostat to 120-125°F", "Replace dip tube", "Flush tank — drain 5 gallons monthly", "Test and replace lower element"]},
                {"problem": "Water too hot", "causes": ["Thermostat set too high", "Thermostat stuck closed"], "fixes": ["Lower thermostat setting", "Replace thermostat"]},
                {"problem": "Leaking from T&P valve", "causes": ["Thermal expansion (no expansion tank)", "T&P valve defective", "System pressure too high"], "fixes": ["Install expansion tank on cold supply", "Replace T&P valve", "Install PRV if street pressure >80 PSI"]},
                {"problem": "Rumbling/popping noise", "causes": ["Sediment buildup on bottom"], "fixes": ["Flush tank thoroughly — may need to remove drain valve and use shop vac for heavy sediment"]},
                {"problem": "Leaking from bottom", "causes": ["Tank corrosion (internal failure)"], "fixes": ["Cannot be repaired — replace water heater. Anode rod replacement every 3-5 years prevents this."]}
            ],
            "parts": ["Thermocouple", "Gas valve", "Anode rod (magnesium or aluminum)", "Dip tube", "T&P relief valve", "Heating elements (electric)", "Thermostats (upper/lower)", "Drain valve", "Flexible water connectors", "Dielectric unions", "Gas flex connector", "Vent pipe/draft hood"]
        },
        {
            "id": "rheem",
            "name": "Rheem",
            "type": "tank",
            "models": ["Performance", "Performance Plus", "Performance Platinum", "ProTerra (Heat Pump)", "Marathon"],
            "fuel_types": ["Gas", "Electric", "Heat Pump"],
            "install": {
                "steps": [
                    "Follow same general tank installation procedure as above",
                    "Rheem units use push-button Piezo ignition (no matches needed)",
                    "ProTerra heat pump models need 700+ cu ft of air space around unit",
                    "Heat pump models produce condensate — connect condensate drain line",
                    "Marathon models are plastic-lined — no anode rod needed, lighter weight"
                ],
                "warnings": [
                    "Rheem warranty requires professional installation for some models",
                    "Heat pump water heaters should not be in spaces below 40°F",
                    "Do not use CPVC within 6\" of heat trap nipples on gas models"
                ]
            },
            "troubleshooting": [
                {"problem": "Pilot won't stay lit", "causes": ["Dirty thermocouple tip", "Thermocouple lead loose", "Draft blowing out pilot"], "fixes": ["Clean thermocouple with fine sandpaper", "Tighten thermocouple connection at gas valve (1/4 turn past finger tight)", "Check for drafts near burner area"]},
                {"problem": "Error codes on electronic ignition", "causes": ["Igniter failure", "Flame sensor dirty", "Control board issue"], "fixes": ["Check igniter glow — replace if no glow", "Clean flame sensor with fine steel wool", "Cycle power — if code persists, replace control board"]},
                {"problem": "Slow recovery", "causes": ["Undersized unit", "Gas pressure low", "Burner dirty"], "fixes": ["Verify sizing (1st hour rating)", "Check gas pressure at manifold", "Clean burner assembly and orifice"]}
            ],
            "parts": ["Thermocouple/Flame sensor", "Igniter", "Control board", "Anode rod", "T&P valve", "Elements (electric)", "Thermostats", "Drain valve", "Heat pump compressor (ProTerra)"]
        },
        {
            "id": "bradford-white",
            "name": "Bradford White",
            "type": "tank",
            "models": ["Defender", "eF Series", "AeroTherm (Heat Pump)", "ICON System"],
            "fuel_types": ["Gas", "Electric", "Heat Pump"],
            "install": {
                "steps": [
                    "Bradford White uses the ICON System (Intelligent Control) on gas models",
                    "Integrated self-diagnostic system — LED status light on gas valve",
                    "Defender models have screen-free combustion air intake (no flame arrestor to clean)",
                    "Follow standard tank installation procedures",
                    "Hydrojet system helps reduce sediment — still flush annually"
                ],
                "warnings": [
                    "Bradford White is sold only through professional plumbing wholesalers (not retail)",
                    "ICON system gas valve is proprietary — use only BW replacement parts",
                    "Vitraglas tank lining is unique to BW — paired with specific anode rod"
                ]
            },
            "troubleshooting": [
                {"problem": "ICON LED blinking patterns", "causes": ["Various fault codes"], "fixes": ["1 blink = Normal operation", "2 blinks = Thermopile low voltage (clean/replace)", "4 blinks = Temperature exceeded limit (check thermostat/gas valve)", "5 blinks = Sensor failure (replace thermistor)", "7 blinks = Gas valve failure (replace gas valve)"]},
                {"problem": "Pilot goes out repeatedly", "causes": ["Thermopile voltage low", "Gas valve issue"], "fixes": ["Test thermopile voltage (should be >300mV open, >200mV closed)", "Replace thermopile if low"]},
                {"problem": "No hot water — ICON system", "causes": ["Power outage reset", "Gas supply off"], "fixes": ["Press and hold reset button per instructions", "Verify gas supply valve is fully open"]}
            ],
            "parts": ["ICON gas valve assembly", "Thermopile", "Thermistor", "Anode rod", "Vitraglas-lined tank", "T&P valve", "Drain valve"]
        },
        {
            "id": "navien-tankless",
            "name": "Navien",
            "type": "tankless",
            "models": ["NPE-A2 Series", "NPE-S2 Series", "NPE-2 Series", "NCB-E (Combi)"],
            "fuel_types": ["Gas (Natural/LP)"],
            "install": {
                "steps": [
                    "Mount unit on wall using included bracket — must be plumb and level",
                    "Maintain required clearances: 12\" sides, 12\" below, 36\" front",
                    "Connect 3/4\" gas supply — tankless requires higher BTU gas supply than tank units",
                    "Verify gas line sizing: typically 3/4\" for single unit, 1\" for longer runs",
                    "Connect cold and hot water lines — use isolation valves and service ports",
                    "Install condensate drain — Navien is a condensing unit, produces acidic condensate",
                    "Condensate must drain to approved location (not directly on concrete/metal)",
                    "Use 2\" or 3\" PVC for intake/exhaust venting (concentric or separate)",
                    "Maximum vent length varies by model — check installation manual",
                    "Plug in to 120V outlet (GFCI protected)",
                    "Activate NaviLink Wi-Fi control if desired",
                    "Perform gas leak test, then run hot water to verify ignition"
                ],
                "warnings": [
                    "Gas line MUST be sized properly — undersized gas line causes error code 351",
                    "Do not use corrugated stainless steel tubing (CSST) for final connection without proper bonding",
                    "Minimum 0.5 GPM flow rate required for activation",
                    "Hard water areas: install a water softener or scale prevention system",
                    "Annual flushing with white vinegar required for maintenance"
                ]
            },
            "troubleshooting": [
                {"problem": "Error E003 (Ignition failure)", "causes": ["No gas supply", "Gas valve closed", "Igniter failed", "Gas pressure too low"], "fixes": ["Check gas meter and valves", "Verify gas pressure at unit (check WC)", "Replace igniter if no spark", "Upsize gas line if pressure drops during firing"]},
                {"problem": "Error E012 (Flame loss)", "causes": ["Wind blowing down vent", "Dirty flame rod", "Condensate drain blocked"], "fixes": ["Check vent termination for wind exposure", "Clean flame rod with fine sandpaper", "Clear condensate trap and drain line"]},
                {"problem": "Error E016 (Overheating)", "causes": ["Scale buildup in heat exchanger", "Flow sensor malfunction"], "fixes": ["Descale unit with white vinegar flush (connect pump to service ports, run 45 min)", "Replace flow sensor if flush doesn't resolve"]},
                {"problem": "Error E351 (Low gas pressure)", "causes": ["Undersized gas line", "Gas meter too small", "Regulator issue"], "fixes": ["Verify gas line sizing per installation manual", "May need gas company to upgrade meter", "Check manifold pressure during full fire"]},
                {"problem": "Lukewarm water / temperature fluctuation", "causes": ["Flow rate too high", "Inlet filter clogged", "Scale buildup"], "fixes": ["Reduce flow (fewer fixtures open)", "Clean inlet cold water filter", "Descale heat exchanger"]}
            ],
            "parts": ["Igniter", "Flame rod", "Flow sensor", "PCB control board", "Heat exchanger", "Gas valve", "Mixing valve", "Inlet water filter", "Condensate trap", "Exhaust/intake vent pipes (PVC)"]
        },
        {
            "id": "rinnai-tankless",
            "name": "Rinnai",
            "type": "tankless",
            "models": ["RU199 (Ultra Series)", "RU160", "RE199 (SE+ Series)", "V65/V75 (Value Series)", "RSC (Sensei)"],
            "fuel_types": ["Gas (Natural/LP)"],
            "install": {
                "steps": [
                    "Mount unit on exterior wall or interior wall with proper venting",
                    "Rinnai offers concentric vent kits for through-wall installation",
                    "Connect 3/4\" gas line (verify sizing for BTU demand)",
                    "Install isolation valves and service valves on hot and cold lines",
                    "Connect condensate drain (condensing models only — RU series)",
                    "Non-condensing models (V series) require Category III stainless steel vent",
                    "Plug into dedicated 120V GFCI outlet",
                    "Program temperature via front panel (factory default 120°F)",
                    "Run system diagnostic from control panel",
                    "Enable Rinnai Control-R Wi-Fi module if equipped"
                ],
                "warnings": [
                    "Non-condensing models MUST use stainless steel or approved vent material (not PVC)",
                    "Condensing models (RU) can use PVC/CPVC venting",
                    "Minimum gas line sizing: 3/4\" up to 24 ft, 1\" for longer runs",
                    "Recirculation models require a dedicated return line or crossover valve"
                ]
            },
            "troubleshooting": [
                {"problem": "Error 11 (No ignition)", "causes": ["Gas supply off", "Igniter worn", "Gas solenoid valve stuck"], "fixes": ["Verify gas supply and pressure", "Replace igniter", "Replace gas solenoid valve assembly"]},
                {"problem": "Error 12 (Flame failure)", "causes": ["Wind/downdraft", "Dirty flame rod", "Vent blockage"], "fixes": ["Check vent termination", "Clean or replace flame rod", "Inspect vent for obstructions (bird nests, ice)"]},
                {"problem": "Error 14 (Thermal fuse)", "causes": ["Overheating due to scale or blocked vent"], "fixes": ["Descale heat exchanger", "Check vent clearances", "Replace thermal fuse if blown"]},
                {"problem": "LC error codes (Scale buildup)", "causes": ["Hard water deposits in heat exchanger"], "fixes": ["Flush with white vinegar via service ports for 60 minutes", "Install water treatment if recurring"]}
            ],
            "parts": ["Igniter", "Flame rod", "Thermal fuse", "PCB board", "Heat exchanger", "Gas solenoid valves", "Flow control valve", "Water inlet filter", "Vent adapters"]
        },
        {
            "id": "noritz-tankless",
            "name": "Noritz",
            "type": "tankless",
            "models": ["EZ Series", "NRCP (Condensing)", "NRC (Condensing)", "GQ Series"],
            "fuel_types": ["Gas (Natural/LP)"],
            "install": {
                "steps": [
                    "Wall mount using included template and bracket",
                    "Available in indoor, outdoor, and direct vent configurations",
                    "Connect gas, hot, and cold water with isolation and service valves",
                    "Condensing models: install condensate neutralizer and drain",
                    "Use approved vent materials per model (PVC for condensing, SS for non-condensing)",
                    "Connect 120V power supply",
                    "Commission unit per startup checklist in manual",
                    "Set temperature via digital controller"
                ],
                "warnings": [
                    "EZ Series designed for easy replacement of standard tank units",
                    "Annual maintenance flush required",
                    "Outdoor models must be protected from freezing (built-in freeze protection needs power)"
                ]
            },
            "troubleshooting": [
                {"problem": "Error 11 (Ignition failure)", "causes": ["No gas", "Igniter issue", "Gas pressure low"], "fixes": ["Check gas supply", "Replace igniter", "Verify gas pressure"]},
                {"problem": "Error 12 (Flame out)", "causes": ["Wind", "Dirty flame rod", "Vent issue"], "fixes": ["Check vent termination", "Clean flame rod", "Clear vent obstruction"]},
                {"problem": "Error 73 (Fin thermostat circuit)", "causes": ["Overheat condition"], "fixes": ["Check for scale buildup", "Verify venting", "May need board replacement"]}
            ],
            "parts": ["Igniter", "Flame rod", "Control board", "Heat exchanger", "Gas valve", "Flow sensor", "Condensate neutralizer"]
        }
    ],
    "multi_heater_piping": [
        {
            "id": "series",
            "name": "Series Piping",
            "description": "Water flows through one heater, then the next. Simple but uneven load.",
            "use_case": "When one unit boosts temperature from the first. Common for large demand.",
            "diagram_lines": [
                "COLD IN ──→ [WH #1] ──→ [WH #2] ──→ HOT OUT",
                "",
                "Pros: Simple piping, less fittings",
                "Cons: First unit works harder, uneven wear"
            ]
        },
        {
            "id": "parallel",
            "name": "Parallel Piping",
            "description": "Both heaters share the load equally via a common header.",
            "use_case": "Most common for equal-sized units. Provides redundancy.",
            "diagram_lines": [
                "                 ┌──→ [WH #1] ──┐",
                "COLD IN ── TEE ──┤               ├── TEE ── HOT OUT",
                "                 └──→ [WH #2] ──┘",
                "",
                "Pros: Even load, redundancy if one fails",
                "Cons: Needs balancing valves for equal flow"
            ]
        },
        {
            "id": "reverse-return",
            "name": "Reverse Return",
            "description": "Balanced parallel system where last unit connected to supply is first connected to return.",
            "use_case": "Best for 3+ units. Ensures equal flow without balancing valves.",
            "diagram_lines": [
                "COLD IN ──→ WH#1 ──→ WH#2 ──→ WH#3",
                "HOT OUT ←── WH#1 ←── WH#2 ←── WH#3",
                "",
                "First connected to cold = Last connected to hot",
                "Pros: Self-balancing, even temperatures",
                "Cons: More piping, higher install cost"
            ]
        }
    ],
    "codes": {
        "upc": [
            {"code": "UPC 507.0", "title": "Water Heater Installation", "text": "Water heaters shall be installed in accordance with manufacturer's instructions and this code."},
            {"code": "UPC 507.2", "title": "Location", "text": "Water heaters shall be located in areas with adequate combustion air and where they are accessible for service, repair, and replacement."},
            {"code": "UPC 507.3", "title": "T&P Relief Valve", "text": "Each water heater shall be provided with an approved ASME-rated T&P relief valve. Discharge pipe shall terminate within 6 inches of the floor or to the exterior."},
            {"code": "UPC 507.5", "title": "Drain Pan", "text": "Where water heaters are installed in locations where leakage may cause damage, a drain pan shall be installed under the water heater."},
            {"code": "UPC 507.13", "title": "Expansion Tanks", "text": "Where a backflow prevention device or check valve is installed on the cold water supply, an expansion tank shall be installed."},
            {"code": "UPC 510.0", "title": "Tankless Water Heaters", "text": "Tankless water heaters shall be installed per manufacturer's installation instructions and shall comply with all applicable provisions of this code."},
            {"code": "UPC 510.5", "title": "Condensate Disposal", "text": "Condensate from condensing water heaters shall be disposed of in accordance with the manufacturer's instructions and this code."}
        ],
        "ipc": [
            {"code": "IPC 501.1", "title": "Water Heater Installation", "text": "Water heaters shall be installed in accordance with the manufacturer's installation instructions and this code."},
            {"code": "IPC 501.2", "title": "Approval", "text": "All water heaters shall be listed and labeled by an approved agency."},
            {"code": "IPC 501.5", "title": "T&P Relief Valve", "text": "Water heaters shall be provided with ASME-rated T&P relief valves. Discharge to safe location."},
            {"code": "IPC 501.8", "title": "Drain Pans", "text": "Where water heaters are installed in locations where leakage could cause damage, a galvanized steel or other approved pan shall be provided."},
            {"code": "IPC 504.0", "title": "Tankless Water Heaters", "text": "Instantaneous water heaters shall be installed per manufacturer's instructions and shall comply with applicable code provisions."},
            {"code": "IPC 607.3.2", "title": "Expansion Tank", "text": "A pressure expansion tank shall be installed where a check valve or backflow preventer is installed in the cold water supply."}
        ],
        "gas_code": [
            {"code": "IFGC 301.3", "title": "Gas Piping Sizing", "text": "Gas piping shall be sized to deliver the required volume of gas to each appliance at not less than the minimum supply pressure."},
            {"code": "IFGC 303.3", "title": "Combustion Air", "text": "Fuel-burning appliances shall be provided with combustion air in accordance with this chapter."},
            {"code": "IFGC 501.8", "title": "Venting of Gas Appliances", "text": "Gas water heaters shall be vented to the outdoors per this code. Category I: Natural draft. Category III/IV: Forced/power vent."},
            {"code": "IFGC 614.0", "title": "Tankless Gas Appliances", "text": "Tankless gas water heaters shall comply with all applicable venting, gas supply, and clearance requirements."}
        ],
        "mechanical_code": [
            {"code": "IMC 301.3", "title": "Clearances", "text": "Mechanical equipment shall be installed with required clearances to combustible materials per manufacturer's listing."},
            {"code": "IMC 501.3", "title": "Exhaust Venting", "text": "Power-vented and direct-vent water heaters shall be vented per manufacturer's instructions with approved materials."}
        ]
    }
}


BOILER_DATA = {
    "manufacturers": [
        {
            "id": "weil-mclain",
            "name": "Weil-McLain",
            "type": "boiler",
            "models": ["ECO Tec", "Evergreen", "WM97+", "Ultra Gas Series", "GV90+ (Steam)", "CGa (Cast Iron)"],
            "fuel_types": ["Gas", "Oil"],
            "install": {
                "steps": [
                    "Set boiler on level, non-combustible surface",
                    "Connect supply and return piping — use primary/secondary piping for mod-con boilers",
                    "Install air separator on supply side, expansion tank on return",
                    "Connect gas supply with proper sizing for BTU input",
                    "Condensing models: connect condensate drain with neutralizer",
                    "Connect venting: PVC/CPVC for condensing, AL29-4C stainless for non-condensing",
                    "Wire thermostat/zone controls and outdoor reset sensor",
                    "Fill system, purge air from all zones",
                    "Fire boiler and verify operation, check gas pressure and flue temps"
                ],
                "warnings": [
                    "Primary/secondary piping is critical for modulating-condensing boilers",
                    "Cast iron boilers: maintain return water temp >140°F to prevent thermal shock",
                    "Always install low water cutoff on steam boilers",
                    "Condensate is acidic (pH 3-4) — must be neutralized before drain"
                ]
            },
            "troubleshooting": [
                {"problem": "No heat", "causes": ["Thermostat not calling", "No power to boiler", "Gas supply off", "Ignition failure"], "fixes": ["Check thermostat setting and wiring", "Check power switch, breaker, fuse", "Verify gas valve open", "Check igniter and flame sensor"]},
                {"problem": "Short cycling", "causes": ["Oversized boiler", "Low water flow", "Air in system", "Thermostat differential too small"], "fixes": ["Verify BTU sizing matches heat loss", "Check pump operation and flow rate", "Purge air from system", "Adjust thermostat differential"]},
                {"problem": "Banging/knocking (kettling)", "causes": ["Scale buildup in heat exchanger", "Low water flow"], "fixes": ["Flush and descale system", "Check pump and clean strainer"]},
                {"problem": "Leaking from boiler", "causes": ["Relief valve releasing (pressure too high)", "Heat exchanger crack"], "fixes": ["Check expansion tank charge and system pressure", "If heat exchanger cracked, replacement required"]}
            ],
            "parts": ["Igniter/HSI", "Flame sensor", "Gas valve", "Circulator pump", "Expansion tank", "Air separator", "Low water cutoff", "Aquastat/Control board", "Heat exchanger", "Zone valves", "Condensate neutralizer"]
        },
        {
            "id": "burnham",
            "name": "Burnham (US Boiler)",
            "type": "boiler",
            "models": ["Alpine", "K2 (Condensing)", "Series 2 (Cast Iron)", "IN-Series (Steam)"],
            "fuel_types": ["Gas", "Oil"],
            "install": {
                "steps": [
                    "Follow standard boiler installation procedures",
                    "Alpine and K2 are wall-hung condensing boilers — mount securely on rated wall bracket",
                    "Series 2 cast iron boilers are floor-standing — level on concrete pad",
                    "Connect near-boiler piping per installation manual piping diagrams",
                    "Steam boilers: install Hartford Loop, low water cutoff, and sight glass"
                ],
                "warnings": [
                    "Alpine requires minimum system water volume — add buffer tank if needed",
                    "Cast iron boilers: prevent cold water return (thermal shock cracks sections)",
                    "Steam boilers: water quality is critical — test and treat as needed"
                ]
            },
            "troubleshooting": [
                {"problem": "Alpine error codes", "causes": ["Various faults displayed on LCD"], "fixes": ["E01 = Ignition failure (check gas, igniter)", "E02 = Flame loss (check flame rod, vent)", "E04 = High limit (check flow, pump)", "E10 = Low water pressure (fill system, check expansion tank)"]},
                {"problem": "Steam boiler no heat", "causes": ["Low water (cutoff tripped)", "Pressuretrol set wrong"], "fixes": ["Check water level in sight glass, add water", "Adjust pressuretrol (typical: cut-in 0.5 PSI, differential 1 PSI)"]},
                {"problem": "Wet steam / water hammer", "causes": ["Piping not properly pitched", "Oversized boiler"], "fixes": ["All steam pipes must pitch back toward boiler (1\" per 10 ft minimum)", "Verify boiler sizing matches system EDR"]}
            ],
            "parts": ["Igniter", "Flame rod", "Control board", "Gas valve", "Circulator pump", "Pressuretrol (steam)", "Low water cutoff", "Sight glass", "Expansion tank", "Air vent"]
        },
        {
            "id": "navien-boiler",
            "name": "Navien",
            "type": "boiler",
            "models": ["NCB-E (Combi Boiler)", "NHB (Heating Boiler)", "NFB (Fire Tube)"],
            "fuel_types": ["Gas"],
            "install": {
                "steps": [
                    "Wall mount using included bracket (condensing, lightweight)",
                    "NCB-E Combi: provides both space heating AND domestic hot water",
                    "Connect heating supply/return and DHW cold/hot lines (combi)",
                    "Install condensate drain with neutralizer",
                    "Connect PVC venting (concentric or dual pipe)",
                    "Wire thermostat, outdoor reset sensor, and optional NaviLink Wi-Fi",
                    "Fill system, purge air, commission"
                ],
                "warnings": [
                    "Combi boilers have limited DHW capacity — not ideal for large homes with multiple bathrooms",
                    "Requires 3/4\" minimum gas supply, 1\" preferred",
                    "Annual maintenance flush required for heat exchanger"
                ]
            },
            "troubleshooting": [
                {"problem": "E003 (Ignition failure)", "causes": ["Gas supply issue", "Igniter failure"], "fixes": ["Check gas supply and pressure", "Replace igniter"]},
                {"problem": "E012 (Flame loss)", "causes": ["Vent blockage", "Dirty flame rod"], "fixes": ["Inspect and clear vent", "Clean flame rod"]},
                {"problem": "E030 (Exhaust overheat)", "causes": ["Scale in heat exchanger", "Vent restriction"], "fixes": ["Descale heat exchanger", "Check vent for blockage"]},
                {"problem": "Combi: no DHW but heating works", "causes": ["Flow sensor issue", "DHW mixing valve stuck"], "fixes": ["Test flow sensor", "Replace or clean mixing valve"]}
            ],
            "parts": ["Igniter", "Flame rod", "Flow sensor", "PCB", "Heat exchanger", "Mixing valve (combi)", "Condensate trap", "Expansion tank"]
        },
        {
            "id": "rinnai-boiler",
            "name": "Rinnai",
            "type": "boiler",
            "models": ["i-Series (i060SN, i120SN)", "M-Series (Condensing)"],
            "fuel_types": ["Gas"],
            "install": {
                "steps": [
                    "Wall-hung condensing boiler installation",
                    "i-Series can be cascaded (up to 16 units) for large commercial applications",
                    "Connect primary/secondary piping with hydraulic separator",
                    "PVC venting up to 100 ft equivalent length",
                    "Connect outdoor reset sensor for maximum efficiency"
                ],
                "warnings": [
                    "Cascading systems require Rinnai cascade controller",
                    "Minimum return water temp not required (condensing design)",
                    "Must maintain minimum system pressure"
                ]
            },
            "troubleshooting": [
                {"problem": "Error 11 (No ignition)", "causes": ["Gas issue", "Igniter"], "fixes": ["Check gas supply", "Replace igniter"]},
                {"problem": "Error 12 (Flame out)", "causes": ["Vent issue", "Flame rod"], "fixes": ["Clear vent", "Clean flame rod"]},
                {"problem": "Error 14 (Overheat)", "causes": ["Flow restriction", "Scale"], "fixes": ["Check pump and flow", "Descale heat exchanger"]}
            ],
            "parts": ["Igniter", "Flame rod", "PCB", "Gas valve", "Heat exchanger", "Circulator pump", "Cascade controller"]
        },
        {
            "id": "lochinvar",
            "name": "Lochinvar",
            "type": "boiler",
            "models": ["KNIGHT (Floor-standing)", "CREST (Condensing)", "Noble (Combi)"],
            "fuel_types": ["Gas"],
            "install": {
                "steps": [
                    "KNIGHT and CREST are high-efficiency condensing boilers",
                    "SMART SYSTEM control with touchscreen interface",
                    "Follow near-boiler piping diagrams in manual — primary/secondary required",
                    "Outdoor reset is built-in — connect sensor",
                    "KNIGHT can cascade up to 8 units with built-in cascade logic"
                ],
                "warnings": [
                    "SMART SYSTEM controller handles most settings — do not bypass",
                    "Condensate neutralizer required per code",
                    "Stainless steel heat exchanger — use proper water treatment"
                ]
            },
            "troubleshooting": [
                {"problem": "Lockout", "causes": ["Ignition failure", "Flame loss", "High limit"], "fixes": ["Check error code on SMART SYSTEM display", "Press reset button after resolving cause", "Common: check gas pressure, clean flame rod, verify venting"]},
                {"problem": "Low efficiency", "causes": ["Return water too hot", "Dirty heat exchanger"], "fixes": ["Adjust outdoor reset curve to lower supply temp", "Descale heat exchanger"]}
            ],
            "parts": ["Igniter", "Flame rod", "SMART SYSTEM controller", "Gas valve", "Stainless heat exchanger", "Circulator", "Condensate neutralizer"]
        },
        {
            "id": "buderus",
            "name": "Buderus (Bosch)",
            "type": "boiler",
            "models": ["GB142 (Wall-hung Condensing)", "GB162 (Commercial)", "G215 (Cast Iron Oil)", "SSB (Stainless Steel)"],
            "fuel_types": ["Gas", "Oil"],
            "install": {
                "steps": [
                    "GB142 is a popular residential condensing boiler — wall mount",
                    "Buderus uses Bosch control systems — wire per control manual",
                    "Connect AL-29 4C stainless vent (non-condensing) or PVC (condensing)",
                    "G215 oil boilers: install oil supply line with filter and fire-safe valve",
                    "Primary/secondary piping recommended for all mod-con models"
                ],
                "warnings": [
                    "Buderus parts are specific — use only Bosch/Buderus replacement components",
                    "Oil boilers require annual combustion testing and nozzle replacement",
                    "GB142 requires specific pump speed settings for proper delta-T"
                ]
            },
            "troubleshooting": [
                {"problem": "GB142 fault codes", "causes": ["Various"], "fixes": ["E1 = No flame (check gas, igniter, flame ionization)", "E2 = False flame (check flame rod, wiring)", "E9 = High limit (check flow, air in system)", "Reset via front panel button"]},
                {"problem": "Oil boiler won't fire", "causes": ["No oil", "Nozzle clogged", "Electrodes misaligned", "Oil pump filter dirty"], "fixes": ["Check oil tank level", "Replace nozzle", "Adjust electrodes per spec", "Clean or replace oil pump strainer/filter"]}
            ],
            "parts": ["Igniter/Electrodes", "Flame rod/CAD cell (oil)", "Control board", "Gas valve / Oil pump", "Nozzle (oil)", "Heat exchanger", "Circulator", "Expansion tank"]
        }
    ],
    "multi_boiler_piping": [
        {
            "id": "primary-secondary",
            "name": "Primary/Secondary Piping",
            "description": "Hydraulically separates boiler from system. Essential for mod-con boilers.",
            "diagram_lines": [
                "BOILER → closely-spaced tees → PRIMARY LOOP",
                "PRIMARY LOOP → closely-spaced tees → ZONE CIRCUITS",
                "",
                "Key: Tees must be max 4 pipe diameters apart",
                "Each boiler and each zone has its own pump"
            ]
        },
        {
            "id": "parallel-header",
            "name": "Parallel Header (Cascade)",
            "description": "Multiple boilers connected to a common supply/return header.",
            "diagram_lines": [
                "         ┌── [BOILER 1] ──┐",
                "HEADER ──┤── [BOILER 2] ──├── HEADER",
                "         └── [BOILER 3] ──┘",
                "",
                "Cascade controller fires boilers in sequence based on demand",
                "Each boiler has isolation valves for service"
            ]
        },
        {
            "id": "reverse-return-boiler",
            "name": "Reverse Return",
            "description": "Balances flow across multiple boilers without balancing valves.",
            "diagram_lines": [
                "SUPPLY: B1 ──→ B2 ──→ B3 ──→",
                "RETURN: B1 ←── B2 ←── B3 ←──",
                "",
                "First in supply = Last in return (equal pipe length)",
                "Self-balancing for equal flow distribution"
            ]
        }
    ],
    "codes": {
        "upc": [
            {"code": "UPC 505.0", "title": "Boiler Connections", "text": "Hot water boilers shall have proper safety relief valves, expansion tanks, and low water cutoffs per this code."},
            {"code": "UPC 505.2", "title": "Safety Relief Valve", "text": "Each boiler shall be equipped with an ASME-rated safety relief valve sized per boiler BTU input."},
            {"code": "UPC 505.3", "title": "Expansion Tank", "text": "A properly sized expansion tank shall be installed on every hot water heating system."}
        ],
        "ipc": [
            {"code": "IPC 1003.1", "title": "Boiler Installation", "text": "Boilers shall be installed per manufacturer's instructions and applicable codes."},
            {"code": "IPC 1003.2", "title": "Safety Devices", "text": "Required: ASME relief valve, low water cutoff (steam), expansion tank (hydronic)."}
        ],
        "gas_code": [
            {"code": "IFGC 301.3", "title": "Gas Piping for Boilers", "text": "Gas supply piping to boilers shall be sized per BTU input requirements."},
            {"code": "IFGC 501.8", "title": "Boiler Venting", "text": "Boiler venting shall comply with manufacturer's instructions. Category IV appliances may use PVC."},
            {"code": "IFGC 621.0", "title": "Combustion Air", "text": "Boiler rooms shall have adequate combustion and ventilation air per this chapter."}
        ],
        "mechanical_code": [
            {"code": "IMC 1001.1", "title": "Boiler Installation", "text": "Boilers shall comply with this code, manufacturer instructions, and ASME standards."},
            {"code": "IMC 1003.0", "title": "Clearances", "text": "Maintain clearances to combustibles per listing and manufacturer's instructions."},
            {"code": "IMC 1005.0", "title": "Boiler Room Requirements", "text": "Boiler rooms shall have adequate access, drainage, and combustion air."},
            {"code": "IMC 1006.0", "title": "Safety Controls", "text": "Operating controls, limit controls, and safety relief valves required on all boilers."}
        ]
    }
}
