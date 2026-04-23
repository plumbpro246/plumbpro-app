import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, Calculator, Shield, Clock, Package, 
  DollarSign, Calendar, AlertTriangle, FileSpreadsheet,
  Cpu, Map, Crown, ChevronRight, BookOpen, Mic, Cloud, Store
} from "lucide-react";

const quickLinks = [
  { path: "/notes", label: "Notes", icon: FileText, color: "bg-blue-500" },
  { path: "/formulas", label: "Formulas", icon: Calculator, color: "bg-green-500" },
  { path: "/safety-talks", label: "Safety Talk", icon: Shield, color: "bg-[#FF5F00]" },
  { path: "/timesheet", label: "Timesheet", icon: Clock, color: "bg-purple-500" },
  { path: "/materials", label: "Materials", icon: Package, color: "bg-teal-500" },
  { path: "/bidding", label: "Job Bids", icon: DollarSign, color: "bg-amber-500" },
  { path: "/calendar", label: "Calendar", icon: Calendar, color: "bg-indigo-500" },
  { path: "/osha", label: "OSHA", icon: AlertTriangle, color: "bg-red-500" },
  { path: "/sds", label: "Safety Data", icon: FileSpreadsheet, color: "bg-pink-500" },
  { path: "/calculator", label: "Calculator", icon: Cpu, color: "bg-cyan-500" },
  { path: "/total-station", label: "Total Station", icon: Map, color: "bg-emerald-500" },
  { path: "/blueprints", label: "Blueprints", icon: FileText, color: "bg-slate-500" },
  { path: "/plumbing-code", label: "Plumbing Code", icon: BookOpen, color: "bg-sky-600" },
  { path: "/voice-notes", label: "Voice Notes", icon: Mic, color: "bg-rose-500" },
  { path: "/weather", label: "Weather", icon: Cloud, color: "bg-sky-400" },
  { path: "/suppliers", label: "Suppliers", icon: Store, color: "bg-orange-600" },
];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    notes: 0,
    timesheets: 0,
    bids: 0,
    materials: 0
  });
  const [todaySafetyTalk, setTodaySafetyTalk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [notesRes, timesheetsRes, bidsRes, materialsRes, safetyRes] = await Promise.all([
          axios.get(`${API}/notes`, { headers }),
          axios.get(`${API}/timesheets`, { headers }),
          axios.get(`${API}/bids`, { headers }),
          axios.get(`${API}/materials`, { headers }),
          axios.get(`${API}/safety-talks/today`, { headers }),
        ]);

        setStats({
          notes: notesRes.data.length,
          timesheets: timesheetsRes.data.length,
          bids: bidsRes.data.length,
          materials: materialsRes.data.length
        });
        setTodaySafetyTalk(safetyRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase">
            {getGreeting()}, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", year: "numeric", month: "long", day: "numeric" 
            })}
          </p>
        </div>
        <Link 
          to="/subscription" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5F00] text-white rounded-sm font-bold uppercase text-sm hover:bg-[#FF5F00]/90 transition-colors"
          data-testid="upgrade-btn"
        >
          <Crown className="w-4 h-4" />
          {user?.subscription_tier === "free" ? "Upgrade Plan" : user?.subscription_tier}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border rounded-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Notes</p>
                <p className="text-2xl font-bold text-foreground">{stats.notes}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Timesheets</p>
                <p className="text-2xl font-bold text-foreground">{stats.timesheets}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Job Bids</p>
                <p className="text-2xl font-bold text-foreground">{stats.bids}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Materials</p>
                <p className="text-2xl font-bold text-foreground">{stats.materials}</p>
              </div>
              <Package className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Safety Talk */}
      {todaySafetyTalk && (
        <Card className="bg-[#003366] text-white border-0 rounded-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF5F00]" strokeWidth={2.5} />
              <CardTitle className="font-heading text-lg uppercase tracking-wide">
                Today&apos;s Safety Talk
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-bold text-xl mb-2">{todaySafetyTalk.title}</h3>
            <p className="text-slate-300 line-clamp-3 text-sm">
              {todaySafetyTalk.content.substring(0, 200)}...
            </p>
            <Link 
              to="/safety-talks" 
              className="inline-flex items-center gap-1 mt-3 text-[#FF5F00] font-bold text-sm hover:underline"
              data-testid="view-safety-talk-btn"
            >
              Read Full Talk <ChevronRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Links Grid */}
      <div>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-sm hover:border-[#FF5F00] transition-colors group"
                data-testid={`quick-link-${link.path.slice(1)}`}
              >
                <div className={`w-10 h-10 ${link.color} rounded-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
