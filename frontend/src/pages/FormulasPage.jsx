import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, ChevronRight, Ruler, Info } from "lucide-react";

export default function FormulasPage() {
  const { token } = useAuth();
  const [formulas, setFormulas] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [extras, setExtras] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const response = await axios.get(`${API}/formulas`, { headers });
        setFormulas(response.data);
      } catch (error) {
        toast.error("Failed to load formulas");
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  const handleFormulaSelect = (formulaId) => {
    const formula = formulas.find(f => f.id === formulaId);
    setSelectedFormula(formula);
    setInputValues({});
    setResult(null);
    setExtras(null);
  };

  const handleCalculate = async () => {
    if (!selectedFormula) return;
    
    try {
      const response = await axios.post(
        `${API}/formulas/calculate?formula_id=${selectedFormula.id}`,
        inputValues,
        { headers }
      );
      setResult(response.data.result);
      setExtras(response.data.extras || null);
      toast.success("Calculated!");
    } catch (error) {
      toast.error("Calculation failed");
    }
  };

  return (
    <div className="space-y-6" data-testid="formulas-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Plumbing Formulas</h1>
        <p className="text-muted-foreground text-sm">Quick calculations for common plumbing tasks</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formula List */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold uppercase">Select Formula</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {formulas.map((formula) => (
                <Card 
                  key={formula.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormula?.id === formula.id 
                      ? "border-[#FF5F00] bg-[#FF5F00]/5" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleFormulaSelect(formula.id)}
                  data-testid={`formula-${formula.id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{formula.name}</h3>
                      <p className="text-sm text-muted-foreground">{formula.description}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block font-mono">
                        {formula.formula}
                      </code>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Calculator */}
        <div>
          {selectedFormula ? (
            <Card className="border-2 border-[#003366]">
              <CardHeader className="bg-[#003366] text-white">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <CardTitle className="font-heading uppercase">{selectedFormula.name}</CardTitle>
                </div>
                <CardDescription className="text-slate-300">
                  {selectedFormula.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-muted p-3 rounded-sm">
                  <code className="font-mono text-lg">{selectedFormula.formula}</code>
                </div>

                {Object.entries(selectedFormula.variables).map(([key, desc]) => (
                  <div key={key}>
                    <Label className="text-sm font-bold uppercase tracking-wide">
                      {key} - {desc}
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder={`Enter ${key}`}
                      value={inputValues[key] || ""}
                      onChange={(e) => setInputValues({
                        ...inputValues,
                        [key]: parseFloat(e.target.value) || 0
                      })}
                      className="h-12"
                      data-testid={`input-${key}`}
                    />
                  </div>
                ))}

                <Button 
                  onClick={handleCalculate}
                  className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                  data-testid="calculate-btn"
                >
                  Calculate
                </Button>

                {result !== null && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-sm p-4 text-center" data-testid="formula-result">
                    {extras ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground uppercase font-bold">Results</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Travel (fitting to fitting)</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                              {extras.travel} <span className="text-sm">{selectedFormula.unit}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Set (run)</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                              {extras.set} <span className="text-sm">{selectedFormula.unit}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground uppercase font-bold">Result</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono">
                          {result} <span className="text-lg">{selectedFormula.unit}</span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a formula to start calculating</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-bold uppercase">Conversion</th>
                  <th className="text-left py-2 px-3 font-bold uppercase">Formula</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-3">Feet of Head to PSI</td><td className="py-2 px-3 font-mono">PSI = Feet × 0.433</td></tr>
                <tr><td className="py-2 px-3">PSI to Feet of Head</td><td className="py-2 px-3 font-mono">Feet = PSI × 2.31</td></tr>
                <tr><td className="py-2 px-3">GPM to Cubic Feet/Min</td><td className="py-2 px-3 font-mono">CFM = GPM × 0.1337</td></tr>
                <tr><td className="py-2 px-3">Gallons per Minute</td><td className="py-2 px-3 font-mono">GPM = Gallons ÷ Minutes</td></tr>
                <tr><td className="py-2 px-3">Pipe Area (sq in)</td><td className="py-2 px-3 font-mono">A = π × r²</td></tr>
                <tr><td className="py-2 px-3">Drainage Slope (1/4&quot;/ft)</td><td className="py-2 px-3 font-mono">Drop = Length × 0.25</td></tr>
                <tr className="border-t-2 border-[#FF5F00]/30"><td className="py-2 px-3 font-bold">45° Offset Multiplier</td><td className="py-2 px-3 font-mono font-bold">Travel = Offset × 1.414</td></tr>
                <tr><td className="py-2 px-3">45° Set (Run)</td><td className="py-2 px-3 font-mono">Set = Offset (1:1 ratio)</td></tr>
                <tr><td className="py-2 px-3 font-bold">22.5° Offset Multiplier</td><td className="py-2 px-3 font-mono font-bold">Travel = Offset × 2.613</td></tr>
                <tr><td className="py-2 px-3">22.5° Set (Run)</td><td className="py-2 px-3 font-mono">Set = Offset × 2.414</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pipe Offset Layout Guide */}
      <div data-testid="offset-layout-guide">
        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
          <Ruler className="w-6 h-6 text-[#FF5F00]" />
          Pipe Offset Layout Guide
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 45° Offset */}
          <Card className="border-2 border-[#003366]" data-testid="guide-45-degree">
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">45° Offset Layout</CardTitle>
              <CardDescription className="text-slate-300">
                The most common offset in plumbing — used to shift pipe runs around obstacles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Diagram */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-sm p-4 border border-border">
                <svg viewBox="0 0 400 260" className="w-full max-w-sm mx-auto" style={{fontFamily: "monospace"}}>
                  {/* Pipe lines */}
                  <line x1="30" y1="40" x2="160" y2="40" stroke="#003366" strokeWidth="4" />
                  <line x1="160" y1="40" x2="260" y2="180" stroke="#FF5F00" strokeWidth="4" />
                  <line x1="260" y1="180" x2="380" y2="180" stroke="#003366" strokeWidth="4" />
                  
                  {/* Offset dimension (vertical) */}
                  <line x1="15" y1="40" x2="15" y2="180" stroke="#666" strokeWidth="1" strokeDasharray="4" />
                  <line x1="10" y1="40" x2="20" y2="40" stroke="#666" strokeWidth="1.5" />
                  <line x1="10" y1="180" x2="20" y2="180" stroke="#666" strokeWidth="1.5" />
                  <text x="8" y="115" fill="#FF5F00" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90,8,115)">OFFSET</text>
                  
                  {/* Set dimension (horizontal) */}
                  <line x1="160" y1="200" x2="260" y2="200" stroke="#666" strokeWidth="1" strokeDasharray="4" />
                  <line x1="160" y1="195" x2="160" y2="205" stroke="#666" strokeWidth="1.5" />
                  <line x1="260" y1="195" x2="260" y2="205" stroke="#666" strokeWidth="1.5" />
                  <text x="210" y="218" fill="#003366" fontSize="12" fontWeight="bold" textAnchor="middle">SET (RUN)</text>
                  
                  {/* Travel label along diagonal */}
                  <text x="195" y="100" fill="#FF5F00" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(54,195,100)">TRAVEL</text>
                  
                  {/* Angle arcs */}
                  <path d="M 160 40 L 160 70 L 175 60" fill="none" stroke="#888" strokeWidth="1" />
                  <text x="172" y="65" fill="#888" fontSize="10">45°</text>
                  
                  {/* Fitting dots */}
                  <circle cx="160" cy="40" r="5" fill="#FF5F00" />
                  <circle cx="260" cy="180" r="5" fill="#FF5F00" />
                </svg>
              </div>

              {/* Key Formulas */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#FF5F00]" /> Key Formulas
                </h4>
                <div className="grid gap-2">
                  <div className="bg-muted p-3 rounded-sm">
                    <code className="font-mono text-sm font-bold">Travel = Offset × 1.414</code>
                    <p className="text-xs text-muted-foreground mt-1">The diagonal pipe length between the two 45° fittings</p>
                  </div>
                  <div className="bg-muted p-3 rounded-sm">
                    <code className="font-mono text-sm font-bold">Set = Offset</code>
                    <p className="text-xs text-muted-foreground mt-1">The horizontal run equals the offset (tan 45° = 1)</p>
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wide">How to Layout</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">1</span>
                    <span><strong className="text-foreground">Measure the offset</strong> — the perpendicular distance between the two pipe centerlines you need to connect.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <span><strong className="text-foreground">Calculate the travel</strong> — multiply the offset by <strong>1.414</strong>. This is the center-to-center measurement between your two 45° fittings.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span><strong className="text-foreground">The set (run)</strong> equals the offset distance. Mark this horizontal distance on your run to position the second fitting.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">4</span>
                    <span><strong className="text-foreground">Subtract fitting allowances</strong> — deduct the takeoff (hub depth minus gap) from each end of the travel piece to get your cut length.</span>
                  </li>
                </ol>
              </div>

              {/* Example */}
              <div className="bg-[#003366]/10 dark:bg-[#003366]/30 border border-[#003366]/20 rounded-sm p-4">
                <h4 className="font-bold text-sm uppercase tracking-wide mb-2">Example</h4>
                <p className="text-sm text-muted-foreground">
                  Need to offset <strong className="text-foreground">12 inches</strong> around an I-beam:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li className="font-mono">Travel = 12 × 1.414 = <strong className="text-[#FF5F00]">16.97"</strong></li>
                  <li className="font-mono">Set = <strong className="text-[#FF5F00]">12"</strong></li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Cut your travel piece at 16.97" minus fitting takeoffs on each end.</p>
              </div>
            </CardContent>
          </Card>

          {/* 22.5° Offset */}
          <Card className="border-2 border-[#003366]" data-testid="guide-22-degree">
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">22.5° Offset Layout</CardTitle>
              <CardDescription className="text-slate-300">
                A shallower offset — used when you need a gradual shift with less angle
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Diagram */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-sm p-4 border border-border">
                <svg viewBox="0 0 400 260" className="w-full max-w-sm mx-auto" style={{fontFamily: "monospace"}}>
                  {/* Pipe lines */}
                  <line x1="30" y1="50" x2="100" y2="50" stroke="#003366" strokeWidth="4" />
                  <line x1="100" y1="50" x2="310" y2="190" stroke="#FF5F00" strokeWidth="4" />
                  <line x1="310" y1="190" x2="380" y2="190" stroke="#003366" strokeWidth="4" />
                  
                  {/* Offset dimension (vertical) */}
                  <line x1="15" y1="50" x2="15" y2="190" stroke="#666" strokeWidth="1" strokeDasharray="4" />
                  <line x1="10" y1="50" x2="20" y2="50" stroke="#666" strokeWidth="1.5" />
                  <line x1="10" y1="190" x2="20" y2="190" stroke="#666" strokeWidth="1.5" />
                  <text x="8" y="125" fill="#FF5F00" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90,8,125)">OFFSET</text>
                  
                  {/* Set dimension (horizontal) - longer for 22.5° */}
                  <line x1="100" y1="220" x2="310" y2="220" stroke="#666" strokeWidth="1" strokeDasharray="4" />
                  <line x1="100" y1="215" x2="100" y2="225" stroke="#666" strokeWidth="1.5" />
                  <line x1="310" y1="215" x2="310" y2="225" stroke="#666" strokeWidth="1.5" />
                  <text x="205" y="240" fill="#003366" fontSize="12" fontWeight="bold" textAnchor="middle">SET (RUN) — MUCH LONGER</text>
                  
                  {/* Travel label along diagonal */}
                  <text x="190" y="105" fill="#FF5F00" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(33,190,105)">TRAVEL (LONGER)</text>
                  
                  {/* Angle */}
                  <path d="M 100 50 L 100 80 L 115 73" fill="none" stroke="#888" strokeWidth="1" />
                  <text x="118" y="73" fill="#888" fontSize="9">22.5°</text>
                  
                  {/* Fitting dots */}
                  <circle cx="100" cy="50" r="5" fill="#FF5F00" />
                  <circle cx="310" cy="190" r="5" fill="#FF5F00" />
                </svg>
              </div>

              {/* Key Formulas */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#FF5F00]" /> Key Formulas
                </h4>
                <div className="grid gap-2">
                  <div className="bg-muted p-3 rounded-sm">
                    <code className="font-mono text-sm font-bold">Travel = Offset × 2.613</code>
                    <p className="text-xs text-muted-foreground mt-1">The diagonal pipe length — significantly longer than a 45° offset</p>
                  </div>
                  <div className="bg-muted p-3 rounded-sm">
                    <code className="font-mono text-sm font-bold">Set = Offset × 2.414</code>
                    <p className="text-xs text-muted-foreground mt-1">The horizontal run — over 2× the offset distance</p>
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wide">How to Layout</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">1</span>
                    <span><strong className="text-foreground">Measure the offset</strong> — the perpendicular distance between the two pipe centerlines.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <span><strong className="text-foreground">Calculate the travel</strong> — multiply the offset by <strong>2.613</strong>. This is center-to-center between fittings. Note: this is much longer than a 45° offset for the same distance.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span><strong className="text-foreground">Calculate the set (run)</strong> — multiply the offset by <strong>2.414</strong>. This is how far along the horizontal run your second fitting will be.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">4</span>
                    <span><strong className="text-foreground">Subtract fitting allowances</strong> — deduct the takeoff from each end of the travel piece for your cut length.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5F00] text-white text-xs font-bold flex items-center justify-center">5</span>
                    <span><strong className="text-foreground">Verify clearance</strong> — 22.5° offsets require much more horizontal space. Make sure you have room for the longer set before committing.</span>
                  </li>
                </ol>
              </div>

              {/* Example */}
              <div className="bg-[#003366]/10 dark:bg-[#003366]/30 border border-[#003366]/20 rounded-sm p-4">
                <h4 className="font-bold text-sm uppercase tracking-wide mb-2">Example</h4>
                <p className="text-sm text-muted-foreground">
                  Need to offset <strong className="text-foreground">12 inches</strong> with a gradual 22.5° angle:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li className="font-mono">Travel = 12 × 2.613 = <strong className="text-[#FF5F00]">31.36"</strong></li>
                  <li className="font-mono">Set = 12 × 2.414 = <strong className="text-[#FF5F00]">28.97"</strong></li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Compare: a 45° offset only needs 16.97" of travel and 12" of run for the same 12" offset.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison & When to Use */}
        <Card className="mt-6" data-testid="offset-comparison">
          <CardHeader>
            <CardTitle className="font-heading uppercase">45° vs 22.5° — When to Use Each</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-bold uppercase"></th>
                    <th className="text-left py-3 px-3 font-bold uppercase text-[#FF5F00]">45° Offset</th>
                    <th className="text-left py-3 px-3 font-bold uppercase text-[#FF5F00]">22.5° Offset</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-2 px-3 font-medium">Travel Multiplier</td><td className="py-2 px-3 font-mono">× 1.414</td><td className="py-2 px-3 font-mono">× 2.613</td></tr>
                  <tr className="border-b"><td className="py-2 px-3 font-medium">Set (Run) Multiplier</td><td className="py-2 px-3 font-mono">× 1.000</td><td className="py-2 px-3 font-mono">× 2.414</td></tr>
                  <tr className="border-b"><td className="py-2 px-3 font-medium">Horizontal Space</td><td className="py-2 px-3">Less space needed</td><td className="py-2 px-3">Much more space needed</td></tr>
                  <tr className="border-b"><td className="py-2 px-3 font-medium">Flow Restriction</td><td className="py-2 px-3">More turbulence</td><td className="py-2 px-3">Smoother flow</td></tr>
                  <tr className="border-b"><td className="py-2 px-3 font-medium">Best For</td><td className="py-2 px-3">Tight spaces, most offset work</td><td className="py-2 px-3">Drain lines, where smoother flow matters</td></tr>
                  <tr><td className="py-2 px-3 font-medium">Common Uses</td><td className="py-2 px-3">Around beams, columns, ductwork</td><td className="py-2 px-3">Sewer laterals, underground drainage</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-sm p-4">
              <p className="text-sm">
                <strong>Pro Tip:</strong> Always measure from centerline to centerline. Don't forget to subtract fitting takeoffs (hub depth minus gap) from both ends of your travel piece before cutting. When in doubt, cut long and trim — you can't add pipe back!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
