import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Wrench, AlertTriangle, BookOpen, Package, ChevronDown, ChevronRight, Droplets } from "lucide-react";

const TYPE_COLORS = { tank: "bg-blue-600", tankless: "bg-[#FF5F00]" };

function MfrCard({ mfr }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("install");
  return (
    <Card className="border border-border rounded-sm" data-testid={`wh-${mfr.id}`}>
      <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="font-heading text-lg">{mfr.name}</CardTitle>
              <Badge className={`${TYPE_COLORS[mfr.type]} text-white text-xs uppercase`}>{mfr.type}</Badge>
            </div>
            <CardDescription>{mfr.models.join(", ")}</CardDescription>
            <div className="flex flex-wrap gap-1 mt-2">
              {mfr.fuel_types.map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
            </div>
          </div>
          {open ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1">
              <TabsTrigger value="install" className="text-xs uppercase font-bold">Install</TabsTrigger>
              <TabsTrigger value="troubleshoot" className="text-xs uppercase font-bold">Troubleshoot</TabsTrigger>
              <TabsTrigger value="parts" className="text-xs uppercase font-bold">Parts</TabsTrigger>
            </TabsList>
            <TabsContent value="install" className="mt-4 space-y-4">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide mb-2">Installation Steps</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {mfr.install.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#003366] text-white text-xs font-bold flex items-center justify-center">{i+1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {mfr.install.warnings.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-sm p-4">
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Warnings</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mfr.install.warnings.map((w, i) => <li key={i} className="flex gap-2"><span className="text-red-500 flex-shrink-0">*</span>{w}</li>)}
                  </ul>
                </div>
              )}
            </TabsContent>
            <TabsContent value="troubleshoot" className="mt-4 space-y-3">
              {mfr.troubleshooting.map((t, i) => (
                <div key={i} className="border border-border rounded-sm p-4">
                  <h4 className="font-bold text-sm text-[#FF5F00]">{t.problem}</h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Causes</p>
                      <ul className="text-sm text-muted-foreground space-y-0.5">
                        {t.causes.map((c, j) => <li key={j} className="flex gap-1"><span className="opacity-50">-</span>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Fixes</p>
                      <ul className="text-sm space-y-0.5">
                        {t.fixes.map((f, j) => <li key={j} className="flex gap-1"><span className="text-green-500 flex-shrink-0">-</span>{f}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="parts" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {mfr.parts.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                    <Package className="w-3 h-3 mr-1.5 opacity-60" />{p}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

function CodeSection({ codes }) {
  return (
    <div className="space-y-6">
      {Object.entries(codes).map(([codeType, entries]) => {
        const label = codeType === "upc" ? "UPC (Uniform Plumbing Code)" : codeType === "ipc" ? "IPC (International Plumbing Code)" : codeType === "gas_code" ? "IFGC (Int'l Fuel Gas Code)" : "IMC (Int'l Mechanical Code)";
        return (
          <div key={codeType}>
            <h3 className="font-heading text-lg font-bold uppercase tracking-tight mb-3">{label}</h3>
            <div className="space-y-2">
              {entries.map((c, i) => (
                <div key={i} className="border border-border rounded-sm p-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs font-mono flex-shrink-0">{c.code}</Badge>
                    <div>
                      <p className="font-bold text-sm">{c.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PipingDiagrams({ diagrams, title }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {diagrams.map((d) => (
          <Card key={d.id} className="border-2 border-[#003366]">
            <CardHeader className="bg-[#003366] text-white py-3">
              <CardTitle className="font-heading text-base uppercase">{d.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{d.description}</p>
              {d.use_case && <p className="text-xs"><strong>Best for:</strong> {d.use_case}</p>}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-sm p-3 border border-border">
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{d.diagram_lines.join("\n")}</pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function WaterHeatersPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("manufacturers");

  useEffect(() => {
    axios.get(`${API}/water-heaters`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-muted-foreground py-12">Failed to load data.</p>;

  const tanks = data.manufacturers.filter((m) => m.type === "tank");
  const tankless = data.manufacturers.filter((m) => m.type === "tankless");

  return (
    <div className="space-y-6" data-testid="water-heaters-page">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Droplets className="w-8 h-8 text-[#FF5F00]" /> Water Heaters
        </h1>
        <p className="text-muted-foreground text-sm">Installation, troubleshooting, parts, codes & piping diagrams</p>
      </div>

      {/* Section Nav */}
      <div className="flex flex-wrap gap-2" data-testid="wh-section-nav">
        {[["manufacturers","Manufacturers"],["codes","Codes"],["piping","Piping Diagrams"]].map(([id, label]) => (
          <Button key={id} variant={section === id ? "default" : "outline"} size="sm"
            className={section === id ? "bg-[#003366] text-white font-bold uppercase" : "font-bold uppercase"}
            onClick={() => setSection(id)} data-testid={`wh-nav-${id}`}>{label}</Button>
        ))}
      </div>

      {section === "manufacturers" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-blue-500" /> Tank Water Heaters
            </h2>
            <div className="space-y-3">{tanks.map((m) => <MfrCard key={m.id} mfr={m} />)}</div>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF5F00]" /> Tankless Water Heaters
            </h2>
            <div className="space-y-3">{tankless.map((m) => <MfrCard key={m.id} mfr={m} />)}</div>
          </div>
        </div>
      )}

      {section === "codes" && <CodeSection codes={data.codes} />}
      {section === "piping" && <PipingDiagrams diagrams={data.multi_heater_piping} title="Multi-Heater Piping Configurations" />}
    </div>
  );
}
