import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Ruler, Droplets, Gauge, Thermometer, Wind, Wrench } from "lucide-react";

// ── Conversion definitions ────────────────────────────────────────────
const conversions = {
  length: {
    label: "Length",
    icon: Ruler,
    base: "in",
    units: {
      in: { label: "Inches (in)", toBase: 1 },
      ft: { label: "Feet (ft)", toBase: 12 },
      yd: { label: "Yards (yd)", toBase: 36 },
      mm: { label: "Millimeters (mm)", toBase: 1 / 25.4 },
      cm: { label: "Centimeters (cm)", toBase: 1 / 2.54 },
      m: { label: "Meters (m)", toBase: 39.3701 },
    },
  },
  volume: {
    label: "Volume",
    icon: Droplets,
    base: "gal",
    units: {
      gal: { label: "US Gallons (gal)", toBase: 1 },
      qt: { label: "Quarts (qt)", toBase: 0.25 },
      pt: { label: "Pints (pt)", toBase: 0.125 },
      "fl oz": { label: "Fluid Ounces (fl oz)", toBase: 1 / 128 },
      L: { label: "Liters (L)", toBase: 0.264172 },
      mL: { label: "Milliliters (mL)", toBase: 0.000264172 },
      "cu ft": { label: "Cubic Feet (cu ft)", toBase: 7.48052 },
      "cu in": { label: "Cubic Inches (cu in)", toBase: 0.004329 },
    },
  },
  pressure: {
    label: "Pressure",
    icon: Gauge,
    base: "psi",
    units: {
      psi: { label: "PSI", toBase: 1 },
      bar: { label: "Bar", toBase: 14.5038 },
      kPa: { label: "Kilopascals (kPa)", toBase: 0.145038 },
      "inH₂O": { label: "Inches of Water Column", toBase: 0.0361273 },
      "ftH₂O": { label: "Feet of Water Column", toBase: 0.433528 },
      "mm Hg": { label: "Millimeters of Mercury (mm Hg)", toBase: 0.0193368 },
      atm: { label: "Atmospheres (atm)", toBase: 14.6959 },
    },
  },
  flow: {
    label: "Flow Rate",
    icon: Wind,
    base: "gpm",
    units: {
      gpm: { label: "Gallons per Minute (GPM)", toBase: 1 },
      gph: { label: "Gallons per Hour (GPH)", toBase: 1 / 60 },
      Lpm: { label: "Liters per Minute (L/min)", toBase: 0.264172 },
      Lph: { label: "Liters per Hour (L/hr)", toBase: 0.00440287 },
      "cfm (water)": { label: "Cubic Feet per Minute", toBase: 7.48052 },
      "cu ft/hr": { label: "Cubic Feet per Hour", toBase: 0.124675 },
    },
  },
  weight: {
    label: "Weight",
    icon: Wrench,
    base: "lb",
    units: {
      lb: { label: "Pounds (lb)", toBase: 1 },
      oz: { label: "Ounces (oz)", toBase: 0.0625 },
      kg: { label: "Kilograms (kg)", toBase: 2.20462 },
      g: { label: "Grams (g)", toBase: 0.00220462 },
      "short ton": { label: "Short Ton (US)", toBase: 2000 },
    },
  },
};

// ── Reference tables ──────────────────────────────────────────────────
const fractionTable = [
  { fraction: "1/16", decimal: "0.0625", mm: "1.59" },
  { fraction: "1/8", decimal: "0.125", mm: "3.18" },
  { fraction: "3/16", decimal: "0.1875", mm: "4.76" },
  { fraction: "1/4", decimal: "0.250", mm: "6.35" },
  { fraction: "5/16", decimal: "0.3125", mm: "7.94" },
  { fraction: "3/8", decimal: "0.375", mm: "9.53" },
  { fraction: "7/16", decimal: "0.4375", mm: "11.11" },
  { fraction: "1/2", decimal: "0.500", mm: "12.70" },
  { fraction: "9/16", decimal: "0.5625", mm: "14.29" },
  { fraction: "5/8", decimal: "0.625", mm: "15.88" },
  { fraction: "11/16", decimal: "0.6875", mm: "17.46" },
  { fraction: "3/4", decimal: "0.750", mm: "19.05" },
  { fraction: "13/16", decimal: "0.8125", mm: "20.64" },
  { fraction: "7/8", decimal: "0.875", mm: "22.23" },
  { fraction: "15/16", decimal: "0.9375", mm: "23.81" },
  { fraction: "1", decimal: "1.000", mm: "25.40" },
];

const pipeSizes = [
  { nominal: '1/2"', copper_od: "0.625", copper_id: "0.545", pvc40_od: "0.840", pvc40_id: "0.622", steel_od: "0.840", steel_id: "0.622" },
  { nominal: '3/4"', copper_od: "0.875", copper_id: "0.785", pvc40_od: "1.050", pvc40_id: "0.824", steel_od: "1.050", steel_id: "0.824" },
  { nominal: '1"', copper_od: "1.125", copper_id: "1.025", pvc40_od: "1.315", pvc40_id: "1.049", steel_od: "1.315", steel_id: "1.049" },
  { nominal: '1-1/4"', copper_od: "1.375", copper_id: "1.265", pvc40_od: "1.660", pvc40_id: "1.380", steel_od: "1.660", steel_id: "1.380" },
  { nominal: '1-1/2"', copper_od: "1.625", copper_id: "1.505", pvc40_od: "1.900", pvc40_id: "1.610", steel_od: "1.900", steel_id: "1.610" },
  { nominal: '2"', copper_od: "2.125", copper_id: "1.985", pvc40_od: "2.375", pvc40_id: "2.067", steel_od: "2.375", steel_id: "2.067" },
  { nominal: '3"', copper_od: "3.125", copper_id: "2.945", pvc40_od: "3.500", pvc40_id: "3.068", steel_od: "3.500", steel_id: "3.068" },
  { nominal: '4"', copper_od: "4.125", copper_id: "3.905", pvc40_od: "4.500", pvc40_id: "4.026", steel_od: "4.500", steel_id: "4.026" },
];

const npsThreads = [
  { nps: '1/8"', tpi: 27, designation: "1/8-27 NPT" },
  { nps: '1/4"', tpi: 18, designation: "1/4-18 NPT" },
  { nps: '3/8"', tpi: 18, designation: "3/8-18 NPT" },
  { nps: '1/2"', tpi: 14, designation: "1/2-14 NPT" },
  { nps: '3/4"', tpi: 14, designation: "3/4-14 NPT" },
  { nps: '1"', tpi: 11.5, designation: "1-11.5 NPT" },
  { nps: '1-1/4"', tpi: 11.5, designation: "1-1/4-11.5 NPT" },
  { nps: '1-1/2"', tpi: 11.5, designation: "1-1/2-11.5 NPT" },
  { nps: '2"', tpi: 11.5, designation: "2-11.5 NPT" },
];

const dfuTable = [
  { fixture: "Water Closet (Tank, 1.6 gpf)", dfu: 3, trap: '3"' },
  { fixture: "Water Closet (Flushometer)", dfu: 6, trap: '3"' },
  { fixture: "Lavatory", dfu: 1, trap: '1-1/4"' },
  { fixture: "Bathtub (with/without shower)", dfu: 2, trap: '1-1/2"' },
  { fixture: "Shower (single head)", dfu: 2, trap: '2"' },
  { fixture: "Kitchen Sink (residential)", dfu: 2, trap: '1-1/2"' },
  { fixture: "Kitchen Sink (commercial)", dfu: 3, trap: '2"' },
  { fixture: "Dishwasher (residential)", dfu: 2, trap: '1-1/2"' },
  { fixture: "Laundry Tub", dfu: 2, trap: '1-1/2"' },
  { fixture: "Washing Machine", dfu: 2, trap: '2"' },
  { fixture: "Floor Drain (2-inch)", dfu: 2, trap: '2"' },
  { fixture: "Bidet", dfu: 1, trap: '1-1/4"' },
  { fixture: "Urinal (Flushometer Valve)", dfu: 5, trap: '2"' },
  { fixture: "Service Sink", dfu: 3, trap: '2"' },
  { fixture: "Drinking Fountain", dfu: 0.5, trap: '1-1/4"' },
];

// ── Live converter widget ─────────────────────────────────────────────
function ConverterWidget({ category }) {
  const def = conversions[category];
  const unitKeys = Object.keys(def.units);
  const [fromUnit, setFromUnit] = useState(unitKeys[0]);
  const [toUnit, setToUnit] = useState(unitKeys[1] || unitKeys[0]);
  const [value, setValue] = useState("");

  const convert = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    const baseValue = num * def.units[fromUnit].toBase;
    const result = baseValue / def.units[toUnit].toBase;
    if (!isFinite(result)) return "";
    // Format: more decimals for small numbers, fewer for large
    if (Math.abs(result) >= 1000) return result.toFixed(2);
    if (Math.abs(result) >= 1) return result.toFixed(4);
    return result.toFixed(6);
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <Card data-testid={`converter-${category}`}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading uppercase text-lg flex items-center gap-2">
          <def.icon className="w-5 h-5 text-[#FF5F00]" />
          {def.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <div>
            <Label className="text-xs uppercase font-bold text-muted-foreground">From</Label>
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="h-12 text-lg font-mono"
              data-testid={`${category}-input`}
            />
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="h-10 mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitKeys.map((u) => (
                  <SelectItem key={u} value={u}>{def.units[u].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={swap}
            className="self-center sm:self-end mb-[78px] p-2 rounded-sm hover:bg-muted transition-colors mx-auto"
            aria-label="Swap units"
            data-testid={`${category}-swap`}
          >
            <ArrowRightLeft className="w-5 h-5 text-[#FF5F00]" />
          </button>

          <div>
            <Label className="text-xs uppercase font-bold text-muted-foreground">To</Label>
            <Input
              readOnly
              value={convert(value)}
              placeholder="result"
              className="h-12 text-lg font-mono bg-muted"
              data-testid={`${category}-output`}
            />
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="h-10 mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitKeys.map((u) => (
                  <SelectItem key={u} value={u}>{def.units[u].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConversionsPage() {
  return (
    <div className="space-y-6" data-testid="conversions-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <ArrowRightLeft className="w-8 h-8 text-[#FF5F00]" />
          Conversions
        </h1>
        <p className="text-muted-foreground text-sm">
          Quick converters and reference tables for the field
        </p>
      </div>

      {/* Live Converters Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ConverterWidget category="length" />
        <ConverterWidget category="volume" />
        <ConverterWidget category="pressure" />
        <ConverterWidget category="flow" />
        <ConverterWidget category="weight" />

        {/* Temperature (special: not linear via toBase) */}
        <TemperatureConverter />
      </div>

      {/* Reference Tables Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Reference Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fractions" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-3">
              <TabsTrigger value="fractions" data-testid="tab-fractions">Fractions</TabsTrigger>
              <TabsTrigger value="pipes" data-testid="tab-pipes">Pipe Sizes</TabsTrigger>
              <TabsTrigger value="threads" data-testid="tab-threads">NPT Threads</TabsTrigger>
              <TabsTrigger value="dfu" data-testid="tab-dfu">DFU</TabsTrigger>
            </TabsList>

            <TabsContent value="fractions">
              <p className="text-xs text-muted-foreground mb-2">
                Convert between fractional and decimal inches, plus millimeters.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" data-testid="table-fractions">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 border-b">Fraction (in)</th>
                      <th className="text-right p-2 border-b">Decimal (in)</th>
                      <th className="text-right p-2 border-b">Millimeters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fractionTable.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="p-2 font-mono font-bold">{row.fraction}"</td>
                        <td className="p-2 font-mono text-right">{row.decimal}</td>
                        <td className="p-2 font-mono text-right">{row.mm} mm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="pipes">
              <p className="text-xs text-muted-foreground mb-2">
                Nominal pipe sizes vs actual OD/ID for common materials. (Schedule 40 PVC & Steel)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" data-testid="table-pipes">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 border-b">Nominal</th>
                      <th colSpan={2} className="text-center p-2 border-b border-l">Copper Type L</th>
                      <th colSpan={2} className="text-center p-2 border-b border-l">PVC Sch 40</th>
                      <th colSpan={2} className="text-center p-2 border-b border-l">Steel</th>
                    </tr>
                    <tr className="text-xs">
                      <th className="p-2 border-b"></th>
                      <th className="text-right p-2 border-b border-l">OD</th>
                      <th className="text-right p-2 border-b">ID</th>
                      <th className="text-right p-2 border-b border-l">OD</th>
                      <th className="text-right p-2 border-b">ID</th>
                      <th className="text-right p-2 border-b border-l">OD</th>
                      <th className="text-right p-2 border-b">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipeSizes.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="p-2 font-bold font-mono">{row.nominal}</td>
                        <td className="p-2 font-mono text-right border-l">{row.copper_od}</td>
                        <td className="p-2 font-mono text-right">{row.copper_id}</td>
                        <td className="p-2 font-mono text-right border-l">{row.pvc40_od}</td>
                        <td className="p-2 font-mono text-right">{row.pvc40_id}</td>
                        <td className="p-2 font-mono text-right border-l">{row.steel_od}</td>
                        <td className="p-2 font-mono text-right">{row.steel_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">All measurements in inches.</p>
            </TabsContent>

            <TabsContent value="threads">
              <p className="text-xs text-muted-foreground mb-2">
                National Pipe Taper (NPT) threads per inch — used on threaded steel & brass fittings.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" data-testid="table-threads">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 border-b">NPS</th>
                      <th className="text-right p-2 border-b">Threads per Inch</th>
                      <th className="text-left p-2 border-b">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {npsThreads.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="p-2 font-bold font-mono">{row.nps}</td>
                        <td className="p-2 font-mono text-right">{row.tpi}</td>
                        <td className="p-2 font-mono">{row.designation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="dfu">
              <p className="text-xs text-muted-foreground mb-2">
                Drainage Fixture Units (DFU) and minimum trap sizes per common fixture.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" data-testid="table-dfu">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 border-b">Fixture</th>
                      <th className="text-right p-2 border-b">DFU</th>
                      <th className="text-right p-2 border-b">Trap Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dfuTable.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="p-2">{row.fixture}</td>
                        <td className="p-2 font-mono font-bold text-right text-[#FF5F00]">{row.dfu}</td>
                        <td className="p-2 font-mono text-right">{row.trap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Values based on UPC/IPC standard fixtures. Check your local amendments.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Temperature converter — separate because conversion isn't linear via base unit
function TemperatureConverter() {
  const [unit, setUnit] = useState("F");
  const [value, setValue] = useState("");

  const num = parseFloat(value);
  const isValid = !isNaN(num);

  let f = 0, c = 0, k = 0;
  if (isValid) {
    if (unit === "F") {
      f = num;
      c = (num - 32) * 5 / 9;
      k = c + 273.15;
    } else if (unit === "C") {
      c = num;
      f = num * 9 / 5 + 32;
      k = c + 273.15;
    } else {
      k = num;
      c = num - 273.15;
      f = c * 9 / 5 + 32;
    }
  }

  const fmt = (n) => isValid ? (Math.abs(n) >= 100 ? n.toFixed(1) : n.toFixed(2)) : "";

  return (
    <Card data-testid="converter-temperature">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading uppercase text-lg flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-[#FF5F00]" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
          <div>
            <Label className="text-xs uppercase font-bold text-muted-foreground">Value</Label>
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="h-12 text-lg font-mono"
              data-testid="temp-input"
            />
          </div>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-12 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">°F</SelectItem>
              <SelectItem value="C">°C</SelectItem>
              <SelectItem value="K">K</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs uppercase text-muted-foreground">°F</p>
            <p className="font-mono font-bold text-lg" data-testid="temp-f">{fmt(f)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase text-muted-foreground">°C</p>
            <p className="font-mono font-bold text-lg" data-testid="temp-c">{fmt(c)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase text-muted-foreground">K</p>
            <p className="font-mono font-bold text-lg" data-testid="temp-k">{fmt(k)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
