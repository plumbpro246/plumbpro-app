import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Import pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import FormulasPage from "@/pages/FormulasPage";
import SafetyTalksPage from "@/pages/SafetyTalksPage";
import TimesheetPage from "@/pages/TimesheetPage";
import MaterialsPage from "@/pages/MaterialsPage";
import BiddingPage from "@/pages/BiddingPage";
import CalendarPage from "@/pages/CalendarPage";
import OSHAPage from "@/pages/OSHAPage";
import SDSPage from "@/pages/SDSPage";
import CalculatorPage from "@/pages/CalculatorPage";
import TotalStationPage from "@/pages/TotalStationPage";
import BlueprintsPage from "@/pages/BlueprintsPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import SettingsPage from "@/pages/SettingsPage";
import SupportPage from "@/pages/SupportPage";
import TeamPage from "@/pages/TeamPage";
import PlumbingCodePage from "@/pages/PlumbingCodePage";
import VoiceNotesPage from "@/pages/VoiceNotesPage";
import WeatherPage from "@/pages/WeatherPage";
import SupplierPage from "@/pages/SupplierPage";
import OffsetCalculatorPage from "@/pages/OffsetCalculatorPage";
import FittingTakeoffsPage from "@/pages/FittingTakeoffsPage";
import LandingPage from "@/pages/LandingPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          setUser(response.data);
          setToken(savedToken);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, full_name, company) => {
    const response = await axios.post(`${API}/auth/register`, { 
      email, password, full_name, company 
    });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (e) {
        console.error("Failed to refresh user", e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Tier-Gated Route - redirects free users to subscription page for paid features
const TierGatedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  const tier = user?.subscription_tier || "free";
  const status = user?.subscription_status || "inactive";
  const hasPaid = tier !== "free" && (status === "active" || status === "trial");
  
  if (!hasPaid && !FREE_TIER_PATHS.includes(location.pathname)) {
    return <Navigate to="/subscription" replace />;
  }
  
  return children;
};

// Main Layout with Navigation
import { 
  Home, FileText, Calculator, Shield, Clock, Package, 
  DollarSign, Calendar, AlertTriangle, FileSpreadsheet, 
  Cpu, Map, LogOut, Menu, X, User, Crown, Settings, BookOpen, Lock, LifeBuoy, Users,
  Mic, Cloud, Store, Ruler, Table2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Free tier gets: Dashboard, Formulas, Safety Talks, Calendar, Calculator, Settings, Subscription, Plumbing Code, Support
const FREE_TIER_PATHS = ["/dashboard", "/formulas", "/safety-talks", "/calendar", "/calculator", "/offset-calc", "/fitting-takeoffs", "/settings", "/subscription", "/subscription/success", "/plumbing-code", "/support", "/weather", "/suppliers"];

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home, free: true },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/formulas", label: "Formulas", icon: Calculator, free: true },
  { path: "/safety-talks", label: "Safety Talks", icon: Shield, free: true },
  { path: "/timesheet", label: "Timesheet", icon: Clock },
  { path: "/materials", label: "Materials", icon: Package },
  { path: "/bidding", label: "Job Bidding", icon: DollarSign },
  { path: "/calendar", label: "Calendar", icon: Calendar, free: true },
  { path: "/osha", label: "OSHA", icon: AlertTriangle },
  { path: "/sds", label: "Safety Data", icon: FileSpreadsheet },
  { path: "/calculator", label: "Calculator", icon: Cpu, free: true },
  { path: "/offset-calc", label: "Offset Calc", icon: Ruler, free: true },
  { path: "/fitting-takeoffs", label: "Fitting Data", icon: Table2, free: true },
  { path: "/total-station", label: "Total Station", icon: Map },
  { path: "/blueprints", label: "Blueprints", icon: FileText },
  { path: "/plumbing-code", label: "Plumbing Code", icon: BookOpen, free: true },
  { path: "/voice-notes", label: "Voice Notes", icon: Mic },
  { path: "/weather", label: "Weather", icon: Cloud, free: true },
  { path: "/suppliers", label: "Suppliers", icon: Store, free: true },
  { path: "/team", label: "Team", icon: Users },
  { path: "/support", label: "Support", icon: LifeBuoy, free: true },
  { path: "/settings", label: "Settings", icon: Settings, free: true },
];

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const NavLink = ({ item, mobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const tier = user?.subscription_tier || "free";
    const status = user?.subscription_status || "inactive";
    const hasPaid = tier !== "free" && (status === "active" || status === "trial");
    const isLocked = !item.free && !hasPaid;
    
    if (isLocked) {
      return (
        <Link
          to="/subscription"
          onClick={() => { mobile && setMobileOpen(false); toast.info("Upgrade your plan to access this feature"); }}
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-slate-500 hover:bg-slate-800/50 transition-all"
          data-testid={`nav-${item.path.slice(1)}`}
        >
          <Icon className="w-5 h-5 opacity-40" strokeWidth={2.5} />
          <span className="font-medium opacity-60">{item.label}</span>
          <Lock className="w-3.5 h-3.5 ml-auto opacity-40" />
        </Link>
      );
    }
    
    return (
      <Link
        to={item.path}
        onClick={() => mobile && setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
          isActive 
            ? "bg-[#FF5F00] text-white" 
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        data-testid={`nav-${item.path.slice(1)}`}
      >
        <Icon className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-slate-800">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
            PLUMB<span className="text-[#FF5F00]">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Field Companion</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          <Link 
            to="/subscription" 
            className="flex items-center gap-2 px-4 py-2 mb-2 rounded-sm bg-[#FF5F00] text-white hover:bg-[#FF5F00]/90"
            data-testid="nav-subscription"
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">{user?.subscription_tier || "Free"}</span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-slate-400 truncate">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{user?.full_name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 flex-shrink-0"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#003366] text-white flex items-center justify-between px-4 z-50">
        <h1 className="font-heading text-xl font-bold">
          PLUMB<span className="text-[#FF5F00]">PRO</span>
        </h1>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white" data-testid="mobile-menu-btn">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-900 text-white p-0 border-slate-800">
            <div className="p-4 border-b border-slate-800">
              <h1 className="font-heading text-2xl font-bold">
                PLUMB<span className="text-[#FF5F00]">PRO</span>
              </h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} mobile />
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <Link 
                to="/subscription" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 mb-2 rounded-sm bg-[#FF5F00] text-white"
              >
                <Crown className="w-4 h-4" />
                <span className="text-sm font-bold uppercase">{user?.subscription_tier || "Free"}</span>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-white"
                onClick={() => { handleLogout(); setMobileOpen(false); }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
};

// Smart Home Route - Landing for guests, Dashboard for logged-in users
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><TierGatedRoute><MainLayout><NotesPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/formulas" element={<ProtectedRoute><MainLayout><FormulasPage /></MainLayout></ProtectedRoute>} />
          <Route path="/safety-talks" element={<ProtectedRoute><MainLayout><SafetyTalksPage /></MainLayout></ProtectedRoute>} />
          <Route path="/timesheet" element={<ProtectedRoute><TierGatedRoute><MainLayout><TimesheetPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><TierGatedRoute><MainLayout><MaterialsPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/bidding" element={<ProtectedRoute><TierGatedRoute><MainLayout><BiddingPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><MainLayout><CalendarPage /></MainLayout></ProtectedRoute>} />
          <Route path="/osha" element={<ProtectedRoute><TierGatedRoute><MainLayout><OSHAPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/sds" element={<ProtectedRoute><TierGatedRoute><MainLayout><SDSPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><MainLayout><CalculatorPage /></MainLayout></ProtectedRoute>} />
          <Route path="/offset-calc" element={<ProtectedRoute><MainLayout><OffsetCalculatorPage /></MainLayout></ProtectedRoute>} />
          <Route path="/fitting-takeoffs" element={<ProtectedRoute><MainLayout><FittingTakeoffsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/total-station" element={<ProtectedRoute><TierGatedRoute><MainLayout><TotalStationPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/blueprints" element={<ProtectedRoute><TierGatedRoute><MainLayout><BlueprintsPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/plumbing-code" element={<ProtectedRoute><MainLayout><PlumbingCodePage /></MainLayout></ProtectedRoute>} />
          <Route path="/voice-notes" element={<ProtectedRoute><TierGatedRoute><MainLayout><VoiceNotesPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><MainLayout><WeatherPage /></MainLayout></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><MainLayout><SupplierPage /></MainLayout></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TierGatedRoute><MainLayout><TeamPage /></MainLayout></TierGatedRoute></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><MainLayout><SupportPage /></MainLayout></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><MainLayout><SubscriptionPage /></MainLayout></ProtectedRoute>} />
          <Route path="/subscription/success" element={<ProtectedRoute><MainLayout><SubscriptionSuccessPage /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
