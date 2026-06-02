// Major US City Plumbing Code Amendments (as of 2026)
// Many cities adopt the state base code (UPC/IPC) but add LOCAL amendments that override portions.
// This data helps plumbers know when their city has notable deviations from the base code.

export const CITY_AMENDMENTS = {
  // ───── New York ─────
  "New York": {
    state: "NY",
    base_code: "ipc",
    name: "NYC Plumbing Code",
    official_url: "https://www.nyc.gov/site/buildings/codes/plumbing-code.page",
    key_amendments: [
      "Cast iron required for soil & waste stacks in buildings 6+ stories",
      "Backflow prevention required at all hose bibbs",
      "Lead-free brass required for all potable water fittings (Local Law 219)",
      "No PEX in commercial buildings over 75 feet (high-rise restriction)",
    ],
  },

  // ───── Chicago ─────
  Chicago: {
    state: "IL",
    base_code: "ipc",
    name: "Chicago Plumbing Code",
    official_url: "https://www.chicago.gov/city/en/depts/bldgs/provdrs/permits/svcs/PlumbingCode.html",
    key_amendments: [
      "Cast iron mandatory for all DWV piping (NO PVC in most construction)",
      "Copper Type L required for all water distribution (no PEX)",
      "Lead solder banned even for non-potable connections",
      "Licensed Chicago plumber required for permit pulls",
    ],
  },

  // ───── Los Angeles ─────
  "Los Angeles": {
    state: "CA",
    base_code: "upc",
    name: "LA Plumbing Code",
    official_url: "https://www.ladbs.org/services/check-status/document-library/plumbing-code",
    key_amendments: [
      "Seismic strapping required on water heaters (2 straps min, upper/lower third)",
      "Earthquake gas shutoff valves required at main",
      "Greywater systems heavily regulated — separate permit needed",
      "All new construction must be drought-compliant (low-flow fixtures)",
    ],
  },

  // ───── San Francisco ─────
  "San Francisco": {
    state: "CA",
    base_code: "upc",
    name: "SF Plumbing Code",
    official_url: "https://sfdbi.org/plumbing-mechanical",
    key_amendments: [
      "Recirculating hot water system required in new residential",
      "Stricter water reuse / greywater allowances",
      "Backwater valves mandatory on lowest fixtures (sewer surcharge risk)",
      "All toilets ≤1.28 GPF in new construction",
    ],
  },

  // ───── Houston ─────
  Houston: {
    state: "TX",
    base_code: "ipc",
    name: "Houston Plumbing Code",
    official_url: "https://www.houstonpermittingcenter.org/plumbing",
    key_amendments: [
      "Cleanouts required every 100' in horizontal drains (vs 100' IPC standard)",
      "Hot tap permits required for water main connections",
      "TPI-Houston licensed plumber required",
    ],
  },

  // ───── Dallas ─────
  Dallas: {
    state: "TX",
    base_code: "ipc",
    name: "Dallas Plumbing Code",
    official_url: "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/Pages/plumbing-mechanical-inspections.aspx",
    key_amendments: [
      "Backflow preventer testing required annually (RPZ/DCVA)",
      "Vacuum breakers required on all hose bibbs",
      "Local form 50-1 required for water meter sizing >2\"",
    ],
  },

  // ───── Philadelphia ─────
  Philadelphia: {
    state: "PA",
    base_code: "ipc",
    name: "Philadelphia Plumbing Code",
    official_url: "https://www.phila.gov/services/permits-violations-licenses/get-a-license/business-licenses/get-a-master-plumbers-license/",
    key_amendments: [
      "Master plumber license required to pull permits (no contractor-level)",
      "Cast iron drain stacks required in row homes",
      "Special licensing for sprinkler/fire-line work",
    ],
  },

  // ───── Seattle ─────
  Seattle: {
    state: "WA",
    base_code: "upc",
    name: "Seattle Plumbing Code",
    official_url: "https://www.seattle.gov/sdci/codes/codes-we-enforce-(a-z)/uniform-plumbing-code",
    key_amendments: [
      "Greywater rough-in required in new single-family residences",
      "Backflow assemblies required on all irrigation taps",
      "Combined sewer separation rules apply in older districts",
    ],
  },

  // ───── Boston ─────
  Boston: {
    state: "MA",
    base_code: "ipc",
    name: "Boston / MA Plumbing Code (248 CMR)",
    official_url: "https://www.mass.gov/regulations/248-CMR-1000-uniform-state-plumbing-code",
    key_amendments: [
      "All work must be by MA licensed plumber (master/journeyman)",
      "Saddle fittings banned on water service lines",
      "No mechanical joints below grade for water service",
    ],
  },

  // ───── Miami / Miami-Dade ─────
  Miami: {
    state: "FL",
    base_code: "ipc",
    name: "Florida + Miami-Dade Plumbing Code",
    official_url: "https://www.miamidade.gov/permits/library/plumbing.pdf",
    key_amendments: [
      "Hurricane / high-wind installation requirements on roof penetrations",
      "All exterior pipe protected against UV (Schedule 80 or insulated)",
      "Saltwater corrosion considerations on coastal installs",
    ],
  },

  // ───── Phoenix ─────
  Phoenix: {
    state: "AZ",
    base_code: "upc",
    name: "Phoenix Plumbing Code",
    official_url: "https://www.phoenix.gov/pdd/permit-services",
    key_amendments: [
      "Hot water pipe insulation required (R-3 min) due to extreme ambient temps",
      "Recirc lines required on long water-heater runs",
      "Backflow on all outdoor hose bibbs",
    ],
  },

  // ───── Denver ─────
  Denver: {
    state: "CO",
    base_code: "ipc",
    name: "Denver Plumbing Code",
    official_url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Permitting/Plumbing",
    key_amendments: [
      "Frost-line depth: minimum 36\" cover for water service",
      "Backwater valves required where finished floor < 12\" above next upstream manhole",
      "Pressure-reducing valve required if static >75 PSI",
    ],
  },

  // ───── Las Vegas ─────
  "Las Vegas": {
    state: "NV",
    base_code: "upc",
    name: "Clark County / Las Vegas Plumbing Code",
    official_url: "https://www.clarkcountynv.gov/government/departments/building_and_fire_prevention/index.php",
    key_amendments: [
      "Drought-compliant fixtures mandatory in new construction",
      "Greywater systems strictly regulated",
      "Insulation required on exposed hot lines (extreme heat)",
    ],
  },

  // ───── Portland ─────
  Portland: {
    state: "OR",
    base_code: "upc",
    name: "Portland Plumbing Code",
    official_url: "https://www.portland.gov/bds/codes/plumbing-code",
    key_amendments: [
      "Stormwater on-site retention required in many districts",
      "Earthquake bracing on water heaters (Cascadia subduction zone)",
      "Rainwater harvesting allowances for non-potable use",
    ],
  },
};

/**
 * Look up city amendments by name (case-insensitive).
 * Returns the amendment record or null.
 */
export function findCityAmendment(cityName) {
  if (!cityName) return null;
  const target = cityName.trim().toLowerCase();
  for (const [key, value] of Object.entries(CITY_AMENDMENTS)) {
    if (key.toLowerCase() === target) return { ...value, city: key };
  }
  // Handle Miami-Dade County etc.
  for (const [key, value] of Object.entries(CITY_AMENDMENTS)) {
    if (target.includes(key.toLowerCase()) || key.toLowerCase().includes(target)) {
      return { ...value, city: key };
    }
  }
  return null;
}
