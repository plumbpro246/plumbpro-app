/**
 * UPC/IPC Code Book Style Piping Diagrams
 * Standard plumbing schematic symbols, legends, notes sections, figure numbers
 */

const S = "#000"; // Primary stroke
const L = "#444"; // Label/text color
const LT = "#666"; // Light annotation text

// Standard Symbol Components
function BallValve({ x, y, label }) {
  return (
    <g>
      <polygon points={`${x-7},${y-5} ${x},${y} ${x-7},${y+5}`} fill="none" stroke={S} strokeWidth="1.2" />
      <polygon points={`${x+7},${y-5} ${x},${y} ${x+7},${y+5}`} fill="none" stroke={S} strokeWidth="1.2" />
      {label && <text x={x} y={y-10} textAnchor="middle" fontSize="7" fill={LT}>{label}</text>}
    </g>
  );
}

function CheckValve({ x, y, dir = "right" }) {
  if (dir === "right") {
    return (
      <g>
        <line x1={x-6} y1={y-5} x2={x+6} y2={y} stroke={S} strokeWidth="1.2" />
        <line x1={x-6} y1={y+5} x2={x+6} y2={y} stroke={S} strokeWidth="1.2" />
        <line x1={x+6} y1={y-6} x2={x+6} y2={y+6} stroke={S} strokeWidth="1.2" />
      </g>
    );
  }
  return (
    <g>
      <line x1={x-6} y1={y} x2={x+6} y2={y-5} stroke={S} strokeWidth="1.2" />
      <line x1={x-6} y1={y} x2={x+6} y2={y+5} stroke={S} strokeWidth="1.2" />
      <line x1={x-6} y1={y-6} x2={x-6} y2={y+6} stroke={S} strokeWidth="1.2" />
    </g>
  );
}

function PumpSymbol({ x, y, label }) {
  return (
    <g>
      <circle cx={x} cy={y} r="10" fill="none" stroke={S} strokeWidth="1.5" />
      <polygon points={`${x-5},${y-4} ${x+6},${y} ${x-5},${y+4}`} fill={S} />
      {label && <text x={x} y={y+22} textAnchor="middle" fontSize="7" fill={LT}>{label}</text>}
    </g>
  );
}

function ExpansionTank({ x, y, horizontal }) {
  if (horizontal) {
    return (
      <g>
        <ellipse cx={x} cy={y} rx="22" ry="14" fill="none" stroke={S} strokeWidth="1.5" />
        <line x1={x-22} y1={y} x2={x+22} y2={y} stroke={S} strokeWidth="0.8" strokeDasharray="3,2" />
        <text x={x} y={y+26} textAnchor="middle" fontSize="7" fill={LT}>EXPANSION</text>
        <text x={x} y={y+35} textAnchor="middle" fontSize="7" fill={LT}>TANK</text>
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx="14" ry="22" fill="none" stroke={S} strokeWidth="1.5" />
      <line x1={x-14} y1={y} x2={x+14} y2={y} stroke={S} strokeWidth="0.8" strokeDasharray="3,2" />
    </g>
  );
}

function TPValve({ x, y }) {
  return (
    <g>
      <rect x={x-8} y={y-5} width="16" height="10" fill="none" stroke={S} strokeWidth="1.2" />
      <text x={x} y={y+3} textAnchor="middle" fontSize="6" fill={S} fontWeight="bold">T&P</text>
    </g>
  );
}

function FlowArrow({ x, y, dir = "right" }) {
  const arrows = {
    right: `M${x-5},${y-3} L${x+5},${y} L${x-5},${y+3}`,
    left: `M${x+5},${y-3} L${x-5},${y} L${x+5},${y+3}`,
    down: `M${x-3},${y-5} L${x},${y+5} L${x+3},${y-5}`,
    up: `M${x-3},${y+5} L${x},${y-5} L${x+3},${y+5}`,
  };
  return <path d={arrows[dir]} fill={S} stroke="none" />;
}

function Legend({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="220" height="95" fill="none" stroke={S} strokeWidth="1" />
      <text x={x+110} y={y+14} textAnchor="middle" fontSize="8" fill={S} fontWeight="bold">LEGEND</text>
      <line x1={x} y1={y+18} x2={x+220} y2={y+18} stroke={S} strokeWidth="0.5" />
      {/* Ball Valve */}
      <g transform={`translate(${x+15},${y+32})`}>
        <polygon points="-6,-4 0,0 -6,4" fill="none" stroke={S} strokeWidth="1" />
        <polygon points="6,-4 0,0 6,4" fill="none" stroke={S} strokeWidth="1" />
      </g>
      <text x={x+30} y={y+35} fontSize="7" fill={L}>BALL VALVE</text>
      {/* Check Valve */}
      <g transform={`translate(${x+15},${y+48})`}>
        <line x1="-5" y1="-4" x2="5" y2="0" stroke={S} strokeWidth="1" />
        <line x1="-5" y1="4" x2="5" y2="0" stroke={S} strokeWidth="1" />
        <line x1="5" y1="-5" x2="5" y2="5" stroke={S} strokeWidth="1" />
      </g>
      <text x={x+30} y={y+51} fontSize="7" fill={L}>CHECK VALVE</text>
      {/* Pump */}
      <g transform={`translate(${x+15},${y+64})`}>
        <circle cx="0" cy="0" r="6" fill="none" stroke={S} strokeWidth="1" />
        <polygon points="-3,-2 4,0 -3,2" fill={S} />
      </g>
      <text x={x+30} y={y+67} fontSize="7" fill={L}>CIRCULATING PUMP</text>
      {/* Expansion Tank */}
      <g transform={`translate(${x+15},${y+82})`}>
        <ellipse cx="0" cy="0" rx="8" ry="5" fill="none" stroke={S} strokeWidth="1" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke={S} strokeWidth="0.5" strokeDasharray="2,1" />
      </g>
      <text x={x+30} y={y+85} fontSize="7" fill={L}>EXPANSION TANK</text>
      {/* T&P Valve */}
      <g transform={`translate(${x+130},${y+32})`}>
        <rect x="-6" y="-4" width="12" height="8" fill="none" stroke={S} strokeWidth="1" />
        <text x="0" y="2" textAnchor="middle" fontSize="5" fill={S}>T&P</text>
      </g>
      <text x={x+145} y={y+35} fontSize="7" fill={L}>T&P RELIEF VALVE</text>
      {/* Flow arrow */}
      <g transform={`translate(${x+130},${y+48})`}>
        <polygon points="-4,-3 4,0 -4,3" fill={S} />
      </g>
      <text x={x+145} y={y+51} fontSize="7" fill={L}>FLOW DIRECTION</text>
      {/* Drain valve */}
      <g transform={`translate(${x+130},${y+64})`}>
        <line x1="-5" y1="0" x2="5" y2="0" stroke={S} strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="5" stroke={S} strokeWidth="1" />
      </g>
      <text x={x+145} y={y+67} fontSize="7" fill={L}>DRAIN VALVE</text>
      {/* Tee */}
      <g transform={`translate(${x+130},${y+82})`}>
        <circle cx="0" cy="0" r="3" fill={S} />
      </g>
      <text x={x+145} y={y+85} fontSize="7" fill={L}>TEE CONNECTION</text>
    </g>
  );
}

// ==================== WATER HEATER DIAGRAMS ====================

export function SingleWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 650 580" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Figure Title */}
      <rect x="0" y="545" width="650" height="35" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="562" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 608.3 — INSTALLATION OF WATER HEATER WITH THERMAL EXPANSION TANK</text>
      <text x="325" y="575" textAnchor="middle" fontSize="8" fill={LT}>(Per UPC Section 608.3 / IPC Section 607.3.2)</text>

      {/* Water Heater (vertical cylinder) */}
      <rect x="260" y="180" width="110" height="220" fill="none" stroke={S} strokeWidth="2" />
      <line x1="260" y1="180" x2="270" y2="170" stroke={S} strokeWidth="1.5" />
      <line x1="370" y1="180" x2="360" y2="170" stroke={S} strokeWidth="1.5" />
      <line x1="270" y1="170" x2="360" y2="170" stroke={S} strokeWidth="1.5" />
      <text x="315" y="295" textAnchor="middle" fontSize="12" fill={S} fontWeight="bold">WATER</text>
      <text x="315" y="312" textAnchor="middle" fontSize="12" fill={S} fontWeight="bold">HEATER</text>

      {/* T&P Valve (right side) */}
      <TPValve x={385} y={220} />
      <line x1="393" y1="220" x2="420" y2="220" stroke={S} strokeWidth="1.5" />
      <line x1="420" y1="220" x2="420" y2="460" stroke={S} strokeWidth="1.5" />
      {/* Discharge termination */}
      <line x1="415" y1="460" x2="425" y2="460" stroke={S} strokeWidth="1" />
      <line x1="412" y1="465" x2="428" y2="465" stroke={S} strokeWidth="0.8" />
      {/* Label */}
      <line x1="425" y1="350" x2="460" y2="350" stroke={LT} strokeWidth="0.5" />
      <text x="465" y="345" fontSize="8" fill={L}>DISCHARGE</text>
      <text x="465" y="356" fontSize="8" fill={L}>LINE</text>
      <text x="465" y="380" fontSize="7" fill={LT}>(Terminate within</text>
      <text x="465" y="390" fontSize="7" fill={LT}>6" of floor or to</text>
      <text x="465" y="400" fontSize="7" fill={LT}>approved location)</text>

      {/* Cold Water Supply (from right) */}
      <line x1="580" y1="190" x2="370" y2="190" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={380} y={190} dir="left" />
      {/* Shutoff valve */}
      <BallValve x={500} y={190} />
      {/* Check valve / backflow preventer */}
      <CheckValve x={460} y={190} dir="left" />
      {/* Label */}
      <text x="560" y="180" fontSize="8" fill={L}>COLD WATER</text>
      <text x="560" y="191" fontSize="8" fill={L}>SUPPLY</text>

      {/* Expansion Tank (on cold line, vertical) */}
      <line x1="530" y1="190" x2="530" y2="120" stroke={S} strokeWidth="1.5" />
      <circle cx="530" cy="190" r="3" fill={S} />
      <ExpansionTank x={530} y={90} horizontal={false} />
      {/* Optional locations (dashed) */}
      <rect x="508" y="55" width="44" height="80" fill="none" stroke={S} strokeWidth="1" strokeDasharray="4,3" />
      <text x="530" y="48" textAnchor="middle" fontSize="7" fill={LT}>EXPANSION TANK</text>
      <text x="530" y="145" textAnchor="middle" fontSize="7" fill={LT}>(Required when</text>
      <text x="530" y="155" textAnchor="middle" fontSize="7" fill={LT}>check valve or BFP</text>
      <text x="530" y="165" textAnchor="middle" fontSize="7" fill={LT}>is installed)</text>

      {/* Hot Water Out (left side) */}
      <line x1="260" y1="190" x2="60" y2="190" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={70} y={190} dir="left" />
      {/* Shutoff */}
      <BallValve x={160} y={190} />
      {/* Label */}
      <text x="40" y="180" fontSize="8" fill={L}>TO SYSTEM</text>
      <line x1="60" y1="190" x2="40" y2="190" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={45} y={190} dir="left" />

      {/* Gas Supply (bottom) */}
      <line x1="40" y1="370" x2="260" y2="370" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={250} y={370} dir="right" />
      <BallValve x={100} y={370} />
      {/* Drip leg */}
      <line x1="160" y1="370" x2="160" y2="430" stroke={S} strokeWidth="1.5" />
      <circle cx="160" cy="370" r="3" fill={S} />
      <line x1="155" y1="430" x2="165" y2="430" stroke={S} strokeWidth="1.5" />
      <line x1="156" y1="434" x2="164" y2="434" stroke={S} strokeWidth="1" />
      {/* Labels */}
      <text x="40" y="360" fontSize="8" fill={L}>GAS SUPPLY</text>
      <line x1="168" y1="420" x2="200" y2="420" stroke={LT} strokeWidth="0.5" />
      <text x="205" y="418" fontSize="7" fill={LT}>SEDIMENT TRAP</text>
      <text x="205" y="428" fontSize="7" fill={LT}>(DRIP LEG)</text>

      {/* Draft Hood / Vent */}
      <path d="M 290 170 L 290 140 L 285 140 L 315 110 L 345 140 L 340 140 L 340 170" fill="none" stroke={S} strokeWidth="1.5" />
      <line x1="305" y1="110" x2="305" y2="40" stroke={S} strokeWidth="1.5" />
      <line x1="325" y1="110" x2="325" y2="40" stroke={S} strokeWidth="1.5" />
      <line x1="300" y1="40" x2="330" y2="40" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={315} y={55} dir="up" />
      <text x="340" y="70" fontSize="8" fill={L}>VENT TO</text>
      <text x="340" y="81" fontSize="8" fill={L}>CHIMNEY</text>
      <text x="340" y="95" fontSize="7" fill={LT}>(Slope 1/4"/ft</text>
      <text x="340" y="105" fontSize="7" fill={LT}>toward chimney)</text>

      {/* Drain Pan */}
      <path d="M 245 400 L 245 415 L 385 415 L 385 400" fill="none" stroke={S} strokeWidth="1" strokeDasharray="5,3" />
      <text x="315" y="432" textAnchor="middle" fontSize="7" fill={LT}>DRAIN PAN (where required)</text>

      {/* Drain Valve */}
      <line x1="315" y1="400" x2="315" y2="415" stroke={S} strokeWidth="1" />
      <line x1="310" y1="415" x2="320" y2="415" stroke={S} strokeWidth="1.5" />
      <line x1="315" y1="415" x2="315" y2="420" stroke={S} strokeWidth="1" />
      <text x="315" y="445" textAnchor="middle" fontSize="7" fill={LT}>DRAIN VALVE</text>

      {/* Legend */}
      <Legend x={20} y={450} />

      {/* Notes */}
      <rect x="260" y="450" width="370" height="90" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="270" y="465" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="270" y="478" fontSize="7" fill={L}>1. Expansion tank required per UPC 608.3 / IPC 607.3.2 when</text>
      <text x="278" y="489" fontSize="7" fill={L}>check valve or backflow preventer is installed on supply.</text>
      <text x="270" y="502" fontSize="7" fill={L}>2. T&P relief valve required per UPC 507.3 / IPC 501.5.</text>
      <text x="270" y="515" fontSize="7" fill={L}>3. Gas piping per IFGC. Sediment trap (drip leg) required.</text>
      <text x="270" y="528" fontSize="7" fill={L}>4. All installations shall comply with local codes and</text>
      <text x="278" y="539" fontSize="7" fill={L}>manufacturer's installation instructions.</text>
    </svg>
  );
}

export function SeriesWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 650 360" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="330" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="350" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 608.4 — WATER HEATERS CONNECTED IN SERIES</text>

      {/* WH 1 */}
      <rect x="140" y="80" width="90" height="130" fill="none" stroke={S} strokeWidth="2" />
      <text x="185" y="145" textAnchor="middle" fontSize="10" fill={S}>HEATER</text>
      <text x="185" y="160" textAnchor="middle" fontSize="10" fill={S}>#1</text>

      {/* WH 2 */}
      <rect x="380" y="80" width="90" height="130" fill="none" stroke={S} strokeWidth="2" />
      <text x="425" y="145" textAnchor="middle" fontSize="10" fill={S}>HEATER</text>
      <text x="425" y="160" textAnchor="middle" fontSize="10" fill={S}>#2</text>

      {/* Cold in */}
      <line x1="30" y1="100" x2="140" y2="100" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={130} y={100} dir="right" />
      <BallValve x={80} y={100} />
      <text x="30" y="90" fontSize="8" fill={L}>COLD WATER</text>
      <text x="30" y="118" fontSize="8" fill={L}>SUPPLY</text>

      {/* Between heaters */}
      <line x1="230" y1="100" x2="380" y2="100" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={300} y={100} dir="right" />
      <text x="305" y="88" textAnchor="middle" fontSize="7" fill={LT}>PRE-HEATED</text>

      {/* Hot out */}
      <line x1="470" y1="100" x2="620" y2="100" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={610} y={100} dir="right" />
      <BallValve x={540} y={100} />
      <text x="590" y="90" fontSize="8" fill={L}>TO SYSTEM</text>

      {/* T&P on each */}
      <TPValve x={240} y={120} />
      <TPValve x={480} y={120} />

      {/* Notes */}
      <rect x="30" y="240" width="590" height="80" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="40" y="255" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="40" y="270" fontSize="7" fill={L}>1. Water flows through Heater #1 first (pre-heating), then Heater #2 (boost to final temp).</text>
      <text x="40" y="283" fontSize="7" fill={L}>2. Set Heater #1 at lower temperature (100-110°F); Heater #2 at final desired temperature (120°F).</text>
      <text x="40" y="296" fontSize="7" fill={L}>3. Heater #1 carries heavier load and may require earlier replacement.</text>
      <text x="40" y="309" fontSize="7" fill={L}>4. Each heater shall have individual T&P relief valve per UPC 507.3 / IPC 501.5.</text>
    </svg>
  );
}

export function ParallelWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 650 420" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="390" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="410" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 608.5 — WATER HEATERS CONNECTED IN PARALLEL</text>

      {/* Cold supply header (vertical left) */}
      <line x1="60" y1="50" x2="60" y2="310" stroke={S} strokeWidth="2" />
      <line x1="30" y1="180" x2="60" y2="180" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={50} y={180} dir="right" />
      <text x="15" y="170" fontSize="8" fill={L}>COLD</text>
      <text x="15" y="182" fontSize="8" fill={L}>SUPPLY</text>

      {/* Branch to WH1 */}
      <line x1="60" y1="100" x2="180" y2="100" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={170} y={100} dir="right" />
      <circle cx="60" cy="100" r="3" fill={S} />
      <BallValve x={110} y={100} />

      {/* Branch to WH2 */}
      <line x1="60" y1="260" x2="180" y2="260" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={170} y={260} dir="right" />
      <circle cx="60" cy="260" r="3" fill={S} />
      <BallValve x={110} y={260} />

      {/* WH 1 */}
      <rect x="180" y="60" width="90" height="80" fill="none" stroke={S} strokeWidth="2" />
      <text x="225" y="100" textAnchor="middle" fontSize="9" fill={S}>HEATER #1</text>
      <TPValve x={280} y={80} />

      {/* WH 2 */}
      <rect x="180" y="220" width="90" height="80" fill="none" stroke={S} strokeWidth="2" />
      <text x="225" y="260" textAnchor="middle" fontSize="9" fill={S}>HEATER #2</text>
      <TPValve x={280} y={240} />

      {/* Hot from WH1 */}
      <line x1="270" y1="100" x2="420" y2="100" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={400} y={100} dir="right" />
      <BallValve x={340} y={100} label="BALANCING" />

      {/* Hot from WH2 */}
      <line x1="270" y1="260" x2="420" y2="260" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={400} y={260} dir="right" />
      <BallValve x={340} y={260} label="BALANCING" />

      {/* Hot supply header (vertical right) */}
      <line x1="420" y1="50" x2="420" y2="310" stroke={S} strokeWidth="2" />
      <circle cx="420" cy="100" r="3" fill={S} />
      <circle cx="420" cy="260" r="3" fill={S} />

      {/* Hot out to system */}
      <line x1="420" y1="180" x2="600" y2="180" stroke={S} strokeWidth="2" />
      <FlowArrow x={590} y={180} dir="right" />
      <text x="570" y="170" fontSize="8" fill={L}>TO SYSTEM</text>

      {/* Notes */}
      <rect x="440" y="50" width="195" height="120" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="450" y="65" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="450" y="80" fontSize="7" fill={L}>1. Install balancing valves for</text>
      <text x="455" y="92" fontSize="7" fill={L}>equal flow distribution.</text>
      <text x="450" y="107" fontSize="7" fill={L}>2. Each heater shall have</text>
      <text x="455" y="119" fontSize="7" fill={L}>individual T&P relief valve.</text>
      <text x="450" y="134" fontSize="7" fill={L}>3. System provides redundancy</text>
      <text x="455" y="146" fontSize="7" fill={L}>— one heater may be isolated</text>
      <text x="455" y="158" fontSize="7" fill={L}>for service.</text>
    </svg>
  );
}

export function ReverseReturnWHDiagram() {
  return (
    <svg viewBox="0 0 650 380" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="350" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="370" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 608.6 — MULTIPLE WATER HEATERS, REVERSE RETURN PIPING</text>

      {/* Cold supply header (top) */}
      <line x1="40" y1="60" x2="560" y2="60" stroke={S} strokeWidth="2" />
      <FlowArrow x={300} y={60} dir="right" />
      <text x="50" y="50" fontSize="8" fill={L}>COLD SUPPLY HEADER</text>

      {/* Drop to heaters */}
      {[140, 300, 460].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1="60" x2={cx} y2="100" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="60" r="3" fill={S} />
          <BallValve x={cx} y={80} />
          <rect x={cx-40} y="100" width="80" height="60" fill="none" stroke={S} strokeWidth="1.5" />
          <text x={cx} y="133" textAnchor="middle" fontSize="9" fill={S}>HEATER #{i+1}</text>
          <line x1={cx} y1="160" x2={cx} y2="200" stroke={S} strokeWidth="1.5" />
          <BallValve x={cx} y={180} />
        </g>
      ))}

      {/* Hot return header (bottom — REVERSE direction) */}
      <line x1="90" y1="200" x2="460" y2="200" stroke={S} strokeWidth="2" />
      <FlowArrow x={200} y={200} dir="left" />
      <circle cx="140" cy="200" r="3" fill={S} />
      <circle cx="300" cy="200" r="3" fill={S} />
      <circle cx="460" cy="200" r="3" fill={S} />
      {/* Out to system */}
      <line x1="90" y1="200" x2="40" y2="200" stroke={S} strokeWidth="2" />
      <FlowArrow x={45} y={200} dir="left" />
      <text x="25" y="190" fontSize="8" fill={L}>TO</text>
      <text x="25" y="202" fontSize="8" fill={L}>SYSTEM</text>
      <text x="260" y="220" textAnchor="middle" fontSize="8" fill={L}>HOT RETURN HEADER (reverse direction)</text>

      {/* Annotations */}
      <line x1="140" y1="230" x2="140" y2="250" stroke={LT} strokeWidth="0.5" strokeDasharray="3,2" />
      <text x="140" y="265" textAnchor="middle" fontSize="7" fill={LT}>FIRST on supply</text>
      <text x="140" y="276" textAnchor="middle" fontSize="7" fill={LT}>= LAST on return</text>

      <line x1="460" y1="230" x2="460" y2="250" stroke={LT} strokeWidth="0.5" strokeDasharray="3,2" />
      <text x="460" y="265" textAnchor="middle" fontSize="7" fill={LT}>LAST on supply</text>
      <text x="460" y="276" textAnchor="middle" fontSize="7" fill={LT}>= FIRST on return</text>

      {/* Notes */}
      <rect x="40" y="290" width="570" height="50" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="50" y="305" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="50" y="318" fontSize="7" fill={L}>1. Reverse return ensures equal pipe length for each heater = balanced flow without balancing valves.</text>
      <text x="50" y="331" fontSize="7" fill={L}>2. First heater connected to cold supply is LAST heater connected to hot return header.</text>
    </svg>
  );
}

// ==================== BOILER DIAGRAMS ====================

export function SingleBoilerDiagram() {
  return (
    <svg viewBox="0 0 650 560" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="530" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="550" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 1001.1 — HYDRONIC BOILER NEAR-BOILER PIPING (CONDENSING)</text>

      {/* Boiler */}
      <rect x="80" y="260" width="130" height="90" fill="none" stroke={S} strokeWidth="2" />
      <text x="145" y="305" textAnchor="middle" fontSize="11" fill={S} fontWeight="bold">BOILER</text>
      <text x="145" y="320" textAnchor="middle" fontSize="8" fill={LT}>(Mod-Con)</text>

      {/* Supply out top */}
      <line x1="145" y1="260" x2="145" y2="185" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={145} y={200} dir="up" />

      {/* Air Separator */}
      <circle cx="145" cy="165" r="18" fill="none" stroke={S} strokeWidth="1.5" />
      <line x1="127" y1="165" x2="163" y2="165" stroke={S} strokeWidth="0.8" strokeDasharray="3,2" />
      {/* Air vent */}
      <line x1="145" y1="147" x2="145" y2="125" stroke={S} strokeWidth="1" />
      <rect x="137" y="115" width="16" height="12" fill="none" stroke={S} strokeWidth="1" />
      <text x="145" y="124" textAnchor="middle" fontSize="6" fill={S}>AV</text>
      <text x="170" y="120" fontSize="7" fill={LT}>AUTO AIR VENT</text>
      <text x="100" y="168" fontSize="7" fill={LT}>AIR</text>
      <text x="100" y="178" fontSize="7" fill={LT}>SEPARATOR</text>

      {/* Supply header right */}
      <line x1="163" y1="165" x2="520" y2="165" stroke={S} strokeWidth="2" />
      <FlowArrow x={350} y={165} dir="right" />
      <text x="420" y="155" fontSize="8" fill={L}>SUPPLY TO ZONES</text>

      {/* Pump on supply */}
      <PumpSymbol x={250} y={165} label="SYSTEM PUMP" />

      {/* Zone 1 */}
      <line x1="430" y1="165" x2="430" y2="80" stroke={S} strokeWidth="1.5" />
      <circle cx="430" cy="165" r="3" fill={S} />
      <FlowArrow x={430} y={100} dir="up" />
      <rect x="418" y="70" width="24" height="14" fill="none" stroke={S} strokeWidth="1" />
      <text x="430" y="80" textAnchor="middle" fontSize="6" fill={S}>ZV</text>
      <text x="430" y="60" textAnchor="middle" fontSize="8" fill={L}>ZONE 1</text>

      {/* Zone 2 */}
      <line x1="500" y1="165" x2="500" y2="80" stroke={S} strokeWidth="1.5" />
      <circle cx="500" cy="165" r="3" fill={S} />
      <FlowArrow x={500} y={100} dir="up" />
      <rect x="488" y="70" width="24" height="14" fill="none" stroke={S} strokeWidth="1" />
      <text x="500" y="80" textAnchor="middle" fontSize="6" fill={S}>ZV</text>
      <text x="500" y="60" textAnchor="middle" fontSize="8" fill={L}>ZONE 2</text>

      {/* Return from zones (dashed) */}
      <line x1="430" y1="55" x2="430" y2="30" stroke={S} strokeWidth="1" strokeDasharray="5,3" />
      <line x1="500" y1="55" x2="500" y2="30" stroke={S} strokeWidth="1" strokeDasharray="5,3" />
      <text x="465" y="25" textAnchor="middle" fontSize="7" fill={LT}>(To/From Radiation)</text>
      <line x1="430" y1="30" x2="430" y2="420" stroke={S} strokeWidth="1" strokeDasharray="5,3" />
      <line x1="500" y1="30" x2="500" y2="420" stroke={S} strokeWidth="1" strokeDasharray="5,3" />

      {/* Return header */}
      <line x1="520" y1="420" x2="163" y2="420" stroke={S} strokeWidth="2" />
      <FlowArrow x={300} y={420} dir="left" />
      <circle cx="430" cy="420" r="3" fill={S} />
      <circle cx="500" cy="420" r="3" fill={S} />
      <text x="400" y="440" fontSize="8" fill={L}>RETURN FROM ZONES</text>

      {/* Return into boiler */}
      <line x1="145" y1="420" x2="145" y2="350" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={145} y={360} dir="up" />

      {/* Expansion Tank on return */}
      <line x1="80" y1="420" x2="145" y2="420" stroke={S} strokeWidth="1.5" />
      <ExpansionTank x={50} y={420} horizontal={false} />
      <text x="50" y="455" textAnchor="middle" fontSize="7" fill={LT}>EXPANSION</text>
      <text x="50" y="465" textAnchor="middle" fontSize="7" fill={LT}>TANK</text>

      {/* Gas supply */}
      <line x1="30" y1="310" x2="80" y2="310" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={70} y={310} dir="right" />
      <BallValve x={55} y={310} />
      <text x="20" y="303" fontSize="8" fill={L}>GAS</text>

      {/* Condensate */}
      <line x1="145" y1="350" x2="145" y2="490" stroke={S} strokeWidth="1" strokeDasharray="3,3" />
      <rect x="125" y="490" width="40" height="18" fill="none" stroke={S} strokeWidth="1" />
      <text x="145" y="502" textAnchor="middle" fontSize="7" fill={S}>NEUT</text>
      <text x="145" y="520" textAnchor="middle" fontSize="7" fill={LT}>CONDENSATE</text>
      <text x="145" y="528" textAnchor="middle" fontSize="7" fill={LT}>NEUTRALIZER</text>

      {/* Vent */}
      <line x1="210" y1="285" x2="260" y2="285" stroke={S} strokeWidth="1.5" />
      <line x1="260" y1="285" x2="260" y2="30" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={260} y={50} dir="up" />
      <text x="270" y="30" fontSize="7" fill={LT}>PVC VENT</text>
      <text x="270" y="40" fontSize="7" fill={LT}>(Condensing)</text>

      {/* Notes */}
      <rect x="300" y="450" width="330" height="75" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="310" y="465" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="310" y="478" fontSize="7" fill={L}>1. ZV = Zone Valve. NEUT = Condensate Neutralizer.</text>
      <text x="310" y="491" fontSize="7" fill={L}>2. Condensing boilers require PVC/CPVC venting.</text>
      <text x="310" y="504" fontSize="7" fill={L}>3. Condensate neutralizer required per IMC 307.2.</text>
      <text x="310" y="517" fontSize="7" fill={L}>4. Expansion tank required per IMC 1009.0.</text>
    </svg>
  );
}

export function PrimarySecondaryDiagram() {
  return (
    <svg viewBox="0 0 650 360" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="330" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="350" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 1001.2 — PRIMARY / SECONDARY PIPING CONFIGURATION</text>

      {/* Primary Loop */}
      <rect x="90" y="110" width="460" height="130" fill="none" stroke={S} strokeWidth="2.5" />
      <FlowArrow x={320} y={110} dir="right" />
      <FlowArrow x={550} y={175} dir="down" />
      <FlowArrow x={320} y={240} dir="left" />
      <FlowArrow x={90} y={175} dir="up" />
      <text x="320" y="100" textAnchor="middle" fontSize="9" fill={L} fontWeight="bold">PRIMARY LOOP</text>

      {/* Primary pump */}
      <PumpSymbol x={200} y={110} label="P-1 (PRIMARY)" />

      {/* Boiler (closely-spaced tees left side) */}
      <circle cx="110" cy="150" r="3" fill={S} />
      <circle cx="110" cy="190" r="3" fill={S} />
      <line x1="110" y1="150" x2="40" y2="150" stroke={S} strokeWidth="1.5" />
      <line x1="40" y1="150" x2="40" y2="190" stroke={S} strokeWidth="1.5" />
      <line x1="40" y1="190" x2="110" y2="190" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={50} y={170} dir="down" />
      <rect x="15" y="155" width="50" height="30" fill="none" stroke={S} strokeWidth="1.5" />
      <text x="40" y="174" textAnchor="middle" fontSize="8" fill={S}>BOILER</text>
      {/* CST label */}
      <text x="80" y="145" fontSize="6" fill={LT}>CST</text>
      <text x="80" y="198" fontSize="6" fill={LT}>CST</text>

      {/* Zone 1 (top right CST) */}
      <circle cx="400" cy="110" r="3" fill={S} />
      <circle cx="430" cy="110" r="3" fill={S} />
      <line x1="400" y1="110" x2="400" y2="50" stroke={S} strokeWidth="1.5" />
      <line x1="430" y1="110" x2="430" y2="50" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={400} y={70} dir="up" />
      <rect x="383" y="22" width="64" height="25" fill="none" stroke={S} strokeWidth="1" />
      <text x="415" y="38" textAnchor="middle" fontSize="8" fill={S}>ZONE 1</text>
      <PumpSymbol x={450} y={70} label="P-2" />

      {/* Zone 2 (bottom right CST) */}
      <circle cx="400" cy="240" r="3" fill={S} />
      <circle cx="430" cy="240" r="3" fill={S} />
      <line x1="400" y1="240" x2="400" y2="295" stroke={S} strokeWidth="1.5" />
      <line x1="430" y1="240" x2="430" y2="295" stroke={S} strokeWidth="1.5" />
      <FlowArrow x={400} y={270} dir="down" />
      <rect x="383" y="295" width="64" height="25" fill="none" stroke={S} strokeWidth="1" />
      <text x="415" y="311" textAnchor="middle" fontSize="8" fill={S}>ZONE 2</text>
      <PumpSymbol x={450} y={270} label="P-3" />

      {/* Notes */}
      <text x="150" y="270" fontSize="7" fill={LT}>CST = Closely-Spaced Tees (max 4 pipe diameters apart)</text>
      <text x="150" y="283" fontSize="7" fill={LT}>Each circuit is hydraulically independent with its own pump</text>
      <text x="150" y="296" fontSize="7" fill={LT}>Required for modulating-condensing boilers per manufacturer instructions</text>
    </svg>
  );
}

export function ParallelBoilerDiagram() {
  return (
    <svg viewBox="0 0 650 360" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="330" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="350" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 1001.3 — MULTIPLE BOILERS, PARALLEL HEADER (CASCADE)</text>

      {/* Supply header */}
      <line x1="50" y1="60" x2="600" y2="60" stroke={S} strokeWidth="2.5" />
      <FlowArrow x={550} y={60} dir="right" />
      <text x="325" y="45" textAnchor="middle" fontSize="9" fill={L}>SUPPLY HEADER</text>
      <text x="610" y="64" fontSize="7" fill={LT}>To Zones</text>

      {/* Return header */}
      <line x1="50" y1="240" x2="600" y2="240" stroke={S} strokeWidth="2.5" />
      <FlowArrow x={100} y={240} dir="left" />
      <text x="325" y="260" textAnchor="middle" fontSize="9" fill={L}>RETURN HEADER</text>

      {/* Boilers */}
      {[150, 325, 500].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1="60" x2={cx} y2="90" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="60" r="3" fill={S} />
          <BallValve x={cx} y={80} />
          <rect x={cx-40} y="110" width="80" height="55" fill="none" stroke={S} strokeWidth="1.5" />
          <text x={cx} y="140" textAnchor="middle" fontSize="9" fill={S}>BOILER #{i+1}</text>
          <line x1={cx} y1="165" x2={cx} y2="240" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="240" r="3" fill={S} />
          <BallValve x={cx} y={200} />
        </g>
      ))}

      {/* Notes */}
      <rect x="50" y="275" width="550" height="45" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="60" y="290" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="60" y="303" fontSize="7" fill={L}>1. Cascade controller fires boilers in sequence based on demand. Each boiler has isolation valves.</text>
      <text x="60" y="316" fontSize="7" fill={L}>2. Install per IMC 1001.1 and manufacturer's installation instructions.</text>
    </svg>
  );
}

export function ReverseReturnBoilerDiagram() {
  return (
    <svg viewBox="0 0 650 330" className="w-full bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <rect x="0" y="300" width="650" height="30" fill="none" stroke={S} strokeWidth="1" />
      <text x="325" y="320" textAnchor="middle" fontSize="10" fontWeight="bold" fill={S}>FIGURE 1001.4 — MULTIPLE BOILERS, REVERSE RETURN PIPING</text>

      {/* Supply (top, L to R) */}
      <line x1="40" y1="60" x2="560" y2="60" stroke={S} strokeWidth="2" />
      <FlowArrow x={300} y={60} dir="right" />
      <text x="300" y="45" textAnchor="middle" fontSize="8" fill={L}>SUPPLY (Left to Right)</text>

      {/* Boilers */}
      {[140, 320, 500].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1="60" x2={cx} y2="95" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="60" r="3" fill={S} />
          <rect x={cx-35} y="95" width="70" height="45" fill="none" stroke={S} strokeWidth="1.5" />
          <text x={cx} y="121" textAnchor="middle" fontSize="9" fill={S}>BOILER #{i+1}</text>
          <line x1={cx} y1="140" x2={cx} y2="180" stroke={S} strokeWidth="1.5" />
          <circle cx={cx} cy="180" r="3" fill={S} />
        </g>
      ))}

      {/* Return (bottom, R to L — REVERSE) */}
      <line x1="90" y1="180" x2="500" y2="180" stroke={S} strokeWidth="2" />
      <FlowArrow x={200} y={180} dir="left" />
      <text x="300" y="198" textAnchor="middle" fontSize="8" fill={L}>RETURN (Right to Left — REVERSE)</text>

      {/* To system */}
      <line x1="90" y1="180" x2="40" y2="180" stroke={S} strokeWidth="2" />
      <FlowArrow x={45} y={180} dir="left" />
      <text x="25" y="175" fontSize="7" fill={L}>TO</text>
      <text x="25" y="186" fontSize="7" fill={L}>SYSTEM</text>

      {/* Key annotations */}
      <rect x="50" y="215" width="550" height="75" fill="none" stroke={S} strokeWidth="0.5" />
      <text x="60" y="230" fontSize="8" fill={S} fontWeight="bold">NOTES:</text>
      <text x="60" y="245" fontSize="7" fill={L}>1. FIRST boiler connected to Supply Header = LAST boiler connected to Return Header.</text>
      <text x="60" y="258" fontSize="7" fill={L}>2. Equal total pipe length per boiler ensures balanced flow without balancing valves.</text>
      <text x="60" y="271" fontSize="7" fill={L}>3. Multiple boilers must be piped in reverse return configuration per manufacturer requirements.</text>
      <text x="60" y="284" fontSize="7" fill={L}>4. Install per IMC 1001.1 and applicable local codes.</text>
    </svg>
  );
}
