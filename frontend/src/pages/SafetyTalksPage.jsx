import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, RefreshCw, History, ChevronDown, ChevronUp } from "lucide-react";

export default function SafetyTalksPage() {
  const { token } = useAuth();
  const [todaysTalk, setTodaysTalk] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedTalk, setExpandedTalk] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        axios.get(`${API}/safety-talks/today`, { headers }),
        axios.get(`${API}/safety-talks/history`, { headers }),
      ]);
      setTodaysTalk(todayRes.data);
      setHistory(historyRes.data.filter(t => t.date !== todayRes.data.date));
    } catch (error) {
      toast.error("Failed to load safety talks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="safety-talks-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Job Safety Talks</h1>
          <p className="text-muted-foreground text-sm">AI-generated daily safety briefings for your crew</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchData}
          className="font-bold"
          data-testid="refresh-safety-talk"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Today's Talk - Featured */}
      {todaysTalk && (
        <Card className="border-2 border-[#FF5F00] bg-gradient-to-br from-[#003366] to-slate-900 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF5F00] rounded-sm flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#FF5F00] font-bold">Today&apos;s Safety Talk</p>
                <CardTitle className="font-heading text-2xl">{todaysTalk.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
              <Calendar className="w-4 h-4" />
              <span>{new Date(todaysTalk.date).toLocaleDateString("en-US", { 
                weekday: "long", year: "numeric", month: "long", day: "numeric" 
              })}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                {todaysTalk.content}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                Topic: <span className="text-[#FF5F00] font-bold">{todaysTalk.topic}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Section */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-between font-heading text-xl uppercase mb-4"
          onClick={() => setShowHistory(!showHistory)}
          data-testid="toggle-history"
        >
          <span className="flex items-center gap-2">
            <History className="w-5 h-5" /> Previous Safety Talks
          </span>
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>

        {showHistory && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No previous safety talks available</p>
                </CardContent>
              </Card>
            ) : (
              history.map((talk) => (
                <Card 
                  key={talk.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setExpandedTalk(expandedTalk === talk.id ? null : talk.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-heading text-lg">{talk.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(talk.date).toLocaleDateString()}
                        </p>
                      </div>
                      {expandedTalk === talk.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedTalk === talk.id && (
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {talk.content}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        Topic: <span className="font-bold">{talk.topic}</span>
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
