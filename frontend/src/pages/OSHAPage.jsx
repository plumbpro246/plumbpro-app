import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Search, FileText, ExternalLink } from "lucide-react";

export default function OSHAPage() {
  const { token } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await axios.get(`${API}/osha`, { headers });
        setRequirements(response.data);
      } catch (error) {
        toast.error("Failed to load OSHA requirements");
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  const filteredRequirements = requirements.filter(req =>
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requirements.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoryColors = {
    "Personal Protective Equipment": "bg-blue-500",
    "Confined Spaces": "bg-amber-500",
    "Excavation": "bg-orange-500",
    "Fall Protection": "bg-red-500",
    "Hazard Communication": "bg-purple-500",
    "Electrical Safety": "bg-yellow-500",
    "Scaffolding": "bg-green-500",
    "Energy Control": "bg-pink-500"
  };

  return (
    <div className="space-y-6" data-testid="osha-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-[#FF5F00]" />
            OSHA Requirements
          </h1>
          <p className="text-muted-foreground text-sm">Construction safety standards reference</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-500 border-2">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700 dark:text-amber-400">Important Disclaimer</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              This is a quick reference guide only. Always refer to official OSHA documentation for complete 
              requirements. Regulations may change. Visit{" "}
              <a 
                href="https://www.osha.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-bold"
              >
                osha.gov
              </a>{" "}for current standards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search OSHA requirements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
          data-testid="osha-search"
        />
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filteredRequirements.map((req) => (
            <AccordionItem 
              key={req.id} 
              value={req.id}
              className="border border-border rounded-sm overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 text-left">
                  <Badge className={`${categoryColors[req.category] || "bg-slate-500"} text-white text-xs`}>
                    {req.category}
                  </Badge>
                  <div>
                    <h3 className="font-bold">{req.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{req.standard}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold uppercase text-sm text-muted-foreground mb-2">Key Requirements</h4>
                    <ul className="space-y-2">
                      {req.requirements.map((requirement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-[#003366] text-white rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-3">
                    <p className="text-sm">
                      <span className="font-bold text-red-600 dark:text-red-400">Penalties: </span>
                      <span className="text-red-600 dark:text-red-400">{req.penalties}</span>
                    </p>
                  </div>

                  <a
                    href={`https://www.osha.gov/laws-regs/regulations/standardnumber/${req.standard.replace("29 CFR ", "").split(".")[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-bold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Official OSHA Standard
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Quick Reference Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#003366] text-white">
          <CardHeader>
            <CardTitle className="font-heading uppercase">Emergency Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>OSHA Hotline:</span>
              <span className="font-bold">1-800-321-OSHA (6742)</span>
            </div>
            <div className="flex justify-between">
              <span>Poison Control:</span>
              <span className="font-bold">1-800-222-1222</span>
            </div>
            <div className="flex justify-between">
              <span>Emergency:</span>
              <span className="font-bold">911</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading uppercase">Reporting Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-bold">Fatalities:</span> Report within 8 hours</p>
            <p><span className="font-bold">Hospitalizations:</span> Report within 24 hours</p>
            <p><span className="font-bold">Amputations:</span> Report within 24 hours</p>
            <p><span className="font-bold">Loss of Eye:</span> Report within 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
