import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Search, Package, AlertTriangle, ChevronDown, ChevronRight, Hash } from "lucide-react";

const CATEGORY_ICONS = {
  toilets: "bg-blue-500",
  faucets: "bg-green-500",
  "shower-valves": "bg-purple-500",
  "commercial-flush": "bg-red-500",
  "garbage-disposals": "bg-amber-500",
  sinks: "bg-cyan-500",
};

function MfrCard({ mfr }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("parts");
  return (
    <Card className="border border-border rounded-sm" data-testid={`fixture-${mfr.id}`}>
      <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors py-3" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base">{mfr.name}</CardTitle>
            <CardDescription className="text-xs">{mfr.models.join(", ")}</CardDescription>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1">
              <TabsTrigger value="parts" className="text-xs uppercase font-bold">Parts & Numbers</TabsTrigger>
              <TabsTrigger value="troubleshoot" className="text-xs uppercase font-bold">Troubleshoot & Repair</TabsTrigger>
            </TabsList>
            <TabsContent value="parts" className="mt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-bold uppercase text-xs">Part</th>
                      <th className="text-left py-2 px-2 font-bold uppercase text-xs">Part #</th>
                      <th className="text-left py-2 px-2 font-bold uppercase text-xs">Fits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mfr.parts.map((p, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium">{p.name}</td>
                        <td className="py-2 px-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            <Hash className="w-3 h-3 mr-0.5 opacity-60" />{p.part_no}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground text-xs">{p.fits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="troubleshoot" className="mt-3 space-y-3">
              {mfr.troubleshooting.map((t, i) => (
                <div key={i} className="border border-border rounded-sm p-3">
                  <h4 className="font-bold text-sm text-[#FF5F00]">{t.problem}</h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Causes</p>
                      <ul className="text-sm text-muted-foreground space-y-0.5">
                        {t.causes.map((c, j) => <li key={j} className="flex gap-1"><span className="opacity-50">-</span>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Repair Steps</p>
                      <ul className="text-sm space-y-0.5">
                        {t.fixes.map((f, j) => <li key={j} className="flex gap-1"><span className="text-green-500 flex-shrink-0">-</span>{f}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

export default function FixturesPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get(`${API}/fixtures`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setData(res.data);
        if (res.data.categories.length > 0) setActiveCategory(res.data.categories[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-muted-foreground py-12">Failed to load data.</p>;

  const activeData = data.categories.find((c) => c.id === activeCategory);
  
  const filteredMfrs = activeData ? activeData.manufacturers.filter((mfr) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return mfr.name.toLowerCase().includes(q) 
      || mfr.models.some((m) => m.toLowerCase().includes(q))
      || mfr.parts.some((p) => p.name.toLowerCase().includes(q) || p.part_no.toLowerCase().includes(q));
  }) : [];

  return (
    <div className="space-y-6" data-testid="fixtures-page">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Wrench className="w-8 h-8 text-[#FF5F00]" /> Fixtures Service
        </h1>
        <p className="text-muted-foreground text-sm">Parts, part numbers, troubleshooting & repair for all major manufacturers</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2" data-testid="fixture-categories">
        {data.categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            className={activeCategory === cat.id ? "bg-[#003366] text-white font-bold uppercase" : "font-bold uppercase"}
            onClick={() => { setActiveCategory(cat.id); setSearchTerm(""); }}
            data-testid={`cat-${cat.id}`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search parts, models, or part numbers..."
          className="pl-10 h-10"
          data-testid="fixture-search"
        />
      </div>

      {/* Manufacturer Cards */}
      {activeData && (
        <div className="space-y-3">
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
            {activeData.name} — {filteredMfrs.length} Manufacturer{filteredMfrs.length !== 1 ? "s" : ""}
          </h2>
          {filteredMfrs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No results found. Try a different search term.</p>
              </CardContent>
            </Card>
          ) : (
            filteredMfrs.map((mfr) => <MfrCard key={mfr.id} mfr={mfr} />)
          )}
        </div>
      )}
    </div>
  );
}
