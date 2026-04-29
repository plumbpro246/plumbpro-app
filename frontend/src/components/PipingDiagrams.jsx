import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Professional technical drawing style piping diagrams
 * Black/white with leader lines, standard plumbing symbols, figure numbers
 */

const STROKE = "#1a1a1a";
const LIGHT = "#666";
const DASH = "5,3";

// ==================== WATER HEATER DIAGRAMS ====================

export function SingleWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 600 520" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Title Block */}
      <text x="300" y="505" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 1 — SINGLE WATER HEATER INSTALLATION (TYPICAL)</text>

      {/* Water Heater Tank */}
      <rect x="260" y="140" width="100" height="200" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="310" y="245" textAnchor="middle" fontSize="12" fill={STROKE} fontWeight="bold">Heater</text>

      {/* Vent/Draft Hood on top */}
      <line x1="290" y1="140" x2="290" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <line x1="330" y1="140" x2="330" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <line x1="280" y1="90" x2="340" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <line x1="280" y1="90" x2="310" y2="55" stroke={STROKE} strokeWidth="1.5" />
      <line x1="340" y1="90" x2="310" y2="55" stroke={STROKE} strokeWidth="1.5" />
      {/* Vent pipe going up */}
      <line x1="300" y1="55" x2="300" y2="20" stroke={STROKE} strokeWidth="1.5" />
      <line x1="320" y1="55" x2="320" y2="20" stroke={STROKE} strokeWidth="1.5" />
      <line x1="295" y1="20" x2="325" y2="20" stroke={STROKE} strokeWidth="1.5" />
      {/* Leader: Vent */}
      <line x1="330" y1="40" x2="400" y2="40" stroke={LIGHT} strokeWidth="0.5" />
      <text x="405" y="44" fontSize="9" fill={LIGHT}>Vent to Chimney</text>
      <text x="405" y="56" fontSize="8" fill={LIGHT}>(slope 1/4"/ft up)</text>

      {/* T&P Relief Valve (right side) */}
      <rect x="360" y="170" width="25" height="15" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <line x1="372" y1="185" x2="372" y2="340" stroke={STROKE} strokeWidth="1.5" />
      <line x1="372" y1="340" x2="372" y2="400" stroke={STROKE} strokeWidth="1.5" />
      {/* Gap near floor */}
      <line x1="365" y1="400" x2="380" y2="400" stroke={STROKE} strokeWidth="1" />
      {/* Leader: T&P */}
      <line x1="385" y1="178" x2="440" y2="178" stroke={LIGHT} strokeWidth="0.5" />
      <text x="445" y="175" fontSize="9" fill={LIGHT}>T & P Safety</text>
      <text x="445" y="187" fontSize="9" fill={LIGHT}>Relief Valve</text>
      {/* Leader: Discharge */}
      <line x1="380" y1="320" x2="420" y2="320" stroke={LIGHT} strokeWidth="0.5" />
      <text x="425" y="314" fontSize="9" fill={LIGHT} transform="rotate(90, 425, 314)">Discharge Line</text>
      {/* 6" from floor note */}
      <line x1="358" y1="400" x2="358" y2="420" stroke={LIGHT} strokeWidth="0.5" strokeDasharray={DASH} />
      <text x="340" y="435" fontSize="8" fill={LIGHT}>(6" from floor)</text>

      {/* Cold Water Supply (right side, entering top) */}
      <line x1="500" y1="150" x2="360" y2="150" stroke={STROKE} strokeWidth="1.5" />
      {/* Arrow */}
      <polygon points="365,147 365,153 358,150" fill={STROKE} />
      {/* Shutoff valve symbol */}
      <polygon points="440,145 450,150 440,155" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="460,145 450,150 460,155" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="450" y1="142" x2="450" y2="158" stroke={STROKE} strokeWidth="1" />
      {/* Leader: Cold */}
      <line x1="500" y1="150" x2="530" y2="130" stroke={LIGHT} strokeWidth="0.5" />
      <text x="535" y="128" fontSize="9" fill={LIGHT}>Water</text>
      <text x="535" y="140" fontSize="9" fill={LIGHT}>Supply</text>
      {/* Leader: Shutoff */}
      <line x1="450" y1="160" x2="450" y2="175" stroke={LIGHT} strokeWidth="0.5" />
      <text x="435" y="187" fontSize="8" fill={LIGHT}>Shutoff</text>

      {/* Expansion Tank (on cold line, above) */}
      <line x1="480" y1="150" x2="480" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <ellipse cx="480" cy="70" rx="20" ry="25" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <line x1="460" y1="70" x2="500" y2="70" stroke={STROKE} strokeWidth="0.8" strokeDasharray="3,2" />
      {/* Leader: Expansion Tank */}
      <line x1="502" y1="60" x2="540" y2="50" stroke={LIGHT} strokeWidth="0.5" />
      <text x="545" y="48" fontSize="9" fill={LIGHT}>Expansion</text>
      <text x="545" y="60" fontSize="9" fill={LIGHT}>Tank</text>

      {/* Dielectric Union symbols on cold */}
      <rect x="395" y="146" width="10" height="8" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="395" y="140" fontSize="7" fill={LIGHT}>DU</text>

      {/* Hot Water Out (left side, exiting top) */}
      <line x1="260" y1="150" x2="60" y2="150" stroke={STROKE} strokeWidth="1.5" />
      {/* Arrow going left */}
      <polygon points="65,147 65,153 58,150" fill={STROKE} />
      {/* Dielectric Union on hot */}
      <rect x="220" y="146" width="10" height="8" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="220" y="140" fontSize="7" fill={LIGHT}>DU</text>
      {/* Leader: Hot Out */}
      <line x1="60" y1="150" x2="40" y2="130" stroke={LIGHT} strokeWidth="0.5" />
      <text x="15" y="125" fontSize="9" fill={LIGHT}>To System</text>
      <text x="15" y="137" fontSize="9" fill={LIGHT}>(Hot)</text>

      {/* Gas Supply (bottom left) */}
      <line x1="30" y1="380" x2="260" y2="380" stroke={STROKE} strokeWidth="1.5" />
      {/* Arrow */}
      <polygon points="255,377 255,383 262,380" fill={STROKE} />
      {/* Gas shutoff valve */}
      <polygon points="100,375 110,380 100,385" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="120,375 110,380 120,385" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="110" y1="372" x2="110" y2="388" stroke={STROKE} strokeWidth="1" />
      {/* Drip leg (vertical down) */}
      <line x1="150" y1="380" x2="150" y2="430" stroke={STROKE} strokeWidth="1.5" />
      <line x1="145" y1="430" x2="155" y2="430" stroke={STROKE} strokeWidth="1.5" />
      <line x1="145" y1="435" x2="155" y2="435" stroke={STROKE} strokeWidth="1" />
      {/* Leader: Gas */}
      <line x1="30" y1="380" x2="15" y2="365" stroke={LIGHT} strokeWidth="0.5" />
      <text x="10" y="360" fontSize="9" fill={LIGHT}>Gas</text>
      <text x="10" y="372" fontSize="9" fill={LIGHT}>Supply</text>
      {/* Leader: Drip leg */}
      <line x1="157" y1="430" x2="185" y2="440" stroke={LIGHT} strokeWidth="0.5" />
      <text x="190" y="438" fontSize="8" fill={LIGHT}>Sediment Trap</text>
      <text x="190" y="449" fontSize="8" fill={LIGHT}>(Drip Leg)</text>

      {/* Drain Pan */}
      <path d="M 240 340 L 240 355 L 380 355 L 380 340" fill="none" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      {/* Drain line from pan */}
      <line x1="380" y1="350" x2="420" y2="350" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      <line x1="420" y1="350" x2="420" y2="400" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      {/* Leader: Drain Pan */}
      <line x1="310" y1="358" x2="310" y2="380" stroke={LIGHT} strokeWidth="0.5" />
      <text x="280" y="393" fontSize="8" fill={LIGHT}>Drain Pan</text>

      {/* Floor Drain */}
      <ellipse cx="420" cy="415" rx="12" ry="6" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="412" y1="418" x2="428" y2="418" stroke={STROKE} strokeWidth="0.5" />
      <text x="398" y="440" fontSize="8" fill={LIGHT}>Floor Drain</text>

      {/* Backflow Preventer on cold supply */}
      <circle cx="470" cy="150" r="6" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="467" y1="147" x2="473" y2="153" stroke={STROKE} strokeWidth="1" />
      {/* Leader */}
      <line x1="470" y1="158" x2="470" y2="175" stroke={LIGHT} strokeWidth="0.5" />
      <text x="448" y="187" fontSize="8" fill={LIGHT}>Check Valve /</text>
      <text x="448" y="198" fontSize="8" fill={LIGHT}>Backflow Prev.</text>

      {/* Notes */}
      <text x="30" y="475" fontSize="8" fill={LIGHT}>DU = Dielectric Union (required at dissimilar metal connections)</text>
      <text x="30" y="488" fontSize="8" fill={LIGHT}>Dashed lines indicate optional or code-required where applicable</text>
    </svg>
  );
}

export function SeriesWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 600 320" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="305" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 2 — SERIES PIPING (TWO WATER HEATERS)</text>

      {/* WH 1 */}
      <rect x="130" y="80" width="80" height="140" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="170" y="155" textAnchor="middle" fontSize="10" fill={STROKE}>Heater</text>
      <text x="170" y="170" textAnchor="middle" fontSize="10" fill={STROKE}>#1</text>

      {/* WH 2 */}
      <rect x="370" y="80" width="80" height="140" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="410" y="155" textAnchor="middle" fontSize="10" fill={STROKE}>Heater</text>
      <text x="410" y="170" textAnchor="middle" fontSize="10" fill={STROKE}>#2</text>

      {/* Cold supply into WH1 */}
      <line x1="30" y1="100" x2="130" y2="100" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="125,97 125,103 132,100" fill={STROKE} />
      {/* Valve */}
      <polygon points="60,95 70,100 60,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="80,95 70,100 80,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="30" y="90" fontSize="9" fill={LIGHT}>Cold Supply</text>

      {/* Hot out of WH1 to WH2 */}
      <line x1="210" y1="100" x2="370" y2="100" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="365,97 365,103 372,100" fill={STROKE} />
      {/* Leader */}
      <line x1="290" y1="100" x2="290" y2="65" stroke={LIGHT} strokeWidth="0.5" />
      <text x="255" y="58" fontSize="8" fill={LIGHT}>Pre-heated water</text>
      <text x="255" y="70" fontSize="8" fill={LIGHT}>flows to 2nd heater</text>

      {/* Hot out of WH2 to system */}
      <line x1="450" y1="100" x2="570" y2="100" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="565,97 565,103 572,100" fill={STROKE} />
      {/* Valve */}
      <polygon points="500,95 510,100 500,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="520,95 510,100 520,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="540" y="90" fontSize="9" fill={LIGHT}>To System</text>

      {/* Notes box */}
      <rect x="30" y="240" width="540" height="50" fill="none" stroke={LIGHT} strokeWidth="0.5" />
      <text x="40" y="255" fontSize="8" fill={LIGHT}>NOTES:</text>
      <text x="40" y="268" fontSize="8" fill={LIGHT}>1. WH #1 pre-heats water; WH #2 boosts to final temperature</text>
      <text x="40" y="281" fontSize="8" fill={LIGHT}>2. Set WH #1 lower (100°F), WH #2 at final desired temp (120°F)</text>
      <text x="40" y="294" fontSize="8" fill={LIGHT}>3. WH #1 bears heavier load — expect earlier replacement</text>
    </svg>
  );
}

export function ParallelWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 600 380" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="370" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 3 — PARALLEL PIPING WITH HEADER</text>

      {/* Cold supply header (horizontal) */}
      <line x1="30" y1="180" x2="150" y2="180" stroke={STROKE} strokeWidth="2" />
      <polygon points="35,177 35,183 28,180" fill={STROKE} />
      <text x="15" y="170" fontSize="9" fill={LIGHT}>Cold</text>
      <text x="15" y="195" fontSize="9" fill={LIGHT}>Supply</text>

      {/* Vertical cold header */}
      <line x1="150" y1="90" x2="150" y2="270" stroke={STROKE} strokeWidth="2" />

      {/* Branch to WH1 (top) */}
      <line x1="150" y1="100" x2="230" y2="100" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="225,97 225,103 232,100" fill={STROKE} />
      {/* Valve */}
      <polygon points="175,95 185,100 175,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="195,95 185,100 195,105" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* Branch to WH2 (bottom) */}
      <line x1="150" y1="260" x2="230" y2="260" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="225,257 225,263 232,260" fill={STROKE} />
      {/* Valve */}
      <polygon points="175,255 185,260 175,265" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="195,255 185,260 195,265" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* WH 1 */}
      <rect x="230" y="60" width="80" height="80" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="270" y="100" textAnchor="middle" fontSize="10" fill={STROKE}>Heater #1</text>

      {/* WH 2 */}
      <rect x="230" y="220" width="80" height="80" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="270" y="260" textAnchor="middle" fontSize="10" fill={STROKE}>Heater #2</text>

      {/* Hot from WH1 */}
      <line x1="310" y1="100" x2="410" y2="100" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="405,97 405,103 412,100" fill={STROKE} />
      {/* Valve */}
      <polygon points="350,95 360,100 350,105" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="370,95 360,100 370,105" fill="none" stroke={STROKE} strokeWidth="1" />
      {/* Balancing valve label */}
      <text x="345" y="85" fontSize="7" fill={LIGHT}>Balancing</text>
      <text x="348" y="118" fontSize="7" fill={LIGHT}>Valve</text>

      {/* Hot from WH2 */}
      <line x1="310" y1="260" x2="410" y2="260" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="405,257 405,263 412,260" fill={STROKE} />
      {/* Valve */}
      <polygon points="350,255 360,260 350,265" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="370,255 360,260 370,265" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* Vertical hot header */}
      <line x1="410" y1="90" x2="410" y2="270" stroke={STROKE} strokeWidth="2" />

      {/* Hot out to system */}
      <line x1="410" y1="180" x2="570" y2="180" stroke={STROKE} strokeWidth="2" />
      <polygon points="565,177 565,183 572,180" fill={STROKE} />
      <text x="530" y="170" fontSize="9" fill={LIGHT}>To System</text>

      {/* Notes */}
      <rect x="30" y="310" width="540" height="45" fill="none" stroke={LIGHT} strokeWidth="0.5" />
      <text x="40" y="325" fontSize="8" fill={LIGHT}>NOTES:</text>
      <text x="40" y="338" fontSize="8" fill={LIGHT}>1. Install balancing valves on each branch for equal flow distribution</text>
      <text x="40" y="351" fontSize="8" fill={LIGHT}>2. System provides redundancy — one heater can be isolated for service while other operates</text>
    </svg>
  );
}

export function ReverseReturnWHDiagram() {
  return (
    <svg viewBox="0 0 600 340" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="330" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 4 — REVERSE RETURN PIPING</text>

      {/* Cold supply header (top, L to R) */}
      <line x1="30" y1="70" x2="520" y2="70" stroke={STROKE} strokeWidth="2" />
      <polygon points="515,67 515,73 522,70" fill={STROKE} />
      <text x="30" y="58" fontSize="9" fill={LIGHT}>Cold Supply Header</text>

      {/* Drop to each heater */}
      <line x1="130" y1="70" x2="130" y2="110" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="130" cy="70" r="3" fill={STROKE} />
      <rect x="90" y="110" width="80" height="70" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="130" y="148" textAnchor="middle" fontSize="9" fill={STROKE}>Heater #1</text>

      <line x1="300" y1="70" x2="300" y2="110" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="300" cy="70" r="3" fill={STROKE} />
      <rect x="260" y="110" width="80" height="70" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="300" y="148" textAnchor="middle" fontSize="9" fill={STROKE}>Heater #2</text>

      <line x1="470" y1="70" x2="470" y2="110" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="470" cy="70" r="3" fill={STROKE} />
      <rect x="430" y="110" width="80" height="70" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="470" y="148" textAnchor="middle" fontSize="9" fill={STROKE}>Heater #3</text>

      {/* Hot return header (bottom, R to L — REVERSE) */}
      <line x1="130" y1="180" x2="130" y2="230" stroke={STROKE} strokeWidth="1.5" />
      <line x1="300" y1="180" x2="300" y2="230" stroke={STROKE} strokeWidth="1.5" />
      <line x1="470" y1="180" x2="470" y2="230" stroke={STROKE} strokeWidth="1.5" />

      <line x1="80" y1="230" x2="470" y2="230" stroke={STROKE} strokeWidth="2" />
      <polygon points="85,227 85,233 78,230" fill={STROKE} />
      <circle cx="130" cy="230" r="3" fill={STROKE} />
      <circle cx="300" cy="230" r="3" fill={STROKE} />
      <circle cx="470" cy="230" r="3" fill={STROKE} />
      <text x="50" y="225" fontSize="9" fill={LIGHT}>To</text>
      <text x="50" y="238" fontSize="9" fill={LIGHT}>System</text>
      <text x="260" y="248" fontSize="8" fill={LIGHT}>Hot Return Header (flows RIGHT to LEFT)</text>

      {/* Key concept annotation */}
      <line x1="130" y1="265" x2="130" y2="280" stroke={LIGHT} strokeWidth="0.5" strokeDasharray="3,2" />
      <text x="90" y="293" fontSize="8" fill={LIGHT}>FIRST on supply</text>
      <text x="90" y="304" fontSize="8" fill={LIGHT}>= LAST on return</text>

      <line x1="470" y1="265" x2="470" y2="280" stroke={LIGHT} strokeWidth="0.5" strokeDasharray="3,2" />
      <text x="430" y="293" fontSize="8" fill={LIGHT}>LAST on supply</text>
      <text x="430" y="304" fontSize="8" fill={LIGHT}>= FIRST on return</text>
    </svg>
  );
}

// ==================== BOILER DIAGRAMS ====================

export function SingleBoilerDiagram() {
  return (
    <svg viewBox="0 0 600 520" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="510" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 5 — SINGLE BOILER NEAR-BOILER PIPING</text>

      {/* Boiler */}
      <rect x="80" y="240" width="120" height="100" fill="none" stroke={STROKE} strokeWidth="2" />
      <text x="140" y="290" textAnchor="middle" fontSize="11" fill={STROKE} fontWeight="bold">BOILER</text>
      <text x="140" y="310" textAnchor="middle" fontSize="8" fill={LIGHT}>(Mod-Con)</text>

      {/* Supply out (top of boiler, going up) */}
      <line x1="140" y1="240" x2="140" y2="170" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="137,175 143,175 140,168" fill={STROKE} />

      {/* Air Separator */}
      <circle cx="140" cy="145" r="20" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <line x1="125" y1="145" x2="155" y2="145" stroke={STROKE} strokeWidth="0.8" strokeDasharray="2,2" />
      {/* Air vent on top */}
      <line x1="140" y1="125" x2="140" y2="108" stroke={STROKE} strokeWidth="1" />
      <rect x="133" y="100" width="14" height="10" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="140" y="95" textAnchor="middle" fontSize="7" fill={LIGHT}>Air Vent</text>
      {/* Leader */}
      <line x1="162" y1="135" x2="195" y2="125" stroke={LIGHT} strokeWidth="0.5" />
      <text x="200" y="123" fontSize="8" fill={LIGHT}>Air Separator</text>

      {/* Supply header going right */}
      <line x1="160" y1="145" x2="480" y2="145" stroke={STROKE} strokeWidth="2" />
      <polygon points="475,142 475,148 482,145" fill={STROKE} />
      <text x="400" y="135" fontSize="9" fill={LIGHT}>Supply to Zones</text>

      {/* Circulator Pump (on supply) */}
      <circle cx="250" cy="145" r="12" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="244,140 256,145 244,150" fill={STROKE} />
      <line x1="250" y1="157" x2="250" y2="170" stroke={LIGHT} strokeWidth="0.5" />
      <text x="230" y="180" fontSize="8" fill={LIGHT}>Circulator</text>
      <text x="237" y="191" fontSize="8" fill={LIGHT}>Pump</text>

      {/* Zone Valves */}
      <line x1="400" y1="145" x2="400" y2="80" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="397,85 403,85 400,78" fill={STROKE} />
      <circle cx="400" cy="80" r="3" fill={STROKE} />
      <rect x="385" y="55" width="30" height="15" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="400" y="66" textAnchor="middle" fontSize="7" fill={STROKE}>ZV</text>
      <text x="400" y="45" textAnchor="middle" fontSize="8" fill={LIGHT}>Zone 1</text>

      <line x1="460" y1="145" x2="460" y2="80" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="457,85 463,85 460,78" fill={STROKE} />
      <circle cx="460" cy="145" r="3" fill={STROKE} />
      <rect x="445" y="55" width="30" height="15" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="460" y="66" textAnchor="middle" fontSize="7" fill={STROKE}>ZV</text>
      <text x="460" y="45" textAnchor="middle" fontSize="8" fill={LIGHT}>Zone 2</text>

      {/* Zone returns (dashed coming back) */}
      <line x1="400" y1="55" x2="400" y2="30" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      <line x1="400" y1="30" x2="400" y2="420" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      <line x1="460" y1="55" x2="460" y2="30" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      <line x1="460" y1="30" x2="460" y2="420" stroke={STROKE} strokeWidth="1" strokeDasharray={DASH} />
      <text x="425" y="25" fontSize="7" fill={LIGHT}>(to/from radiation)</text>

      {/* Return header */}
      <line x1="480" y1="420" x2="160" y2="420" stroke={STROKE} strokeWidth="2" />
      <polygon points="165,417 165,423 158,420" fill={STROKE} />
      <circle cx="400" cy="420" r="3" fill={STROKE} />
      <circle cx="460" cy="420" r="3" fill={STROKE} />
      <text x="350" y="440" fontSize="9" fill={LIGHT}>Return from Zones</text>

      {/* Return into boiler */}
      <line x1="140" y1="420" x2="140" y2="340" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="137,345 143,345 140,338" fill={STROKE} />

      {/* Expansion Tank (on return) */}
      <ellipse cx="80" cy="400" rx="18" ry="25" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <line x1="60" y1="400" x2="100" y2="400" stroke={STROKE} strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1="98" y1="420" x2="140" y2="420" stroke={STROKE} strokeWidth="1.5" />
      <text x="55" y="370" fontSize="8" fill={LIGHT}>Expansion</text>
      <text x="67" y="382" fontSize="8" fill={LIGHT}>Tank</text>

      {/* Gas Supply */}
      <line x1="30" y1="300" x2="80" y2="300" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="75,297 75,303 82,300" fill={STROKE} />
      <polygon points="45,295 55,300 45,305" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="65,295 55,300 65,305" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="15" y="295" fontSize="8" fill={LIGHT}>Gas</text>

      {/* Condensate drain */}
      <line x1="140" y1="340" x2="140" y2="460" stroke={STROKE} strokeWidth="1" strokeDasharray="3,3" />
      <rect x="120" y="460" width="40" height="20" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="140" y="473" textAnchor="middle" fontSize="7" fill={STROKE}>NEUT</text>
      <text x="140" y="495" textAnchor="middle" fontSize="7" fill={LIGHT}>Condensate</text>
      <text x="140" y="504" textAnchor="middle" fontSize="7" fill={LIGHT}>Neutralizer</text>

      {/* Vent */}
      <line x1="200" y1="270" x2="250" y2="270" stroke={STROKE} strokeWidth="1.5" />
      <line x1="250" y1="270" x2="250" y2="20" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="247,25 253,25 250,18" fill={STROKE} />
      <text x="260" y="20" fontSize="8" fill={LIGHT}>PVC Vent</text>

      {/* Legend */}
      <text x="250" y="475" fontSize="7" fill={LIGHT}>ZV = Zone Valve | NEUT = Condensate Neutralizer</text>
      <text x="250" y="488" fontSize="7" fill={LIGHT}>Dashed lines = return piping / condensate</text>
    </svg>
  );
}

export function PrimarySecondaryDiagram() {
  return (
    <svg viewBox="0 0 600 340" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="330" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 6 — PRIMARY / SECONDARY PIPING</text>

      {/* Primary Loop (rectangle) */}
      <rect x="80" y="100" width="440" height="130" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <text x="300" y="90" textAnchor="middle" fontSize="10" fill={LIGHT} fontWeight="bold">PRIMARY LOOP</text>

      {/* Flow arrows on primary */}
      <polygon points="300,97 296,103 304,103" fill={STROKE} />
      <polygon points="525,165 519,161 519,169" fill={STROKE} />
      <polygon points="300,233 304,227 296,227" fill={STROKE} />
      <polygon points="75,165 81,161 81,169" fill={STROKE} />

      {/* Primary pump */}
      <circle cx="200" cy="100" r="10" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <polygon points="195,96 205,100 195,104" fill={STROKE} />
      <text x="200" y="85" textAnchor="middle" fontSize="7" fill={LIGHT}>P-1</text>

      {/* Boiler connection (closely-spaced tees on left) */}
      <circle cx="100" cy="140" r="3" fill={STROKE} />
      <circle cx="100" cy="190" r="3" fill={STROKE} />
      <line x1="100" y1="140" x2="40" y2="140" stroke={STROKE} strokeWidth="1.5" />
      <line x1="40" y1="140" x2="40" y2="190" stroke={STROKE} strokeWidth="1.5" />
      <line x1="40" y1="190" x2="100" y2="190" stroke={STROKE} strokeWidth="1.5" />
      <rect x="20" y="150" width="40" height="30" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="40" y="168" textAnchor="middle" fontSize="8" fill={STROKE}>BOILER</text>
      {/* Label closely spaced tees */}
      <line x1="100" y1="140" x2="100" y2="130" stroke={LIGHT} strokeWidth="0.5" strokeDasharray="2,2" />
      <line x1="100" y1="190" x2="100" y2="200" stroke={LIGHT} strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="60" y="220" fontSize="7" fill={LIGHT}>Closely-Spaced Tees</text>
      <text x="60" y="230" fontSize="7" fill={LIGHT}>(max 4 pipe dia. apart)</text>

      {/* Zone 1 connection (closely-spaced tees on top right) */}
      <circle cx="380" cy="100" r="3" fill={STROKE} />
      <circle cx="410" cy="100" r="3" fill={STROKE} />
      <line x1="380" y1="100" x2="380" y2="50" stroke={STROKE} strokeWidth="1.5" />
      <line x1="410" y1="100" x2="410" y2="50" stroke={STROKE} strokeWidth="1.5" />
      <rect x="365" y="25" width="60" height="25" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="395" y="41" textAnchor="middle" fontSize="8" fill={STROKE}>ZONE 1</text>
      {/* Zone pump */}
      <circle cx="430" cy="70" r="8" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="426,67 434,70 426,73" fill={STROKE} />
      <text x="445" y="73" fontSize="7" fill={LIGHT}>P-2</text>

      {/* Zone 2 connection (closely-spaced tees on bottom right) */}
      <circle cx="380" cy="230" r="3" fill={STROKE} />
      <circle cx="410" cy="230" r="3" fill={STROKE} />
      <line x1="380" y1="230" x2="380" y2="280" stroke={STROKE} strokeWidth="1.5" />
      <line x1="410" y1="230" x2="410" y2="280" stroke={STROKE} strokeWidth="1.5" />
      <rect x="365" y="280" width="60" height="25" fill="none" stroke={STROKE} strokeWidth="1" />
      <text x="395" y="296" textAnchor="middle" fontSize="8" fill={STROKE}>ZONE 2</text>
      {/* Zone pump */}
      <circle cx="430" cy="260" r="8" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="426,257 434,260 426,263" fill={STROKE} />
      <text x="445" y="263" fontSize="7" fill={LIGHT}>P-3</text>

      {/* Notes */}
      <text x="180" y="265" fontSize="7" fill={LIGHT}>Each circuit has its own pump — hydraulically independent</text>
      <text x="180" y="278" fontSize="7" fill={LIGHT}>Essential for modulating/condensing boilers</text>
    </svg>
  );
}

export function ParallelBoilerDiagram() {
  return (
    <svg viewBox="0 0 600 320" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="310" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 7 — PARALLEL HEADER (CASCADE)</text>

      {/* Supply header */}
      <line x1="50" y1="60" x2="550" y2="60" stroke={STROKE} strokeWidth="2.5" />
      <polygon points="545,57 545,63 552,60" fill={STROKE} />
      <text x="300" y="45" textAnchor="middle" fontSize="9" fill={LIGHT}>SUPPLY HEADER</text>
      <text x="560" y="64" fontSize="8" fill={LIGHT}>To Zones</text>

      {/* Return header */}
      <line x1="50" y1="240" x2="550" y2="240" stroke={STROKE} strokeWidth="2.5" />
      <polygon points="55,237 55,243 48,240" fill={STROKE} />
      <text x="300" y="260" textAnchor="middle" fontSize="9" fill={LIGHT}>RETURN HEADER</text>

      {/* Boiler 1 */}
      <line x1="150" y1="60" x2="150" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="150" cy="60" r="3" fill={STROKE} />
      <rect x="110" y="110" width="80" height="60" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="150" y="144" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #1</text>
      {/* Valves */}
      <polygon points="145,85 155,90 145,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="155,85 145,90 155,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="150" y1="170" x2="150" y2="240" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="150" cy="240" r="3" fill={STROKE} />
      <polygon points="145,205 155,210 145,215" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="155,205 145,210 155,215" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* Boiler 2 */}
      <line x1="300" y1="60" x2="300" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="300" cy="60" r="3" fill={STROKE} />
      <rect x="260" y="110" width="80" height="60" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="300" y="144" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #2</text>
      <polygon points="295,85 305,90 295,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="305,85 295,90 305,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="300" y1="170" x2="300" y2="240" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="300" cy="240" r="3" fill={STROKE} />
      <polygon points="295,205 305,210 295,215" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="305,205 295,210 305,215" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* Boiler 3 */}
      <line x1="450" y1="60" x2="450" y2="90" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="450" cy="60" r="3" fill={STROKE} />
      <rect x="410" y="110" width="80" height="60" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="450" y="144" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #3</text>
      <polygon points="445,85 455,90 445,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="455,85 445,90 455,95" fill="none" stroke={STROKE} strokeWidth="1" />
      <line x1="450" y1="170" x2="450" y2="240" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="450" cy="240" r="3" fill={STROKE} />
      <polygon points="445,205 455,210 445,215" fill="none" stroke={STROKE} strokeWidth="1" />
      <polygon points="455,205 445,210 455,215" fill="none" stroke={STROKE} strokeWidth="1" />

      {/* Notes */}
      <text x="300" y="280" textAnchor="middle" fontSize="8" fill={LIGHT}>Cascade controller fires boilers in sequence based on demand</text>
      <text x="300" y="293" textAnchor="middle" fontSize="8" fill={LIGHT}>Each boiler has isolation valves for independent service</text>
    </svg>
  );
}

export function ReverseReturnBoilerDiagram() {
  return (
    <svg viewBox="0 0 600 300" className="w-full bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
      <text x="300" y="290" textAnchor="middle" fontSize="11" fontWeight="bold" fill={STROKE}>FIGURE 8 — REVERSE RETURN (BOILERS)</text>

      {/* Supply (top, L to R) */}
      <line x1="30" y1="60" x2="520" y2="60" stroke={STROKE} strokeWidth="2" />
      <polygon points="515,57 515,63 522,60" fill={STROKE} />
      <text x="275" y="45" textAnchor="middle" fontSize="9" fill={LIGHT}>SUPPLY (Left to Right)</text>

      {/* Boilers */}
      <line x1="130" y1="60" x2="130" y2="95" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="130" cy="60" r="3" fill={STROKE} />
      <rect x="95" y="95" width="70" height="50" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="130" y="123" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #1</text>

      <line x1="300" y1="60" x2="300" y2="95" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="300" cy="60" r="3" fill={STROKE} />
      <rect x="265" y="95" width="70" height="50" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="300" y="123" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #2</text>

      <line x1="470" y1="60" x2="470" y2="95" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="470" cy="60" r="3" fill={STROKE} />
      <rect x="435" y="95" width="70" height="50" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="470" y="123" textAnchor="middle" fontSize="9" fill={STROKE}>Boiler #3</text>

      {/* Return (bottom, R to L) */}
      <line x1="130" y1="145" x2="130" y2="200" stroke={STROKE} strokeWidth="1.5" />
      <line x1="300" y1="145" x2="300" y2="200" stroke={STROKE} strokeWidth="1.5" />
      <line x1="470" y1="145" x2="470" y2="200" stroke={STROKE} strokeWidth="1.5" />

      <line x1="80" y1="200" x2="470" y2="200" stroke={STROKE} strokeWidth="2" />
      <polygon points="85,197 85,203 78,200" fill={STROKE} />
      <circle cx="130" cy="200" r="3" fill={STROKE} />
      <circle cx="300" cy="200" r="3" fill={STROKE} />
      <circle cx="470" cy="200" r="3" fill={STROKE} />
      <text x="275" y="218" textAnchor="middle" fontSize="9" fill={LIGHT}>RETURN (Right to Left — REVERSE)</text>

      {/* Key concept */}
      <rect x="80" y="235" width="440" height="40" fill="none" stroke={LIGHT} strokeWidth="0.5" />
      <text x="300" y="253" textAnchor="middle" fontSize="8" fill={LIGHT}>FIRST connected to Supply = LAST connected to Return</text>
      <text x="300" y="266" textAnchor="middle" fontSize="8" fill={LIGHT}>Equal total pipe length per boiler = self-balancing flow (no balancing valves needed)</text>
    </svg>
  );
}
