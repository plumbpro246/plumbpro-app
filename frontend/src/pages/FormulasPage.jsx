import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, ChevronRight } from "lucide-react";

export default function FormulasPage() {
  const { token } = useAuth();
  const [formulas, setFormulas] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
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
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-sm p-4 text-center">
                    <p className="text-sm text-muted-foreground uppercase font-bold">Result</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono">
                      {result} <span className="text-lg">{selectedFormula.unit}</span>
                    </p>
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
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
