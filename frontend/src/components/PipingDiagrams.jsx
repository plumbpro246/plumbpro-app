import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BLUE = "#003366";
const ORANGE = "#FF5F00";
const RED = "#E53E3E";
const COLD_BLUE = "#3B82F6";
const HOT_RED = "#EF4444";
const PIPE_GRAY = "#64748B";
const GAS_YELLOW = "#EAB308";

function ArrowHead({ x, y, dir = "right", color = PIPE_GRAY }) {
  const paths = {
    right: `M ${x-6} ${y-4} L ${x} ${y} L ${x-6} ${y+4}`,
    left: `M ${x+6} ${y-4} L ${x} ${y} L ${x+6} ${y+4}`,
    down: `M ${x-4} ${y-6} L ${x} ${y} L ${x+4} ${y-6}`,
    up: `M ${x-4} ${y+6} L ${x} ${y} L ${x+4} ${y+6}`,
  };
  return <path d={paths[dir]} fill="none" stroke={color} strokeWidth="2" />;
}

function Label({ x, y, text, size = 9, color = "#334155", anchor = "middle", bold = false }) {
  return <text x={x} y={y} fill={color} fontSize={size} fontWeight={bold ? "bold" : "normal"} textAnchor={anchor} style={{ fontFamily: "system-ui, sans-serif" }}>{text}</text>;
}

function ComponentBox({ x, y, w, h, label, color = BLUE, textColor = "#fff", sublabel }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={color} />
      <Label x={x + w/2} y={y + h/2 + (sublabel ? -2 : 3)} text={label} size={sublabel ? 8 : 9} color={textColor} bold />
      {sublabel && <Label x={x + w/2} y={y + h/2 + 10} text={sublabel} size={7} color={textColor} />}
    </g>
  );
}

function Valve({ x, y, label }) {
  return (
    <g>
      <polygon points={`${x-6},${y-6} ${x+6},${y} ${x-6},${y+6}`} fill={ORANGE} />
      <polygon points={`${x+6},${y-6} ${x-6},${y} ${x+6},${y+6}`} fill={ORANGE} />
      {label && <Label x={x} y={y - 10} text={label} size={7} color="#666" />}
    </g>
  );
}

// ==================== WATER HEATER DIAGRAMS ====================

export function SingleWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 500 400" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Water Heater Tank */}
      <rect x="180" y="100" width="100" height="160" rx="8" fill={BLUE} stroke={BLUE} strokeWidth="2" />
      <Label x="230" y="170" text="WATER" color="white" size={11} bold />
      <Label x="230" y="185" text="HEATER" color="white" size={11} bold />
      
      {/* T&P Valve */}
      <rect x="280" y="130" width="50" height="20" rx="3" fill={RED} />
      <Label x="305" y="144" text="T&P" color="white" size={8} bold />
      <line x1="305" y1="150" x2="305" y2="320" stroke={RED} strokeWidth="2" />
      <Label x="320" y="240" text="T&P Discharge" size={7} color="#666" anchor="start" />
      <Label x="320" y="252" text="(6&quot; from floor)" size={7} color="#666" anchor="start" />

      {/* Cold water inlet (right side) */}
      <line x1="390" y1="120" x2="280" y2="120" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={285} y={120} dir="left" color={COLD_BLUE} />
      <Label x="350" y="112" text="COLD IN" size={8} color={COLD_BLUE} bold />

      {/* Expansion Tank on cold line */}
      <rect x="340" y="70" width="50" height="35" rx="4" fill="#7C3AED" />
      <Label x="365" y="90" text="EXP" color="white" size={8} bold />
      <Label x="365" y="100" text="TANK" color="white" size={7} />
      <line x1="365" y1="105" x2="365" y2="120" stroke="#7C3AED" strokeWidth="2" />

      {/* Shutoff valve on cold */}
      <Valve x={390} y={120} label="Shutoff" />

      {/* Cold supply from main */}
      <line x1="470" y1="120" x2="396" y2="120" stroke={COLD_BLUE} strokeWidth="3" />
      <Label x="450" y="112" text="COLD" size={7} color={COLD_BLUE} />
      <Label x="450" y="135" text="SUPPLY" size={7} color={COLD_BLUE} />

      {/* Hot water outlet (left side) */}
      <line x1="180" y1="120" x2="80" y2="120" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={85} y={120} dir="left" color={HOT_RED} />
      <Label x="130" y="112" text="HOT OUT" size={8} color={HOT_RED} bold />
      <Label x="50" y="124" text="To" size={7} color="#666" />
      <Label x="50" y="135" text="Fixtures" size={7} color="#666" />

      {/* Dielectric unions */}
      <circle cx="300" cy="120" r="4" fill="none" stroke={ORANGE} strokeWidth="2" />
      <Label x="300" y="105" text="DU" size={6} color={ORANGE} />
      <circle cx="160" cy="120" r="4" fill="none" stroke={ORANGE} strokeWidth="2" />
      <Label x="160" y="105" text="DU" size={6} color={ORANGE} />

      {/* Gas line (if gas) */}
      <line x1="180" y1="230" x2="80" y2="230" stroke={GAS_YELLOW} strokeWidth="3" strokeDasharray="8,4" />
      <ArrowHead x={185} y={230} dir="right" color={GAS_YELLOW} />
      <Label x="120" y="222" text="GAS SUPPLY" size={8} color={GAS_YELLOW} bold />
      <Valve x={120} y={230} />
      <rect x="60" y="222" width="35" height="16" rx="2" fill={GAS_YELLOW} />
      <Label x="77" y="233" text="DRIP" size={6} color={BLUE} bold />
      <Label x="77" y="248" text="LEG" size={6} color="#666" />

      {/* Vent (gas) */}
      <line x1="230" y1="100" x2="230" y2="40" stroke={PIPE_GRAY} strokeWidth="3" />
      <ArrowHead x={230} y={45} dir="up" color={PIPE_GRAY} />
      <Label x="230" y="30" text="VENT TO CHIMNEY" size={8} color={PIPE_GRAY} bold />
      <Label x="230" y="60" text="(slope 1/4&quot;/ft up)" size={7} color="#888" />

      {/* Drain pan */}
      <rect x="160" y="270" width="140" height="12" rx="2" fill="#94A3B8" opacity="0.4" />
      <Label x="230" y="295" text="DRAIN PAN" size={7} color="#666" />
      <line x1="300" y1="276" x2="350" y2="320" stroke="#94A3B8" strokeWidth="1.5" />
      <Label x="365" y="325" text="To drain" size={7} color="#888" />

      {/* Drain valve */}
      <Valve x={230} y={265} label="Drain Valve" />

      {/* Legend */}
      <rect x="10" y="340" width="480" height="50" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
      <line x1="20" y1="365" x2="45" y2="365" stroke={COLD_BLUE} strokeWidth="3" />
      <Label x="50" y="368" text="Cold" size={7} color="#333" anchor="start" />
      <line x1="80" y1="365" x2="105" y2="365" stroke={HOT_RED} strokeWidth="3" />
      <Label x="110" y="368" text="Hot" size={7} color="#333" anchor="start" />
      <line x1="140" y1="365" x2="165" y2="365" stroke={GAS_YELLOW} strokeWidth="3" strokeDasharray="6,3" />
      <Label x="170" y="368" text="Gas" size={7} color="#333" anchor="start" />
      <circle cx="215" cy="365" r="4" fill="none" stroke={ORANGE} strokeWidth="2" />
      <Label x="225" y="368" text="Dielectric Union" size={7} color="#333" anchor="start" />
      <Label x="330" y="368" text="DU = Dielectric Union  |  T&P = Temperature & Pressure" size={7} color="#888" anchor="start" />
    </svg>
  );
}

export function SeriesWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 520 280" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Cold supply */}
      <line x1="20" y1="100" x2="100" y2="100" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={95} y={100} dir="right" color={COLD_BLUE} />
      <Label x="50" y="90" text="COLD IN" size={9} color={COLD_BLUE} bold />

      {/* WH 1 */}
      <ComponentBox x={100} y={70} w={100} h={60} label="WATER HEATER" sublabel="#1" />

      {/* Pipe between WH1 and WH2 */}
      <line x1="200" y1="100" x2="300" y2="100" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={295} y={100} dir="right" color={HOT_RED} />
      <Label x="250" y="90" text="Pre-heated" size={7} color="#888" />

      {/* WH 2 */}
      <ComponentBox x={300} y={70} w={100} h={60} label="WATER HEATER" sublabel="#2 (Boost)" />

      {/* Hot out */}
      <line x1="400" y1="100" x2="500" y2="100" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={495} y={100} dir="right" color={HOT_RED} />
      <Label x="455" y="90" text="HOT OUT" size={9} color={HOT_RED} bold />

      {/* Valves */}
      <Valve x={80} y={100} />
      <Valve x={420} y={100} />

      {/* Notes */}
      <rect x="20" y="160" width="480" height="100" rx="4" fill="#FFF7ED" stroke="#FDBA74" />
      <Label x="30" y="180" text="SERIES PIPING" size={10} color={BLUE} bold anchor="start" />
      <Label x="30" y="198" text="- Water flows through WH #1 first, then #2 boosts to final temperature" size={8} color="#555" anchor="start" />
      <Label x="30" y="213" text="- WH #1 does the heavy lifting (set lower temp), WH #2 finishes (set final temp)" size={8} color="#555" anchor="start" />
      <Label x="30" y="228" text="- Simple piping, fewer fittings" size={8} color="#555" anchor="start" />
      <Label x="30" y="243" text="- Downside: Uneven wear — WH #1 works harder and will fail sooner" size={8} color={RED} anchor="start" />
    </svg>
  );
}

export function ParallelWaterHeaterDiagram() {
  return (
    <svg viewBox="0 0 520 320" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Cold supply header */}
      <line x1="20" y1="140" x2="120" y2="140" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={115} y={140} dir="right" color={COLD_BLUE} />
      <Label x="60" y="130" text="COLD IN" size={9} color={COLD_BLUE} bold />
      
      {/* Cold tee */}
      <circle cx="130" cy="140" r="5" fill={COLD_BLUE} />
      
      {/* Branch to WH1 (top) */}
      <line x1="130" y1="140" x2="130" y2="70" stroke={COLD_BLUE} strokeWidth="3" />
      <line x1="130" y1="70" x2="200" y2="70" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={195} y={70} dir="right" color={COLD_BLUE} />
      <Valve x={165} y={70} />

      {/* Branch to WH2 (bottom) */}
      <line x1="130" y1="140" x2="130" y2="210" stroke={COLD_BLUE} strokeWidth="3" />
      <line x1="130" y1="210" x2="200" y2="210" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={195} y={210} dir="right" color={COLD_BLUE} />
      <Valve x={165} y={210} />

      {/* WH 1 */}
      <ComponentBox x={200} y={45} w={100} h={50} label="WATER HEATER" sublabel="#1" />
      
      {/* WH 2 */}
      <ComponentBox x={200} y={185} w={100} h={50} label="WATER HEATER" sublabel="#2" />

      {/* Hot from WH1 */}
      <line x1="300" y1="70" x2="380" y2="70" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={375} y={70} dir="right" color={HOT_RED} />
      <Valve x={340} y={70} />

      {/* Hot from WH2 */}
      <line x1="300" y1="210" x2="380" y2="210" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={375} y={210} dir="right" color={HOT_RED} />
      <Valve x={340} y={210} />

      {/* Hot tee */}
      <circle cx="380" cy="140" r="5" fill={HOT_RED} />
      <line x1="380" y1="70" x2="380" y2="210" stroke={HOT_RED} strokeWidth="3" />

      {/* Hot out */}
      <line x1="380" y1="140" x2="500" y2="140" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={495} y={140} dir="right" color={HOT_RED} />
      <Label x="450" y="130" text="HOT OUT" size={9} color={HOT_RED} bold />

      {/* Balancing valves label */}
      <Label x="340" y="55" text="Ball Valve" size={7} color="#888" />
      <Label x="340" y="225" text="Ball Valve" size={7} color="#888" />

      {/* Notes */}
      <rect x="20" y="245" width="480" height="65" rx="4" fill="#FFF7ED" stroke="#FDBA74" />
      <Label x="30" y="263" text="PARALLEL PIPING" size={10} color={BLUE} bold anchor="start" />
      <Label x="30" y="278" text="- Both heaters share the load equally via common headers" size={8} color="#555" anchor="start" />
      <Label x="30" y="293" text="- Install balancing valves for equal flow  |  Provides redundancy if one unit fails" size={8} color="#555" anchor="start" />
    </svg>
  );
}

export function ReverseReturnWHDiagram() {
  return (
    <svg viewBox="0 0 520 320" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Cold supply (top) */}
      <line x1="20" y1="60" x2="460" y2="60" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={455} y={60} dir="right" color={COLD_BLUE} />
      <Label x="30" y="50" text="COLD SUPPLY HEADER" size={8} color={COLD_BLUE} bold anchor="start" />

      {/* Drop to WH1 */}
      <line x1="120" y1="60" x2="120" y2="110" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="120" cy="60" r="4" fill={COLD_BLUE} />
      <ComponentBox x={80} y={110} w={80} h={45} label="WH #1" />

      {/* Drop to WH2 */}
      <line x1="260" y1="60" x2="260" y2="110" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="260" cy="60" r="4" fill={COLD_BLUE} />
      <ComponentBox x={220} y={110} w={80} h={45} label="WH #2" />

      {/* Drop to WH3 */}
      <line x1="400" y1="60" x2="400" y2="110" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="400" cy="60" r="4" fill={COLD_BLUE} />
      <ComponentBox x={360} y={110} w={80} h={45} label="WH #3" />

      {/* Hot return (bottom - REVERSE direction) */}
      <line x1="120" y1="155" x2="120" y2="210" stroke={HOT_RED} strokeWidth="2" />
      <line x1="260" y1="155" x2="260" y2="210" stroke={HOT_RED} strokeWidth="2" />
      <line x1="400" y1="155" x2="400" y2="210" stroke={HOT_RED} strokeWidth="2" />

      <line x1="60" y1="210" x2="400" y2="210" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={65} y={210} dir="left" color={HOT_RED} />
      <circle cx="120" cy="210" r="4" fill={HOT_RED} />
      <circle cx="260" cy="210" r="4" fill={HOT_RED} />
      <circle cx="400" cy="210" r="4" fill={HOT_RED} />

      <Label x="30" y="200" text="HOT" size={8} color={HOT_RED} bold />
      <Label x="30" y="215" text="OUT" size={8} color={HOT_RED} bold />
      <Label x="240" y="230" text="HOT RETURN HEADER (reverse direction)" size={8} color={HOT_RED} anchor="middle" />

      {/* Key concept arrows */}
      <Label x="120" y="250" text="FIRST in cold" size={7} color={COLD_BLUE} bold />
      <Label x="120" y="262" text="= LAST in hot" size={7} color={HOT_RED} bold />

      {/* Notes */}
      <rect x="20" y="275" width="480" height="40" rx="4" fill="#FFF7ED" stroke="#FDBA74" />
      <Label x="30" y="292" text="REVERSE RETURN — Self-balancing: equal pipe length for each unit = equal flow without balancing valves" size={8} color="#555" anchor="start" />
    </svg>
  );
}

// ==================== BOILER DIAGRAMS ====================

export function SingleBoilerDiagram() {
  return (
    <svg viewBox="0 0 520 420" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Boiler */}
      <rect x="60" y="180" width="120" height="80" rx="6" fill={BLUE} stroke={BLUE} strokeWidth="2" />
      <Label x="120" y="215" text="BOILER" color="white" size={12} bold />
      <Label x="120" y="232" text="(Mod-Con)" color="#93C5FD" size={8} />

      {/* Supply out (top) */}
      <line x1="120" y1="180" x2="120" y2="130" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={120} y={135} dir="up" color={HOT_RED} />
      <Label x="100" y="158" text="SUPPLY" size={7} color={HOT_RED} anchor="end" />

      {/* Air Separator */}
      <circle cx="120" cy="110" r="18" fill="#F1F5F9" stroke={PIPE_GRAY} strokeWidth="2" />
      <Label x="120" y="113" text="AIR" size={7} color={PIPE_GRAY} bold />
      <line x1="120" y1="92" x2="120" y2="75" stroke={PIPE_GRAY} strokeWidth="1.5" />
      <Label x="120" y="70" text="Air Vent" size={6} color="#888" />

      {/* Supply header going right */}
      <line x1="138" y1="110" x2="400" y2="110" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={395} y={110} dir="right" color={HOT_RED} />
      <Label x="300" y="100" text="SUPPLY TO ZONES" size={8} color={HOT_RED} bold />

      {/* Circulator pump on supply */}
      <rect x="200" y="98" width="40" height="24" rx="12" fill={ORANGE} />
      <Label x="220" y="114" text="PUMP" color="white" size={7} bold />

      {/* Zone valves */}
      <line x1="400" y1="110" x2="400" y2="60" stroke={HOT_RED} strokeWidth="2" />
      <ComponentBox x={370} y={30} w={60} h={25} label="ZONE 1" color="#7C3AED" />
      <Valve x={400} y={80} label="ZV" />

      <line x1="450" y1="110" x2="450" y2="60" stroke={HOT_RED} strokeWidth="2" />
      <ComponentBox x={420} y={30} w={60} h={25} label="ZONE 2" color="#7C3AED" />
      <Valve x={450} y={80} label="ZV" />
      <circle cx="450" cy="110" r="4" fill={HOT_RED} />

      {/* Return header */}
      <line x1="400" y1="310" x2="138" y2="310" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={143} y={310} dir="left" color={COLD_BLUE} />
      <Label x="300" y="330" text="RETURN FROM ZONES" size={8} color={COLD_BLUE} bold />

      {/* Zone returns */}
      <line x1="400" y1="55" x2="400" y2="310" stroke={COLD_BLUE} strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="450" y1="55" x2="450" y2="310" stroke={COLD_BLUE} strokeWidth="1.5" strokeDasharray="4,3" />
      <circle cx="400" cy="310" r="4" fill={COLD_BLUE} />
      <circle cx="450" cy="310" r="4" fill={COLD_BLUE} />

      {/* Return to boiler */}
      <line x1="120" y1="310" x2="120" y2="260" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={120} y={265} dir="up" color={COLD_BLUE} />
      <Label x="100" y="290" text="RETURN" size={7} color={COLD_BLUE} anchor="end" />

      {/* Expansion tank on return */}
      <rect x="30" y="290" width="50" height="35" rx="4" fill="#7C3AED" />
      <Label x="55" y="308" text="EXP" color="white" size={8} bold />
      <Label x="55" y="319" text="TANK" color="white" size={7} />
      <line x1="80" y1="310" x2="120" y2="310" stroke="#7C3AED" strokeWidth="2" />

      {/* Gas line */}
      <line x1="60" y1="240" x2="20" y2="240" stroke={GAS_YELLOW} strokeWidth="3" strokeDasharray="8,4" />
      <Label x="15" y="233" text="GAS" size={7} color={GAS_YELLOW} anchor="end" bold />

      {/* Condensate */}
      <line x1="120" y1="260" x2="120" y2="370" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3,3" />
      <rect x="95" y="370" width="50" height="20" rx="3" fill="#06B6D4" />
      <Label x="120" y="383" text="NEUT" color="white" size={7} bold />
      <Label x="120" y="402" text="Condensate" size={7} color="#888" />
      <Label x="120" y="413" text="Neutralizer" size={7} color="#888" />

      {/* Vent */}
      <line x1="180" y1="200" x2="220" y2="200" stroke={PIPE_GRAY} strokeWidth="2" />
      <line x1="220" y1="200" x2="220" y2="30" stroke={PIPE_GRAY} strokeWidth="2" />
      <ArrowHead x={220} y={35} dir="up" color={PIPE_GRAY} />
      <Label x="230" y="20" text="PVC VENT" size={7} color={PIPE_GRAY} anchor="start" />

      {/* Legend */}
      <rect x="250" y="350" width="250" height="60" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
      <Label x="260" y="367" text="ZV = Zone Valve" size={7} color="#555" anchor="start" />
      <Label x="260" y="382" text="EXP = Expansion Tank" size={7} color="#555" anchor="start" />
      <Label x="260" y="397" text="NEUT = Condensate Neutralizer" size={7} color="#555" anchor="start" />
      <Label x="400" y="367" text="Red = Supply (hot)" size={7} color={HOT_RED} anchor="start" />
      <Label x="400" y="382" text="Blue = Return (cool)" size={7} color={COLD_BLUE} anchor="start" />
    </svg>
  );
}

export function PrimarySecondaryDiagram() {
  return (
    <svg viewBox="0 0 520 300" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Primary Loop */}
      <rect x="60" y="90" width="400" height="120" rx="0" fill="none" stroke={PIPE_GRAY} strokeWidth="3" />
      <Label x="260" y="80" text="PRIMARY LOOP" size={10} color={PIPE_GRAY} bold />

      {/* Flow arrows on primary loop */}
      <ArrowHead x={260} y={90} dir="right" color={PIPE_GRAY} />
      <ArrowHead x={460} y={150} dir="down" color={PIPE_GRAY} />
      <ArrowHead x={260} y={210} dir="left" color={PIPE_GRAY} />
      <ArrowHead x={60} y={150} dir="up" color={PIPE_GRAY} />

      {/* Primary pump */}
      <rect x="160" y="78" width="40" height="24" rx="12" fill={ORANGE} />
      <Label x="180" y="94" text="P1" color="white" size={8} bold />

      {/* Boiler on left (closely-spaced tees) */}
      <circle cx="80" cy="130" r="4" fill={HOT_RED} />
      <circle cx="80" cy="170" r="4" fill={COLD_BLUE} />
      <line x1="80" y1="130" x2="20" y2="130" stroke={HOT_RED} strokeWidth="2" />
      <line x1="20" y1="130" x2="20" y2="170" stroke={PIPE_GRAY} strokeWidth="2" />
      <line x1="20" y1="170" x2="80" y2="170" stroke={COLD_BLUE} strokeWidth="2" />
      <ComponentBox x={0} y={135} w={40} h={25} label="BOILER" color={BLUE} />
      <Label x="50" y="123" text="CST" size={6} color="#888" />
      <Label x="50" y="183" text="CST" size={6} color="#888" />

      {/* Zone 1 (closely-spaced tees on right side) */}
      <circle cx="350" cy="90" r="4" fill={HOT_RED} />
      <circle cx="380" cy="90" r="4" fill={COLD_BLUE} />
      <line x1="350" y1="90" x2="350" y2="40" stroke={HOT_RED} strokeWidth="2" />
      <line x1="380" y1="90" x2="380" y2="40" stroke={COLD_BLUE} strokeWidth="2" />
      <ComponentBox x={330} y={10} w={70} h={25} label="ZONE 1" color="#7C3AED" />
      <rect x="395" y="44" width="30" height="16" rx="8" fill={ORANGE} />
      <Label x="410" y="55" text="P2" color="white" size={7} bold />

      {/* Zone 2 */}
      <circle cx="350" cy="210" r="4" fill={HOT_RED} />
      <circle cx="380" cy="210" r="4" fill={COLD_BLUE} />
      <line x1="350" y1="210" x2="350" y2="260" stroke={HOT_RED} strokeWidth="2" />
      <line x1="380" y1="210" x2="380" y2="260" stroke={COLD_BLUE} strokeWidth="2" />
      <ComponentBox x={330} y={260} w={70} h={25} label="ZONE 2" color="#7C3AED" />
      <rect x="395" y="255" width="30" height="16" rx="8" fill={ORANGE} />
      <Label x="410" y="266" text="P3" color="white" size={7} bold />

      {/* Notes */}
      <Label x="140" y="245" text="CST = Closely-Spaced Tees (max 4 pipe diameters apart)" size={7} color="#888" anchor="start" />
      <Label x="140" y="260" text="Each circuit has its own pump — hydraulically independent" size={7} color="#888" anchor="start" />
      <Label x="140" y="275" text="Essential for modulating-condensing boilers" size={7} color={RED} anchor="start" />
    </svg>
  );
}

export function ParallelBoilerDiagram() {
  return (
    <svg viewBox="0 0 520 300" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Supply header */}
      <line x1="40" y1="60" x2="480" y2="60" stroke={HOT_RED} strokeWidth="4" />
      <Label x="260" y="45" text="SUPPLY HEADER" size={9} color={HOT_RED} bold />
      <ArrowHead x={475} y={60} dir="right" color={HOT_RED} />
      <Label x="485" y="65" text="To Zones" size={7} color="#888" anchor="start" />

      {/* Return header */}
      <line x1="40" y1="220" x2="480" y2="220" stroke={COLD_BLUE} strokeWidth="4" />
      <Label x="260" y="245" text="RETURN HEADER" size={9} color={COLD_BLUE} bold />
      <ArrowHead x={45} y={220} dir="left" color={COLD_BLUE} />

      {/* Boiler 1 */}
      <line x1="120" y1="60" x2="120" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="120" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={80} y={100} w={80} h={50} label="BOILER #1" />
      <Valve x={120} y={80} />
      <line x1="120" y1="150" x2="120" y2="220" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="120" cy="220" r="4" fill={COLD_BLUE} />
      <Valve x={120} y={190} />

      {/* Boiler 2 */}
      <line x1="260" y1="60" x2="260" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="260" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={220} y={100} w={80} h={50} label="BOILER #2" />
      <Valve x={260} y={80} />
      <line x1="260" y1="150" x2="260" y2="220" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="260" cy="220" r="4" fill={COLD_BLUE} />
      <Valve x={260} y={190} />

      {/* Boiler 3 */}
      <line x1="400" y1="60" x2="400" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="400" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={360} y={100} w={80} h={50} label="BOILER #3" />
      <Valve x={400} y={80} />
      <line x1="400" y1="150" x2="400" y2="220" stroke={COLD_BLUE} strokeWidth="2" />
      <circle cx="400" cy="220" r="4" fill={COLD_BLUE} />
      <Valve x={400} y={190} />

      {/* Notes */}
      <Label x="260" y="270" text="CASCADE — Controller fires boilers in sequence based on demand" size={8} color="#555" />
      <Label x="260" y="285" text="Each boiler has isolation valves for independent service" size={8} color="#888" />
    </svg>
  );
}

export function ReverseReturnBoilerDiagram() {
  return (
    <svg viewBox="0 0 520 280" className="w-full" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Supply (top, left to right) */}
      <line x1="20" y1="60" x2="460" y2="60" stroke={HOT_RED} strokeWidth="3" />
      <ArrowHead x={455} y={60} dir="right" color={HOT_RED} />
      <Label x="240" y="45" text="SUPPLY (left to right)" size={8} color={HOT_RED} bold />

      {/* Boilers */}
      <line x1="120" y1="60" x2="120" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="120" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={80} y={100} w={80} h={40} label="BOILER #1" />

      <line x1="280" y1="60" x2="280" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="280" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={240} y={100} w={80} h={40} label="BOILER #2" />

      <line x1="440" y1="60" x2="440" y2="100" stroke={HOT_RED} strokeWidth="2" />
      <circle cx="440" cy="60" r="4" fill={HOT_RED} />
      <ComponentBox x={400} y={100} w={80} h={40} label="BOILER #3" />

      {/* Return (bottom, right to left — REVERSE) */}
      <line x1="120" y1="140" x2="120" y2="180" stroke={COLD_BLUE} strokeWidth="2" />
      <line x1="280" y1="140" x2="280" y2="180" stroke={COLD_BLUE} strokeWidth="2" />
      <line x1="440" y1="140" x2="440" y2="180" stroke={COLD_BLUE} strokeWidth="2" />

      <line x1="60" y1="180" x2="440" y2="180" stroke={COLD_BLUE} strokeWidth="3" />
      <ArrowHead x={65} y={180} dir="left" color={COLD_BLUE} />
      <circle cx="120" cy="180" r="4" fill={COLD_BLUE} />
      <circle cx="280" cy="180" r="4" fill={COLD_BLUE} />
      <circle cx="440" cy="180" r="4" fill={COLD_BLUE} />
      <Label x="240" y="200" text="RETURN (right to left — REVERSE)" size={8} color={COLD_BLUE} bold />

      {/* Key concept */}
      <rect x="40" y="220" width="440" height="50" rx="4" fill="#FFF7ED" stroke="#FDBA74" />
      <Label x="260" y="240" text="First connected to SUPPLY = Last connected to RETURN" size={9} color={BLUE} bold />
      <Label x="260" y="258" text="Equal total pipe length per boiler = self-balancing flow without balancing valves" size={8} color="#555" />
    </svg>
  );
}

// Export all as named object for easy import
export const WaterHeaterDiagrams = {
  SingleWaterHeaterDiagram,
  SeriesWaterHeaterDiagram,
  ParallelWaterHeaterDiagram,
  ReverseReturnWHDiagram,
};

export const BoilerDiagrams = {
  SingleBoilerDiagram,
  PrimarySecondaryDiagram,
  ParallelBoilerDiagram,
  ReverseReturnBoilerDiagram,
};
