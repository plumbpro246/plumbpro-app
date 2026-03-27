import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSpreadsheet, Search, AlertTriangle, Shield, Droplets } from "lucide-react";

export default function SDSPage() {
  const { token } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const response = await axios.get(`${API}/sds`, { headers });
        setSheets(response.data);
      } catch (error) {
        toast.error("Failed to load safety data sheets");
      } finally {
        setLoading(false);
      }
    };
    fetchSheets();
  }, []);

  const filteredSheets = sheets.filter(sheet =>
    sheet.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.hazards.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const hazardColors = {
    "Flammable": "bg-red-500",
    "Corrosive": "bg-orange-500",
    "Eye Irritant": "bg-yellow-500",
    "Respiratory Irritant": "bg-blue-500",
    "Skin Irritant": "bg-pink-500",
    "Asphyxiant": "bg-purple-500",
    "Pressurized Container": "bg-gray-500",
    "Reactive with metals": "bg-amber-500",
    "Severe Burns": "bg-red-600",
    "Extremely Flammable": "bg-red-700",
    "Low hazard material": "bg-green-500"
  };

  return (
    <div className="space-y-6" data-testid="sds-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-8 h-8 text-[#FF5F00]" />
          Safety Data Sheets
        </h1>
        <p className="text-muted-foreground text-sm">Quick reference for common plumbing chemicals</p>
      </div>

      {/* Warning */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-500 border-2">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            These are abbreviated safety summaries. Always consult the manufacturer&apos;s complete SDS 
            before handling any chemical products.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products or hazards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
          data-testid="sds-search"
        />
      </div>

      {/* SDS Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSheets.map((sheet) => (
            <Card 
              key={sheet.id}
              className={`cursor-pointer transition-all ${
                selectedSheet?.id === sheet.id ? "border-[#FF5F00] border-2" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedSheet(selectedSheet?.id === sheet.id ? null : sheet)}
              data-testid={`sds-card-${sheet.id}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  {sheet.product_name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{sheet.manufacturer}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {sheet.hazards.map((hazard, i) => (
                    <Badge 
                      key={i} 
                      className={`${hazardColors[hazard] || "bg-slate-500"} text-white text-xs`}
                    >
                      {hazard}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>PPE: {sheet.ppe_required.length} items</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected SDS Detail */}
      {selectedSheet && (
        <Card className="border-2 border-[#003366]">
          <CardHeader className="bg-[#003366] text-white">
            <CardTitle className="font-heading uppercase">{selectedSheet.product_name}</CardTitle>
            <p className="text-slate-300">{selectedSheet.manufacturer}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Hazards */}
            <div>
              <h3 className="font-bold uppercase text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Hazards
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSheet.hazards.map((hazard, i) => (
                  <Badge 
                    key={i} 
                    className={`${hazardColors[hazard] || "bg-slate-500"} text-white`}
                  >
                    {hazard}
                  </Badge>
                ))}
              </div>
            </div>

            {/* PPE Required */}
            <div>
              <h3 className="font-bold uppercase text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Required PPE
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {selectedSheet.ppe_required.map((ppe, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {ppe}
                  </li>
                ))}
              </ul>
            </div>

            {/* First Aid */}
            <div>
              <h3 className="font-bold uppercase text-sm text-muted-foreground mb-2">First Aid Measures</h3>
              <div className="space-y-3">
                {Object.entries(selectedSheet.first_aid).map(([key, value]) => (
                  <div key={key} className="bg-muted p-3 rounded-sm">
                    <p className="font-bold text-sm capitalize mb-1">
                      {key.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage & Disposal */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm">
                <h4 className="font-bold text-sm mb-2">Storage</h4>
                <p className="text-sm">{selectedSheet.storage}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm">
                <h4 className="font-bold text-sm mb-2">Disposal</h4>
                <p className="text-sm">{selectedSheet.disposal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
