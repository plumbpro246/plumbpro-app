// US State → Plumbing Code Adoption (as of 2026)
// Sources: IAPMO, ICC, state building code authorities
// Note: Many states have local amendments. This represents the primary base code.

export const STATE_CODE_MAP = {
  // UPC States (Uniform Plumbing Code - IAPMO)
  AK: { code: "upc", name: "Alaska" },
  AZ: { code: "upc", name: "Arizona" },
  CA: { code: "upc", name: "California" },
  HI: { code: "upc", name: "Hawaii" },
  ID: { code: "upc", name: "Idaho" },
  IN: { code: "upc", name: "Indiana" },
  IA: { code: "upc", name: "Iowa" },
  MN: { code: "upc", name: "Minnesota" },
  MT: { code: "upc", name: "Montana" },
  NE: { code: "upc", name: "Nebraska" },
  NV: { code: "upc", name: "Nevada" },
  NM: { code: "upc", name: "New Mexico" },
  ND: { code: "upc", name: "North Dakota" },
  OR: { code: "upc", name: "Oregon" },
  UT: { code: "upc", name: "Utah" },
  WA: { code: "upc", name: "Washington" },

  // IPC States (International Plumbing Code - ICC)
  AL: { code: "ipc", name: "Alabama" },
  AR: { code: "ipc", name: "Arkansas" },
  CO: { code: "ipc", name: "Colorado" },
  CT: { code: "ipc", name: "Connecticut" },
  DE: { code: "ipc", name: "Delaware" },
  FL: { code: "ipc", name: "Florida" },
  GA: { code: "ipc", name: "Georgia" },
  IL: { code: "ipc", name: "Illinois" },
  KS: { code: "ipc", name: "Kansas" },
  KY: { code: "ipc", name: "Kentucky" },
  LA: { code: "ipc", name: "Louisiana" },
  ME: { code: "ipc", name: "Maine" },
  MD: { code: "ipc", name: "Maryland" },
  MA: { code: "ipc", name: "Massachusetts" },
  MI: { code: "ipc", name: "Michigan" },
  MS: { code: "ipc", name: "Mississippi" },
  MO: { code: "ipc", name: "Missouri" },
  NH: { code: "ipc", name: "New Hampshire" },
  NJ: { code: "ipc", name: "New Jersey" },
  NY: { code: "ipc", name: "New York" },
  NC: { code: "ipc", name: "North Carolina" },
  OH: { code: "ipc", name: "Ohio" },
  OK: { code: "ipc", name: "Oklahoma" },
  PA: { code: "ipc", name: "Pennsylvania" },
  RI: { code: "ipc", name: "Rhode Island" },
  SC: { code: "ipc", name: "South Carolina" },
  SD: { code: "ipc", name: "South Dakota" },
  TN: { code: "ipc", name: "Tennessee" },
  TX: { code: "ipc", name: "Texas" },
  VT: { code: "ipc", name: "Vermont" },
  VA: { code: "ipc", name: "Virginia" },
  WV: { code: "ipc", name: "West Virginia" },
  WY: { code: "ipc", name: "Wyoming" },
  DC: { code: "ipc", name: "District of Columbia" },

  // Custom/Hybrid States (default to IPC since closer)
  WI: { code: "ipc", name: "Wisconsin", custom: true }, // Has own Wisconsin Uniform Plumbing Code
};

const STORAGE_KEY = "plumbpro-state-detected";

/**
 * Detect the user's US state from their IP address.
 * Caches the result in localStorage for 7 days.
 * Returns { state: "TX", code: "ipc", name: "Texas" } or null on failure.
 */
export async function detectStateCode() {
  // Check cache first
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // ignore corrupt cache
  }

  try {
    // Free IP geolocation, no key required, HTTPS endpoint
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return null;
    const j = await res.json();
    if (j.country_code !== "US" || !j.region_code) return null;

    const stateCode = j.region_code.toUpperCase();
    const mapping = STATE_CODE_MAP[stateCode];
    if (!mapping) return null;

    const result = { state: stateCode, code: mapping.code, name: mapping.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
    return result;
  } catch {
    return null;
  }
}
