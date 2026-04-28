import { useState, useEffect } from "react";
import { API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Ruler, Info } from "lucide-react";

const MANUFACTURERS = [
  { id: "charlotte_pvc", name: "Charlotte Pipe", material: "PVC", joint: "Sch 40 Solvent Weld" },
  { id: "nibco_pvc", name: "Nibco", material: "PVC", joint: "Sch 40 Solvent Weld" },
  { id: "cerro_copper", name: "Cerro Copper", material: "Copper", joint: "Sweat/Solder" },
  { id: "nibco_copper", name: "Nibco", material: "Copper", joint: "Sweat/Solder" },
  { id: "charlotte_ci", name: "Charlotte Pipe", material: "Cast Iron", joint: "No-Hub" },
  { id: "ward_black_iron", name: "Ward Mfg", material: "Black Iron", joint: "Threaded" },
  { id: "anvil_black_iron", name: "Anvil International", material: "Black Iron", joint: "Threaded" },
  { id: "viega_ss", name: "Viega ProPress", material: "Stainless Steel", joint: "Press-Fit" },
  { id: "sharkbite_pex", name: "SharkBite", material: "PEX", joint: "Push-Fit" },
  { id: "nibco_pex", name: "Nibco", material: "PEX", joint: "Press/Crimp" },
];

// Pipe sizes available per manufacturer (cast iron & PEX have fewer)
const MFR_SIZES = {
  charlotte_pvc: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  nibco_pvc: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  cerro_copper: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  nibco_copper: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  charlotte_ci: ["1-1/2","2","3","4","6"],
  ward_black_iron: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  anvil_black_iron: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4","6"],
  viega_ss: ["1/2","3/4","1","1-1/4","1-1/2","2","2-1/2","3","4"],
  sharkbite_pex: ["1/2","3/4","1","1-1/4","1-1/2","2"],
  nibco_pex: ["1/2","3/4","1","1-1/4","1-1/2","2"],
};

const ANGLES = [
  { id: "11.25", label: "11.25°" },
  { id: "22.5", label: "22.5°" },
  { id: "45", label: "45°" },
  { id: "60", label: "60°" },
];

// Group manufacturers by material for the dropdown
const materialGroups = {};
MANUFACTURERS.forEach((m) => {
  if (!materialGroups[m.material]) materialGroups[m.material] = [];
  materialGroups[m.material].push(m);
});

export default function OffsetCalculatorPage() {
  const [manufacturer, setManufacturer] = useState("");
  const [pipeSize, setPipeSize] = useState("");
  const [angle, setAngle] = useState("");
  const [offset, setOffset] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSizes = manufacturer ? (MFR_SIZES[manufacturer] || []) : [];
  const selectedMfr = MANUFACTURERS.find((m) => m.id === manufacturer);

  const handleMfrChange = (val) => {
    setManufacturer(val);
    const newSizes = MFR_SIZES[val] || [];
    if (!newSizes.includes(pipeSize)) setPipeSize("");
    setResult(null);
  };

  const handleCalculate = async () => {
    if (!manufacturer || !pipeSize || !angle || !offset) {
      toast.error("Please fill in all fields");
      return;
    }
    const offsetVal = parseFloat(offset);
    if (isNaN(offsetVal) || offsetVal <= 0) {
      toast.error("Enter a valid offset distance");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/offset-calculator/calculate?manufacturer=${manufacturer}&pipe_size=${encodeURIComponent(pipeSize)}&angle=${angle}&offset=${offsetVal}`
      );
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="offset-calculator-page">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Offset Cut Calculator</h1>
        <p className="text-muted-foreground text-sm">Manufacturer-specific fitting takeoffs for exact cut piece lengths</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card className="border-2 border-[#003366]" data-testid="offset-calc-inputs">
          <CardHeader className="bg-[#003366] text-white">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <CardTitle className="font-heading uppercase">Input Parameters</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Select manufacturer, pipe size, angle, and offset
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Manufacturer */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Manufacturer & Material</Label>
              <Select value={manufacturer} onValueChange={handleMfrChange}>
                <SelectTrigger className="h-12 mt-1" data-testid="select-manufacturer">
                  <SelectValue placeholder="Select manufacturer..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materialGroups).map(([material, mfrs]) => (
                    <div key={material}>
                      <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted">{material}</div>
                      {mfrs.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} — {m.joint}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {selectedMfr && (
                <p className="text-xs text-muted-foreground mt-1">{selectedMfr.material} / {selectedMfr.joint}</p>
              )}
            </div>

            {/* Pipe Size */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Pipe Size</Label>
              <Select value={pipeSize} onValueChange={(v) => { setPipeSize(v); setResult(null); }} disabled={!manufacturer}>
                <SelectTrigger className="h-12 mt-1" data-testid="select-pipe-size">
                  <SelectValue placeholder={manufacturer ? "Select pipe size..." : "Select manufacturer first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s) => (
                    <SelectItem key={s} value={s}>{s}"</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Angle */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Offset Angle</Label>
              <Select value={angle} onValueChange={(v) => { setAngle(v); setResult(null); }}>
                <SelectTrigger className="h-12 mt-1" data-testid="select-angle">
                  <SelectValue placeholder="Select angle..." />
                </SelectTrigger>
                <SelectContent>
                  {ANGLES.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Offset Distance */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Offset Distance (inches)</Label>
              <Input
                type="number"
                step="0.0625"
                min="0"
                value={offset}
                onChange={(e) => { setOffset(e.target.value); setResult(null); }}
                placeholder="e.g. 12"
                className="h-12 mt-1"
                data-testid="input-offset"
              />
              <p className="text-xs text-muted-foreground mt-1">Perpendicular distance between pipe centerlines</p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={loading || !manufacturer || !pipeSize || !angle || !offset}
              className="w-full h-14 bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase text-lg"
              data-testid="calculate-offset-btn"
            >
              {loading ? "Calculating..." : "Calculate Cut Piece"}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20" data-testid="offset-calc-result">
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Cut Piece Length</p>
                  <p className="text-5xl font-bold text-green-600 dark:text-green-400 font-mono" data-testid="cut-piece-value">
                    {result.cut_piece.toFixed(4)}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Pipe to cut between the two {result.angle} {result.material} fittings
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="offset-calc-breakdown">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg uppercase">Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Manufacturer</p>
                      <p className="font-bold mt-1">{result.manufacturer}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Material / Joint</p>
                      <p className="font-bold mt-1">{result.material} — {result.joint}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Pipe Size</p>
                      <p className="font-bold mt-1">{result.pipe_size}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Angle / Offset</p>
                      <p className="font-bold mt-1">{result.angle} / {result.offset}"</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Travel (center-to-center)</span>
                      <span className="font-mono font-bold">{result.travel.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Multiplier</span>
                      <span className="font-mono">x {result.travel_multiplier}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Fitting takeoff (each)</span>
                      <span className="font-mono text-red-500">- {result.fitting_takeoff_each.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total deducted (x 2)</span>
                      <span className="font-mono text-red-500">- {result.total_takeoff.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2 font-bold">
                      <span>Cut piece</span>
                      <span className="font-mono text-green-600">{result.cut_piece.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Set (horizontal run)</span>
                      <span className="font-mono">{result.set_run.toFixed(4)}"</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#FF5F00] flex-shrink-0 mt-1" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-mono">Travel = {result.offset}" x {result.travel_multiplier} = {result.travel.toFixed(4)}"</p>
                      <p className="font-mono">Cut = {result.travel.toFixed(4)}" - (2 x {result.fitting_takeoff_each.toFixed(4)}") = <strong className="text-foreground">{result.cut_piece.toFixed(4)}"</strong></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center py-12">
                <Ruler className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground font-medium">Fill in the parameters and tap Calculate</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Uses manufacturer-specific fitting takeoffs for exact results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">1</span>
            <span><strong className="text-foreground">Travel</strong> = Offset x multiplier (x1.414 for 45°, x2.613 for 22.5°, etc.).</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">2</span>
            <span><strong className="text-foreground">Fitting takeoff</strong> is looked up from the manufacturer's specs for the selected material, pipe size, and angle.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">3</span>
            <span><strong className="text-foreground">Cut piece</strong> = Travel - (2 x fitting takeoff). This is the pipe you cut.</span>
          </div>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-sm p-3">
            <p><strong className="text-foreground">Pro Tip:</strong> Always dry-fit before gluing/soldering. Takeoff values are based on standard manufacturer specs — verify against the actual fitting in your hand when precision is critical.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
