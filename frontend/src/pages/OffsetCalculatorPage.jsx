import { useState } from "react";
import { API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Ruler, ArrowRight, Info } from "lucide-react";

const MATERIALS = [
  { id: "pvc", label: "PVC (Schedule 40)" },
  { id: "copper", label: "Copper (Sweat)" },
  { id: "cast_iron", label: "Cast Iron (No-Hub)" },
  { id: "black_iron", label: "Black Iron (Threaded)" },
  { id: "stainless", label: "Stainless Steel (Press-Fit)" },
];

const PIPE_SIZES = ["1/2", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", "3", "4", "6"];

const CAST_IRON_SIZES = ["1-1/2", "2", "3", "4", "6"];

const ANGLES = [
  { id: "11.25", label: "11.25°" },
  { id: "22.5", label: "22.5°" },
  { id: "45", label: "45°" },
  { id: "60", label: "60°" },
];

export default function OffsetCalculatorPage() {
  const [material, setMaterial] = useState("");
  const [pipeSize, setPipeSize] = useState("");
  const [angle, setAngle] = useState("");
  const [offset, setOffset] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSizes = material === "cast_iron" ? CAST_IRON_SIZES : PIPE_SIZES;

  const handleMaterialChange = (val) => {
    setMaterial(val);
    if (val === "cast_iron" && !CAST_IRON_SIZES.includes(pipeSize)) {
      setPipeSize("");
    }
    setResult(null);
  };

  const handleCalculate = async () => {
    if (!material || !pipeSize || !angle || !offset) {
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
        `${API}/offset-calculator/calculate?material=${material}&pipe_size=${encodeURIComponent(pipeSize)}&angle=${angle}&offset=${offsetVal}`
      );
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const formatInches = (val) => {
    if (val === undefined || val === null) return "—";
    const whole = Math.floor(val);
    const fraction = val - whole;
    // Convert to nearest 1/16
    const sixteenths = Math.round(fraction * 16);
    if (sixteenths === 0) return `${whole}"`;
    if (sixteenths === 16) return `${whole + 1}"`;
    if (sixteenths === 8) return `${whole} 1/2"`;
    if (sixteenths === 4) return `${whole} 1/4"`;
    if (sixteenths === 12) return `${whole} 3/4"`;
    return `${val.toFixed(3)}"`;
  };

  return (
    <div className="space-y-6" data-testid="offset-calculator-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Offset Cut Calculator</h1>
        <p className="text-muted-foreground text-sm">Calculate the exact travel pipe cut length between fittings</p>
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
              Select material, pipe size, angle, and offset distance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Material */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Material Type</Label>
              <Select value={material} onValueChange={handleMaterialChange}>
                <SelectTrigger className="h-12 mt-1" data-testid="select-material">
                  <SelectValue placeholder="Select material..." />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pipe Size */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Pipe Size</Label>
              <Select value={pipeSize} onValueChange={(v) => { setPipeSize(v); setResult(null); }}>
                <SelectTrigger className="h-12 mt-1" data-testid="select-pipe-size">
                  <SelectValue placeholder="Select pipe size..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s) => (
                    <SelectItem key={s} value={s}>{s}"</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {material === "cast_iron" && (
                <p className="text-xs text-muted-foreground mt-1">Cast iron no-hub starts at 1-1/2"</p>
              )}
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
              <p className="text-xs text-muted-foreground mt-1">The perpendicular distance between pipe centerlines</p>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={loading || !material || !pipeSize || !angle || !offset}
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
              {/* Main Result */}
              <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20" data-testid="offset-calc-result">
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Cut Piece Length</p>
                  <p className="text-5xl font-bold text-green-600 dark:text-green-400 font-mono" data-testid="cut-piece-value">
                    {result.cut_piece.toFixed(4)}"
                  </p>
                  <p className="text-lg text-muted-foreground mt-1">{formatInches(result.cut_piece)}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    This is the pipe you cut between the two {result.angle} fittings
                  </p>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card data-testid="offset-calc-breakdown">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg uppercase">Calculation Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Material</p>
                      <p className="font-bold mt-1">{result.material}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Pipe Size</p>
                      <p className="font-bold mt-1">{result.pipe_size}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Angle</p>
                      <p className="font-bold mt-1">{result.angle}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-sm">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Offset</p>
                      <p className="font-bold mt-1">{result.offset}"</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Travel (center-to-center)</span>
                      <span className="font-mono font-bold">{result.travel.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Multiplier (× offset)</span>
                      <span className="font-mono">× {result.travel_multiplier}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Fitting takeoff (each end)</span>
                      <span className="font-mono text-red-500">- {result.fitting_takeoff_each.toFixed(4)}"</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total deducted (× 2 fittings)</span>
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

              {/* Formula explanation */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#FF5F00] flex-shrink-0 mt-1" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-mono">Travel = {result.offset}" × {result.travel_multiplier} = {result.travel.toFixed(4)}"</p>
                      <p className="font-mono">Cut = {result.travel.toFixed(4)}" - (2 × {result.fitting_takeoff_each.toFixed(4)}") = <strong className="text-foreground">{result.cut_piece.toFixed(4)}"</strong></p>
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
                  The calculator accounts for fitting takeoffs to give you the exact pipe cut length
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reference Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">1</span>
            <span><strong className="text-foreground">Travel</strong> is calculated: Offset × multiplier (e.g. ×1.414 for 45°). This is center-to-center between fittings.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">2</span>
            <span><strong className="text-foreground">Fitting takeoff</strong> is looked up based on your material, pipe size, and angle. This is how deep the pipe seats into each fitting.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">3</span>
            <span><strong className="text-foreground">Cut piece</strong> = Travel - (2 × fitting takeoff). This is the actual pipe length you cut.</span>
          </div>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-sm p-3">
            <p><strong className="text-foreground">Pro Tip:</strong> Always dry-fit before gluing/soldering. Takeoff values are standard — your actual fittings may vary slightly by manufacturer. When in doubt, measure the fitting center-to-end with a ruler.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
