"""Plumbing fixtures reference data — manufacturers, parts, troubleshooting, repair."""

FIXTURES_DATA = {
    "categories": [
        {
            "id": "toilets",
            "name": "Toilets",
            "manufacturers": [
                {
                    "id": "kohler-toilet",
                    "name": "Kohler",
                    "models": ["Cimarron", "Highline", "Santa Rosa", "Wellworth", "Memoirs"],
                    "parts": [
                        {"name": "Flush Valve Seal (Canister)", "part_no": "GP1059291", "fits": "Cimarron, Santa Rosa, most Aquapiston models"},
                        {"name": "Fill Valve", "part_no": "GP1083167", "fits": "Most Kohler toilets"},
                        {"name": "Flapper 2\" (older models)", "part_no": "GP84995", "fits": "Wellworth, Highline (pre-2005)"},
                        {"name": "Trip Lever (Chrome)", "part_no": "GP85112", "fits": "Most Kohler models"},
                        {"name": "Wax Ring w/ Flange", "part_no": "GP1099622", "fits": "Universal"},
                        {"name": "Tank-to-Bowl Bolt Kit", "part_no": "GP51487", "fits": "Most 2-piece Kohler"},
                        {"name": "Seat Hinge Kit", "part_no": "GP1043398", "fits": "Most Kohler seats"}
                    ],
                    "troubleshooting": [
                        {"problem": "Toilet runs constantly", "causes": ["Canister seal worn", "Fill valve not shutting off", "Flapper warped (older models)"], "fixes": ["Replace canister seal GP1059291 — twist off canister, pull old seal, press new one on", "Replace fill valve GP1083167 — shut off water, drain tank, unscrew bottom nut", "Replace flapper GP84995 — unhook ears from overflow tube posts"]},
                        {"problem": "Weak/incomplete flush", "causes": ["Rim jets clogged with mineral buildup", "Water level too low", "Flapper closing too fast"], "fixes": ["Use wire or muriatic acid solution to clear rim jets", "Adjust fill valve to raise water level to fill line", "Adjust flapper chain — leave 1/2\" slack"]},
                        {"problem": "Toilet rocks/leaks at base", "causes": ["Wax ring failed", "Closet bolts loose", "Flange too low"], "fixes": ["Replace wax ring — pull toilet, scrape old wax, set new ring, reset toilet", "Tighten closet bolts evenly (don't over-tighten — cracks porcelain)", "Use flange extender if flange is below finished floor"]},
                        {"problem": "Ghost flushing (fills randomly)", "causes": ["Slow leak from tank to bowl", "Canister seal or flapper not seating properly"], "fixes": ["Put food coloring in tank — if color appears in bowl, seal is leaking", "Replace canister seal or flapper", "Clean the valve seat with scotch-brite pad"]}
                    ]
                },
                {
                    "id": "toto-toilet",
                    "name": "TOTO",
                    "models": ["Drake", "Ultramax", "Aquia", "Promenade", "Entrada"],
                    "parts": [
                        {"name": "Fill Valve (Adjustable)", "part_no": "TSU99A.X", "fits": "Most TOTO models"},
                        {"name": "Flush Valve (3\" Flapper)", "part_no": "THU140S", "fits": "Drake, Ultramax"},
                        {"name": "Flush Valve Tower (Dual Flush)", "part_no": "THU338N", "fits": "Aquia dual-flush"},
                        {"name": "Wax Ring", "part_no": "9BW004S", "fits": "Universal TOTO"},
                        {"name": "Trip Lever", "part_no": "THU004", "fits": "Drake, Ultramax"},
                        {"name": "Tank-to-Bowl Gasket", "part_no": "9BU001E", "fits": "Drake 2-piece"}
                    ],
                    "troubleshooting": [
                        {"problem": "Running after flush", "causes": ["Flapper not seating", "Fill valve stuck open"], "fixes": ["Replace 3\" flapper THU140S", "Replace fill valve TSU99A.X — TOTO uses a proprietary valve, use OEM only"]},
                        {"problem": "Dual flush not working properly (Aquia)", "causes": ["Flush tower valve stuck", "Button linkage disconnected"], "fixes": ["Replace dual flush tower THU338N", "Reattach push button cable to tower mechanism"]},
                        {"problem": "Whistling during fill", "causes": ["Fill valve debris or worn diaphragm"], "fixes": ["Remove fill valve cap, clean debris, replace diaphragm seal if worn"]}
                    ]
                },
                {
                    "id": "american-standard-toilet",
                    "name": "American Standard",
                    "models": ["Champion 4", "Cadet", "VorMax", "H2Option", "Colony"],
                    "parts": [
                        {"name": "Flush Valve Seal (Champion)", "part_no": "7381424-100.0070A", "fits": "Champion 4, Champion Pro"},
                        {"name": "Fill Valve", "part_no": "7381125-400.0070A", "fits": "Most AS models"},
                        {"name": "Flapper 2\" (Cadet)", "part_no": "738921-100.0070A", "fits": "Cadet, Colony"},
                        {"name": "Trip Lever (Chrome)", "part_no": "738772-0020A", "fits": "Most AS models"},
                        {"name": "Tank-to-Bowl Coupling Kit", "part_no": "738756-0070A", "fits": "Cadet, Champion 2-piece"}
                    ],
                    "troubleshooting": [
                        {"problem": "Champion flush valve leaking", "causes": ["Red flush valve seal deteriorated (common issue)"], "fixes": ["Replace red seal 7381424-100 — turn off water, remove flush valve tower, swap seal, reinstall"]},
                        {"problem": "VorMax swirl not strong", "causes": ["Rim jet blocked", "Low water level"], "fixes": ["Clean rim jet with thin wire — VorMax has a single jet that creates swirl", "Adjust fill valve height"]},
                        {"problem": "Tank sweating/condensation", "causes": ["Cold water + humid air"], "fixes": ["Install anti-sweat valve (mixing valve) on supply line to temper cold water"]}
                    ]
                },
                {
                    "id": "mansfield-toilet",
                    "name": "Mansfield",
                    "models": ["Alto", "Denali", "Summit", "Quantum"],
                    "parts": [
                        {"name": "Flush Valve Seal (210/211)", "part_no": "210-0032", "fits": "Most Mansfield models"},
                        {"name": "Fill Valve", "part_no": "08-2051", "fits": "Most Mansfield"},
                        {"name": "Flush Valve", "part_no": "211-0032", "fits": "Alto, Summit"}
                    ],
                    "troubleshooting": [
                        {"problem": "Running constantly", "causes": ["Flush valve seal worn (very common)"], "fixes": ["Replace seal 210-0032 — Mansfield uses a unique drop-in flush valve, pull straight up to remove"]},
                        {"problem": "Slow flush", "causes": ["Flush valve not lifting fully", "Tank water level low"], "fixes": ["Check lift chain/rod adjustment", "Adjust fill valve"]}
                    ]
                },
                {
                    "id": "gerber-toilet",
                    "name": "Gerber",
                    "models": ["Viper", "Avalanche", "Maxwell", "Ultra Flush"],
                    "parts": [
                        {"name": "Flapper 3\" (Viper)", "part_no": "99-788", "fits": "Viper, Avalanche"},
                        {"name": "Fill Valve", "part_no": "99-506", "fits": "Most Gerber models"},
                        {"name": "Flush Valve 3\"", "part_no": "99-951", "fits": "Viper, Avalanche"}
                    ],
                    "troubleshooting": [
                        {"problem": "Running after flush", "causes": ["3\" flapper not seating"], "fixes": ["Replace flapper 99-788 — Gerber uses a 3\" flapper on most models, not a standard 2\""]},
                        {"problem": "Hard to find parts", "causes": ["Gerber is less common at big box stores"], "fixes": ["Order direct from Gerber or plumbing supply houses — parts are specific to Gerber"]}
                    ]
                }
            ]
        },
        {
            "id": "faucets",
            "name": "Faucets",
            "manufacturers": [
                {
                    "id": "moen-faucet",
                    "name": "Moen",
                    "models": ["Arbor", "Align", "Brantford", "Chateau", "Gibson", "Adler"],
                    "parts": [
                        {"name": "1222 Cartridge (Posi-Temp)", "part_no": "1222", "fits": "Most Moen single-handle shower valves"},
                        {"name": "1225 Cartridge (two-handle)", "part_no": "1225", "fits": "Most Moen kitchen/bath two-handle"},
                        {"name": "1200 Cartridge (older single)", "part_no": "1200", "fits": "Older single-handle Moen"},
                        {"name": "Cartridge Puller Tool", "part_no": "104421", "fits": "For removing stuck 1222/1225"},
                        {"name": "O-Ring Kit (Spout)", "part_no": "117", "fits": "Kitchen faucet spout base"},
                        {"name": "Aerator (Male Thread)", "part_no": "3919", "fits": "Most Moen kitchen faucets"},
                        {"name": "Handle Adapter Kit", "part_no": "100440", "fits": "Posi-Temp handle replacement"}
                    ],
                    "troubleshooting": [
                        {"problem": "Shower won't mix (hot or cold only)", "causes": ["1222 Posi-Temp cartridge failed"], "fixes": ["Replace 1222 cartridge — shut off water, remove handle (Allen screw), pull retaining clip, use puller tool 104421 to extract cartridge, install new one", "Note: hot on left, align cartridge tab with slot"]},
                        {"problem": "Kitchen faucet dripping from spout", "causes": ["Cartridge worn (1225 or 1200)"], "fixes": ["Replace cartridge — turn off supply valves, remove handle cap > screw > handle, pull retaining nut, swap cartridge"]},
                        {"problem": "Leaking from base of spout", "causes": ["O-rings worn on spout body"], "fixes": ["Replace spout O-ring kit #117 — pull spout straight up, replace O-rings, apply silicone grease, push spout back down"]},
                        {"problem": "Low water pressure from faucet", "causes": ["Aerator clogged with debris/calcium"], "fixes": ["Unscrew aerator, soak in white vinegar overnight, scrub clean, reinstall"]}
                    ]
                },
                {
                    "id": "delta-faucet",
                    "name": "Delta",
                    "models": ["Leland", "Cassidy", "Lahara", "Foundations", "Trinsic"],
                    "parts": [
                        {"name": "Ball Assembly (single handle)", "part_no": "RP70", "fits": "Older Delta single-handle ball-type"},
                        {"name": "Diamond Seal Cartridge", "part_no": "RP46074", "fits": "Most modern Delta single-handle"},
                        {"name": "Seats & Springs Kit", "part_no": "RP4993", "fits": "Delta ball-type faucets"},
                        {"name": "Ceramic Cartridge (Monitor)", "part_no": "RP19804", "fits": "Delta Monitor shower valves"},
                        {"name": "Aerator", "part_no": "RP330", "fits": "Most Delta kitchen faucets"},
                        {"name": "Sprayer Hose", "part_no": "RP44647", "fits": "Pull-down kitchen faucets"}
                    ],
                    "troubleshooting": [
                        {"problem": "Faucet dripping (ball type)", "causes": ["Worn seats and springs", "Ball assembly corroded"], "fixes": ["Replace seats & springs RP4993 — remove handle, cap, cam, ball, then replace rubber seats and springs in body", "Replace ball assembly RP70 if corroded or pitted"]},
                        {"problem": "Faucet dripping (Diamond Seal)", "causes": ["Cartridge failed"], "fixes": ["Replace cartridge RP46074 — Diamond Seal is a sealed unit, pull handle, remove cartridge, install new"]},
                        {"problem": "Shower temperature fluctuates", "causes": ["Monitor cartridge worn"], "fixes": ["Replace Monitor cartridge RP19804 — remove handle, sleeve, and cartridge retainer"]},
                        {"problem": "Pull-down sprayer stuck/not retracting", "causes": ["Hose caught under sink", "Weight fell off hose"], "fixes": ["Check hose routing under sink for kinks", "Reattach counterweight on hose"]}
                    ]
                },
                {
                    "id": "kohler-faucet",
                    "name": "Kohler",
                    "models": ["Simplice", "Bellera", "Forte", "Devonshire", "Coralais"],
                    "parts": [
                        {"name": "Ceramic Valve (single handle)", "part_no": "GP1016515", "fits": "Simplice, Bellera, many single-handle"},
                        {"name": "Ceramic Valve (two handle)", "part_no": "GP77005", "fits": "Devonshire, Bancroft two-handle"},
                        {"name": "Ball Assembly Repair Kit", "part_no": "GP30420", "fits": "Coralais single-handle"},
                        {"name": "Aerator Assembly", "part_no": "GP1043003", "fits": "Most Kohler kitchen faucets"},
                        {"name": "Diverter Assembly", "part_no": "GP1092204", "fits": "Kitchen faucets with sprayer"}
                    ],
                    "troubleshooting": [
                        {"problem": "Dripping from spout", "causes": ["Ceramic disc valve worn", "O-rings deteriorated"], "fixes": ["Replace ceramic valve GP1016515 or GP77005 depending on model", "Replace O-rings if leak is at base"]},
                        {"problem": "Handle hard to turn", "causes": ["Cartridge/valve dry or corroded"], "fixes": ["Remove and clean valve, apply silicone grease, or replace valve"]},
                        {"problem": "Sprayer diverter not switching", "causes": ["Diverter stuck with mineral deposits"], "fixes": ["Replace diverter GP1092204 or soak in vinegar to dissolve deposits"]}
                    ]
                },
                {
                    "id": "pfister-faucet",
                    "name": "Pfister",
                    "models": ["Jaida", "Ladera", "Masey", "Pfirst", "Shelton"],
                    "parts": [
                        {"name": "Ceramic Cartridge", "part_no": "974-044", "fits": "Most Pfister single-handle"},
                        {"name": "Cartridge (older models)", "part_no": "910-032", "fits": "Older Pfister single-handle"},
                        {"name": "Pressure Balance Cartridge", "part_no": "974-042", "fits": "Pfister shower valves"},
                        {"name": "Aerator", "part_no": "951-001", "fits": "Most Pfister faucets"}
                    ],
                    "troubleshooting": [
                        {"problem": "Dripping from spout", "causes": ["Cartridge worn"], "fixes": ["Replace cartridge 974-044 — Pfister offers free lifetime cartridge replacement, call 1-800-732-8238"]},
                        {"problem": "Shower pressure balance not working", "causes": ["974-042 cartridge failed"], "fixes": ["Replace pressure balance cartridge — shut off water, remove handle trim, pull cartridge"]},
                        {"problem": "Handle loose", "causes": ["Set screw loose or stripped"], "fixes": ["Tighten Allen set screw under handle cap"]}
                    ]
                },
                {
                    "id": "grohe-faucet",
                    "name": "Grohe",
                    "models": ["Eurodisc", "Ladylux", "K7", "Concetto", "Eurosmart"],
                    "parts": [
                        {"name": "Ceramic Cartridge 46mm", "part_no": "46374000", "fits": "Most Grohe single-handle"},
                        {"name": "Ceramic Cartridge 35mm", "part_no": "46048000", "fits": "Smaller Grohe single-handle"},
                        {"name": "Thermostatic Cartridge", "part_no": "47450000", "fits": "Grohe Grohtherm"},
                        {"name": "Aerator (SilkMove)", "part_no": "13928000", "fits": "Most Grohe faucets"}
                    ],
                    "troubleshooting": [
                        {"problem": "Dripping", "causes": ["Ceramic cartridge worn"], "fixes": ["Replace cartridge 46374000 or 46048000 — Grohe cartridges are specific by size, measure before ordering"]},
                        {"problem": "Handle stiff", "causes": ["Cartridge dry/corroded"], "fixes": ["Apply Grohe silicone grease or replace cartridge"]},
                        {"problem": "Thermostatic not regulating temp", "causes": ["Thermostatic cartridge failed"], "fixes": ["Replace 47450000 — requires calibration after install"]}
                    ]
                },
                {
                    "id": "hansgrohe-faucet",
                    "name": "Hansgrohe",
                    "models": ["Talis", "Focus", "Metris", "Croma", "Raindance"],
                    "parts": [
                        {"name": "Ceramic Cartridge (M2/M3)", "part_no": "92730000", "fits": "Talis, Focus, Metris"},
                        {"name": "Diverter Cartridge", "part_no": "94282000", "fits": "Shower diverters"},
                        {"name": "Aerator Insert", "part_no": "95388000", "fits": "Most Hansgrohe faucets"}
                    ],
                    "troubleshooting": [
                        {"problem": "Dripping", "causes": ["Cartridge worn"], "fixes": ["Replace cartridge 92730000 — similar to Grohe (same parent company)"]},
                        {"problem": "Shower head low flow", "causes": ["Flow restrictor or aerator clogged"], "fixes": ["Remove and clean or remove flow restrictor from shower head"]}
                    ]
                }
            ]
        },
        {
            "id": "shower-valves",
            "name": "Shower Valves",
            "manufacturers": [
                {
                    "id": "moen-shower",
                    "name": "Moen",
                    "models": ["Posi-Temp", "Moentrol", "ExactTemp"],
                    "parts": [
                        {"name": "Posi-Temp Cartridge", "part_no": "1222", "fits": "All Posi-Temp valves"},
                        {"name": "Moentrol Cartridge", "part_no": "1248", "fits": "All Moentrol valves"},
                        {"name": "Posi-Temp Valve Body (rough-in)", "part_no": "2520", "fits": "New installations"},
                        {"name": "Cartridge Puller", "part_no": "104421", "fits": "1222, 1225 extraction"}
                    ],
                    "troubleshooting": [
                        {"problem": "No hot water from shower", "causes": ["1222 cartridge installed backwards", "Hot supply shut off"], "fixes": ["Remove cartridge, rotate 180°, reinstall — notch faces up", "Check hot supply valve"]},
                        {"problem": "Shower drips when off", "causes": ["Cartridge not sealing"], "fixes": ["Replace 1222 or 1248 cartridge — use puller tool, brass can corrode around cartridge making it stuck"]},
                        {"problem": "Scald risk / no pressure balance", "causes": ["Old non-pressure-balance valve"], "fixes": ["Upgrade to Posi-Temp valve 2520 rough-in (requires opening wall)"]}
                    ]
                },
                {
                    "id": "delta-shower",
                    "name": "Delta",
                    "models": ["Monitor 13/14 Series", "Monitor 17 Series", "MultiChoice"],
                    "parts": [
                        {"name": "Monitor Cartridge (13/14)", "part_no": "RP19804", "fits": "Monitor 1300/1400 series"},
                        {"name": "Monitor Cartridge (17)", "part_no": "RP46074", "fits": "Monitor 1700 series"},
                        {"name": "MultiChoice Rough-In", "part_no": "R10000-UNBX", "fits": "New installations"}
                    ],
                    "troubleshooting": [
                        {"problem": "Temperature swings", "causes": ["Monitor cartridge worn"], "fixes": ["Replace RP19804 or RP46074 depending on series"]},
                        {"problem": "Can't get hot enough", "causes": ["Rotational limit stop set too low"], "fixes": ["Remove handle, adjust rotational limit stop to allow more hot water rotation"]}
                    ]
                }
            ]
        },
        {
            "id": "commercial-flush",
            "name": "Commercial Flush Valves",
            "manufacturers": [
                {
                    "id": "sloan",
                    "name": "Sloan",
                    "models": ["Royal", "Regal", "Crown", "GEMINI (sensor)", "ECOS"],
                    "parts": [
                        {"name": "Regal Rebuild Kit (closet)", "part_no": "A-1101-A", "fits": "Regal 111 closet flushometers"},
                        {"name": "Royal Rebuild Kit (closet)", "part_no": "A-1107-A", "fits": "Royal 111 closet flushometers"},
                        {"name": "Regal Rebuild Kit (urinal)", "part_no": "A-1102-A", "fits": "Regal 186 urinal flushometers"},
                        {"name": "Diaphragm Kit", "part_no": "A-156-A", "fits": "Most Sloan diaphragm flushometers"},
                        {"name": "Handle Assembly", "part_no": "B-32-A", "fits": "Most Sloan manual flushometers"},
                        {"name": "Vacuum Breaker Kit", "part_no": "V-500-AA", "fits": "Most Sloan flushometers"},
                        {"name": "Tailpiece (1-1/2\" closet)", "part_no": "F-25-A", "fits": "Closet flushometers"},
                        {"name": "Sensor Override Button (GEMINI)", "part_no": "EBV-1023-A", "fits": "Sloan sensor models"}
                    ],
                    "troubleshooting": [
                        {"problem": "Flush valve runs continuously", "causes": ["Diaphragm worn/debris on seat", "Relief valve stuck open", "Handle stuck"], "fixes": ["Replace diaphragm kit A-156-A — shut off stop, remove inner cover, swap diaphragm and disc", "Clean or replace relief valve in upper housing", "Free handle assembly, replace if damaged"]},
                        {"problem": "Short flush / not enough water", "causes": ["Diaphragm bypass hole clogged", "Stop not fully open", "Low water pressure"], "fixes": ["Clean bypass hole in diaphragm with pin", "Open control stop fully (turn counterclockwise)", "Check supply pressure (minimum 15 PSI required)"]},
                        {"problem": "Won't flush at all", "causes": ["Control stop closed", "Handle broken", "Diaphragm bypass clogged"], "fixes": ["Open control stop", "Replace handle assembly B-32-A", "Rebuild with diaphragm kit"]},
                        {"problem": "Sensor not flushing (GEMINI)", "causes": ["Battery dead", "Sensor window dirty", "Range setting off"], "fixes": ["Replace battery (in sensor housing)", "Clean sensor lens with soft cloth", "Adjust sensor range per manual"]}
                    ]
                },
                {
                    "id": "zurn",
                    "name": "Zurn",
                    "models": ["AquaFlush", "AquaVantage", "AquaSense (sensor)", "ZER6000"],
                    "parts": [
                        {"name": "Rebuild Kit (closet)", "part_no": "P6000-EUR-WS1-RB", "fits": "AquaFlush/AquaVantage closet"},
                        {"name": "Rebuild Kit (urinal)", "part_no": "P6000-EUR-WS-RB", "fits": "AquaFlush/AquaVantage urinal"},
                        {"name": "Diaphragm Kit", "part_no": "P6000-M", "fits": "Most Zurn flushometers"},
                        {"name": "Handle Assembly", "part_no": "P6000-H", "fits": "Most Zurn manual models"},
                        {"name": "Vacuum Breaker", "part_no": "P6000-C", "fits": "Most Zurn flushometers"}
                    ],
                    "troubleshooting": [
                        {"problem": "Runs continuously", "causes": ["Diaphragm failed", "Debris in valve"], "fixes": ["Replace diaphragm kit P6000-M — similar process to Sloan, shut off stop, remove cover, swap parts"]},
                        {"problem": "Weak flush", "causes": ["Control stop partially closed", "Diaphragm bypass clogged"], "fixes": ["Open control stop fully", "Clean bypass in diaphragm"]},
                        {"problem": "Sensor not responding", "causes": ["Battery dead", "Sensor dirty"], "fixes": ["Replace battery module", "Clean sensor window"]}
                    ]
                }
            ]
        },
        {
            "id": "garbage-disposals",
            "name": "Garbage Disposals",
            "manufacturers": [
                {
                    "id": "insinkerator",
                    "name": "InSinkErator",
                    "models": ["Badger 5", "Evolution Compact", "Evolution Excel", "Pro 750", "Pro 780"],
                    "parts": [
                        {"name": "Splash Guard", "part_no": "RSG-00", "fits": "Most InSinkErator models"},
                        {"name": "Wrench (Allen key)", "part_no": "WRN-00", "fits": "All InSinkErator bottom hex socket"},
                        {"name": "Mounting Assembly Kit", "part_no": "CG-00", "fits": "All InSinkErator 3-bolt mount"},
                        {"name": "Discharge Tube w/ Gasket", "part_no": "DT-00", "fits": "Most models"},
                        {"name": "Stopper/Actuator Cap", "part_no": "STP-SS", "fits": "Evolution series"}
                    ],
                    "troubleshooting": [
                        {"problem": "Disposal hums but won't spin", "causes": ["Jammed flywheel/impellers"], "fixes": ["Insert Allen wrench WRN-00 in bottom hex socket, work back and forth to free jam", "If no Allen access, use broom handle from top to manually rotate flywheel", "Press reset button (red, on bottom of unit)"]},
                        {"problem": "Disposal won't turn on at all", "causes": ["Reset button tripped", "Breaker tripped", "Switch or wiring issue"], "fixes": ["Press red reset button on bottom of unit", "Check circuit breaker", "Test switch with multimeter, replace if faulty"]},
                        {"problem": "Leaking from bottom", "causes": ["Internal seal failed", "Unit cracked"], "fixes": ["Unit must be replaced — internal seals are not serviceable"]},
                        {"problem": "Leaking from top flange", "causes": ["3-bolt mounting ring loose", "Plumber's putty dried out"], "fixes": ["Tighten 3 mounting screws evenly", "Remove unit, reapply plumber's putty to flange, reinstall"]},
                        {"problem": "Slow draining / bad smell", "causes": ["Buildup in grind chamber or drain line"], "fixes": ["Run ice cubes and salt through disposal to clean chamber", "Pour baking soda + vinegar, let sit, flush with hot water", "Check drain line for clogs"]}
                    ]
                },
                {
                    "id": "waste-king",
                    "name": "Waste King",
                    "models": ["Legend 1/2 HP", "Legend 3/4 HP", "Knight 1 HP", "Titan"],
                    "parts": [
                        {"name": "Splash Guard", "part_no": "1030", "fits": "Most Waste King models"},
                        {"name": "EZ Mount Adapter", "part_no": "3156", "fits": "EZ Mount connection"},
                        {"name": "Allen Wrench", "part_no": "Included", "fits": "Bottom hex socket (if equipped)"}
                    ],
                    "troubleshooting": [
                        {"problem": "Jammed", "causes": ["Object stuck in grind chamber"], "fixes": ["Waste King uses a high-speed motor that can usually clear jams — try reset button first", "Use Allen wrench if bottom hex socket exists, or broom handle method from top"]},
                        {"problem": "Won't turn on", "causes": ["Reset tripped", "Electrical issue"], "fixes": ["Press reset button (bottom)", "Check power at wall switch and outlet under sink"]},
                        {"problem": "Leaking at connection", "causes": ["EZ Mount gasket worn"], "fixes": ["Check EZ Mount connection, tighten or replace gasket"]}
                    ]
                }
            ]
        },
        {
            "id": "sinks",
            "name": "Sinks & Drains",
            "manufacturers": [
                {
                    "id": "generic-sink",
                    "name": "Universal (All Brands)",
                    "models": ["Kitchen sinks", "Bathroom lavatories", "Utility sinks"],
                    "parts": [
                        {"name": "Basket Strainer Assembly (kitchen)", "part_no": "Universal 3-1/2\"", "fits": "Standard kitchen sinks"},
                        {"name": "Pop-Up Drain Assembly (bath)", "part_no": "Universal 1-1/4\"", "fits": "Bathroom lavatory sinks"},
                        {"name": "P-Trap 1-1/2\" (kitchen)", "part_no": "Universal", "fits": "Kitchen drains"},
                        {"name": "P-Trap 1-1/4\" (bath)", "part_no": "Universal", "fits": "Bathroom drains"},
                        {"name": "Supply Lines (braided SS)", "part_no": "3/8\" x 1/2\"", "fits": "Faucet supply connections"},
                        {"name": "Plumber's Putty", "part_no": "N/A", "fits": "Drain/strainer sealing"},
                        {"name": "Teflon Tape", "part_no": "N/A", "fits": "Threaded connections"}
                    ],
                    "troubleshooting": [
                        {"problem": "Kitchen drain leaking at strainer", "causes": ["Putty dried/cracked", "Locknut loose"], "fixes": ["Remove strainer, scrape old putty, apply fresh plumber's putty, reinstall and tighten locknut from below"]},
                        {"problem": "Bathroom pop-up not holding water", "causes": ["Linkage out of adjustment", "Pop-up stopper worn/corroded"], "fixes": ["Adjust clevis screw on lift rod linkage under sink", "Replace pop-up stopper and rod assembly"]},
                        {"problem": "P-trap leaking", "causes": ["Slip-joint washers worn", "Nuts not tight"], "fixes": ["Replace slip-joint washers, hand-tighten nuts then 1/4 turn with pliers", "Do NOT use Teflon tape on slip joints — they seal with compression washers"]},
                        {"problem": "Slow drain", "causes": ["Hair/debris in pop-up or P-trap"], "fixes": ["Remove pop-up stopper, clean hair from pivot rod", "Remove and clean P-trap (put bucket underneath)", "Use drain snake for deeper clogs — avoid chemical drain cleaners"]}
                    ]
                }
            ]
        }
    ]
}
