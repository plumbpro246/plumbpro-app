import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Delete, Divide, Equal, Minus, Plus, X, Percent } from "lucide-react";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const inputPercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : "Error";
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;
    
    const inputValue = parseFloat(display);
    let result;

    switch (operation) {
      case "+":
        result = previousValue + inputValue;
        break;
      case "-":
        result = previousValue - inputValue;
        break;
      case "×":
        result = previousValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? previousValue / inputValue : "Error";
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const CalcButton = ({ children, onClick, className = "", variant = "default" }) => {
    const baseClass = "h-14 text-lg font-bold transition-all active:scale-95";
    const variants = {
      default: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
      operator: "bg-[#003366] text-white hover:bg-[#003366]/90",
      equals: "bg-[#FF5F00] text-white hover:bg-[#FF5F00]/90",
      function: "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
    };

    return (
      <Button
        onClick={onClick}
        className={`${baseClass} ${variants[variant]} ${className}`}
        data-testid={`calc-btn-${children}`}
      >
        {children}
      </Button>
    );
  };

  return (
    <div className="space-y-6" data-testid="calculator-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Cpu className="w-8 h-8 text-[#FF5F00]" />
          Calculator
        </h1>
        <p className="text-muted-foreground text-sm">General purpose calculator for field calculations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Calculator */}
        <Card className="border-2 border-[#003366]">
          <CardHeader className="bg-[#003366] text-white pb-2">
            <CardTitle className="font-heading uppercase">Calculator</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Display */}
            <div className="bg-slate-900 text-white p-4 rounded-sm mb-4">
              <div className="text-xs text-slate-400 h-5">
                {previousValue !== null && `${previousValue} ${operation}`}
              </div>
              <div className="text-4xl font-mono text-right truncate" data-testid="calc-display">
                {display}
              </div>
              {memory !== 0 && (
                <div className="text-xs text-[#FF5F00] mt-1">M: {memory}</div>
              )}
            </div>

            {/* Memory Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <CalcButton variant="function" onClick={memoryClear}>MC</CalcButton>
              <CalcButton variant="function" onClick={memoryRecall}>MR</CalcButton>
              <CalcButton variant="function" onClick={memoryAdd}>M+</CalcButton>
              <CalcButton variant="function" onClick={memorySubtract}>M-</CalcButton>
            </div>

            {/* Main Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="function" onClick={clear}>AC</CalcButton>
              <CalcButton variant="function" onClick={clearEntry}>CE</CalcButton>
              <CalcButton variant="function" onClick={inputPercent}>%</CalcButton>
              <CalcButton variant="operator" onClick={() => performOperation("÷")}>÷</CalcButton>

              <CalcButton onClick={() => inputDigit(7)}>7</CalcButton>
              <CalcButton onClick={() => inputDigit(8)}>8</CalcButton>
              <CalcButton onClick={() => inputDigit(9)}>9</CalcButton>
              <CalcButton variant="operator" onClick={() => performOperation("×")}>×</CalcButton>

              <CalcButton onClick={() => inputDigit(4)}>4</CalcButton>
              <CalcButton onClick={() => inputDigit(5)}>5</CalcButton>
              <CalcButton onClick={() => inputDigit(6)}>6</CalcButton>
              <CalcButton variant="operator" onClick={() => performOperation("-")}>-</CalcButton>

              <CalcButton onClick={() => inputDigit(1)}>1</CalcButton>
              <CalcButton onClick={() => inputDigit(2)}>2</CalcButton>
              <CalcButton onClick={() => inputDigit(3)}>3</CalcButton>
              <CalcButton variant="operator" onClick={() => performOperation("+")}>+</CalcButton>

              <CalcButton onClick={toggleSign}>±</CalcButton>
              <CalcButton onClick={() => inputDigit(0)}>0</CalcButton>
              <CalcButton onClick={inputDecimal}>.</CalcButton>
              <CalcButton variant="equals" onClick={calculate}>=</CalcButton>
            </div>
          </CardContent>
        </Card>

        {/* Quick Conversions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading uppercase">Quick Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-sm">
                  <span className="font-bold">Length</span>
                  <span></span>
                  <span>1 inch</span><span className="text-right">= 2.54 cm</span>
                  <span>1 foot</span><span className="text-right">= 0.3048 m</span>
                  <span>1 foot</span><span className="text-right">= 12 inches</span>
                  <span>1 yard</span><span className="text-right">= 3 feet</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-sm">
                  <span className="font-bold">Volume</span>
                  <span></span>
                  <span>1 gallon</span><span className="text-right">= 3.785 L</span>
                  <span>1 gallon</span><span className="text-right">= 231 cu in</span>
                  <span>1 cu ft</span><span className="text-right">= 7.48 gal</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-sm">
                  <span className="font-bold">Pressure</span>
                  <span></span>
                  <span>1 PSI</span><span className="text-right">= 2.31 ft head</span>
                  <span>1 ft head</span><span className="text-right">= 0.433 PSI</span>
                  <span>1 bar</span><span className="text-right">= 14.504 PSI</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-sm">
                  <span className="font-bold">Flow</span>
                  <span></span>
                  <span>1 GPM</span><span className="text-right">= 0.134 CFM</span>
                  <span>1 CFM</span><span className="text-right">= 7.48 GPM</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded-sm">
                  <span className="font-bold">Temperature</span>
                  <span></span>
                  <span>°F to °C</span><span className="text-right">(°F - 32) × 5/9</span>
                  <span>°C to °F</span><span className="text-right">(°C × 9/5) + 32</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading uppercase">Pipe Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-bold">Nominal</th>
                      <th className="text-left py-2 font-bold">OD (in)</th>
                      <th className="text-left py-2 font-bold">ID (in)</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr><td className="py-1">1/2&quot;</td><td>0.840</td><td>0.622</td></tr>
                    <tr className="bg-muted/50"><td className="py-1">3/4&quot;</td><td>1.050</td><td>0.824</td></tr>
                    <tr><td className="py-1">1&quot;</td><td>1.315</td><td>1.049</td></tr>
                    <tr className="bg-muted/50"><td className="py-1">1-1/4&quot;</td><td>1.660</td><td>1.380</td></tr>
                    <tr><td className="py-1">1-1/2&quot;</td><td>1.900</td><td>1.610</td></tr>
                    <tr className="bg-muted/50"><td className="py-1">2&quot;</td><td>2.375</td><td>2.067</td></tr>
                    <tr><td className="py-1">3&quot;</td><td>3.500</td><td>3.068</td></tr>
                    <tr className="bg-muted/50"><td className="py-1">4&quot;</td><td>4.500</td><td>4.026</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
