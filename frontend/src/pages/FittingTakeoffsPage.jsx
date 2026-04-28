import { useState, useEffect } from "react";
import { API } from "@/App";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const MATERIAL_COLORS = {
  PVC: "bg-blue-500",
  Copper: "bg-amber-600",
  "Cast Iron": "bg-slate-600",
  "Black Iron": "bg-zinc-700",
  "Stainless Steel": "bg-cyan-600",
  PEX: "bg-rose-500",
};

const ANGLE_LABELS = { "11.25": "11.25°", "22.5": "22.5°", "45": "45°", "60": "60°" };

export default function FittingTakeoffsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/fitting-takeoffs`);
        setData(res.data);
      } catch {
        console.error("Failed to load fitting takeoffs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data.filter((mfr) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return mfr.name.toLowerCase().includes(q) || mfr.material.toLowerCase().includes(q) || mfr.joint.toLowerCase().includes(q);
  });

  // Group by material
  const grouped = {};
  filtered.forEach((mfr) => {
    if (!grouped[mfr.material]) grouped[mfr.material] = [];
    grouped[mfr.material].push(mfr);
  });

  return (
    <div className="space-y-6" data-testid="fitting-takeoffs-page">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Fitting Takeoff Reference</h1>
        <p className="text-muted-foreground text-sm">Manufacturer-specific center-to-end dimensions for offset fittings</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by manufacturer, material, or joint type..."
          className="pl-10 h-12"
          data-testid="takeoff-search"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results found.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([material, mfrs]) => (
          <div key={material} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-sm ${MATERIAL_COLORS[material] || "bg-gray-500"}`} />
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">{material}</h2>
              <Badge variant="outline">{mfrs.length} manufacturer{mfrs.length > 1 ? "s" : ""}</Badge>
            </div>

            {mfrs.map((mfr) => {
              const isExpanded = expandedId === mfr.id;
              const sizes = Object.keys(mfr.takeoffs);
              return (
                <Card key={mfr.id} className="border border-border rounded-sm" data-testid={`takeoff-card-${mfr.id}`}>
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : mfr.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg">{mfr.name}</CardTitle>
                        <CardDescription>{mfr.material} — {mfr.joint}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{sizes.length} sizes</Badge>
                        <span className="text-muted-foreground text-lg">{isExpanded ? "−" : "+"}</span>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-bold uppercase text-xs">Pipe Size</th>
                              {Object.keys(ANGLE_LABELS).map((a) => (
                                <th key={a} className="text-center py-2 px-3 font-bold uppercase text-xs">{ANGLE_LABELS[a]}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizes.map((size) => (
                              <tr key={size} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="py-2 px-3 font-bold">{size}"</td>
                                {Object.keys(ANGLE_LABELS).map((a) => (
                                  <td key={a} className="py-2 px-3 text-center font-mono">
                                    {mfr.takeoffs[size][a] !== undefined ? `${mfr.takeoffs[size][a]}"` : "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Values shown are center-to-end fitting dimensions (inches). Subtract from each end of the travel piece to get cut length.
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ))
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">About Fitting Takeoffs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            The <strong className="text-foreground">fitting takeoff</strong> (center-to-end) is the distance from the center of a fitting to the point where the pipe stops inside it.
          </p>
          <p>
            When calculating offset cut pieces, you subtract <strong className="text-foreground">two takeoffs</strong> (one per fitting) from the travel distance to get the actual pipe cut length.
          </p>
          <p>
            Takeoff values vary by manufacturer, material, pipe size, and fitting angle. The values on this page are based on standard catalog dimensions. Always verify against the actual fitting when precision is critical.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
