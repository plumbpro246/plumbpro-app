import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Settings, AlertTriangle, Wrench, BookOpen } from "lucide-react";

export default function TotalStationPage() {
  const { token } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`${API}/total-station`, { headers: { Authorization: `Bearer ${token}` } });
        setInfo(response.data);
      } catch (error) {
        toast.error("Failed to load total station info");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="total-station-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Map className="w-8 h-8 text-[#FF5F00]" />
          Total Station Reference
        </h1>
        <p className="text-muted-foreground text-sm">Surveying equipment guide for plumbing installations</p>
      </div>

      {/* Hero Image */}
      <Card className="overflow-hidden">
        <div 
          className="h-48 md:h-64 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1591528287361-7211d86ddc27?crop=entropy&cs=srgb&fm=jpg&q=85')"
          }}
        />
      </Card>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="basics" className="flex flex-col gap-1 py-2" data-testid="tab-basics">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex flex-col gap-1 py-2" data-testid="tab-setup">
            <Settings className="w-4 h-4" />
            <span className="text-xs">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex flex-col gap-1 py-2" data-testid="tab-operations">
            <Map className="w-4 h-4" />
            <span className="text-xs">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex flex-col gap-1 py-2" data-testid="tab-troubleshooting">
            <Wrench className="w-4 h-4" />
            <span className="text-xs">Troubleshoot</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex flex-col gap-1 py-2" data-testid="tab-safety">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Safety</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <Card>
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">{info?.basics?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {info?.basics?.content?.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#FF5F00] text-white rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">{info?.setup?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="space-y-4">
                {info?.setup?.steps?.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-muted rounded-sm">
                    <span className="w-8 h-8 bg-[#003366] text-white rounded-sm flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-1">{step.replace(/^\d+\.\s*/, "")}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <Card>
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">{info?.common_operations?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {info?.common_operations?.operations?.map((op, i) => (
                  <div key={i} className="border border-border rounded-sm overflow-hidden">
                    <div className="bg-muted p-3 font-bold">{op.name}</div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm"><span className="font-bold">Purpose:</span> {op.description}</p>
                      <p className="text-sm"><span className="font-bold">Procedure:</span> {op.procedure}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="mt-6">
          <Card>
            <CardHeader className="bg-[#003366] text-white">
              <CardTitle className="font-heading uppercase">{info?.troubleshooting?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {info?.troubleshooting?.issues?.map((item, i) => (
                  <div key={i} className="border border-border rounded-sm p-4">
                    <p className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {item.issue}
                    </p>
                    <p className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-sm">
                      <span className="font-bold text-green-600 dark:text-green-400">Solution: </span>
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="mt-6">
          <Card className="border-2 border-amber-500">
            <CardHeader className="bg-amber-500 text-white">
              <CardTitle className="font-heading uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {info?.safety?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {info?.safety?.points?.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Quick Tips for Plumbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
              <h4 className="font-bold mb-2">Pipe Grade Calculation</h4>
              <p className="text-sm text-muted-foreground">
                Standard gravity drain slope: 1/4&quot; per foot (2%). 
                Use total station to verify consistent grade over long runs.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
              <h4 className="font-bold mb-2">Benchmark Protocol</h4>
              <p className="text-sm text-muted-foreground">
                Always verify your benchmark before starting work. 
                Re-check if instrument is moved or disturbed.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm">
              <h4 className="font-bold mb-2">Rod Reading Tips</h4>
              <p className="text-sm text-muted-foreground">
                Hold rod plumb using bubble level. 
                Take multiple readings and average for accuracy.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
              <h4 className="font-bold mb-2">Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Record station setup location, benchmark used, and all shots. 
                Essential for as-builts and inspections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
