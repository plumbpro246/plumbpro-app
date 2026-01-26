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

// Main Layout with Navigation
import { 
  Home, FileText, Calculator, Shield, Clock, Package, 
  DollarSign, Calendar, AlertTriangle, FileSpreadsheet, 
  Cpu, Map, LogOut, Menu, X, User, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/formulas", label: "Formulas", icon: Calculator },
  { path: "/safety-talks", label: "Safety Talks", icon: Shield },
  { path: "/timesheet", label: "Timesheet", icon: Clock },
  { path: "/materials", label: "Materials", icon: Package },
  { path: "/bidding", label: "Job Bidding", icon: DollarSign },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/osha", label: "OSHA", icon: AlertTriangle },
  { path: "/sds", label: "Safety Data", icon: FileSpreadsheet },
  { path: "/calculator", label: "Calculator", icon: Cpu },
  { path: "/total-station", label: "Total Station", icon: Map },
  { path: "/blueprints", label: "Blueprints", icon: FileText },
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

        <div className="p-4 border-t border-slate-800">
          <Link 
            to="/subscription" 
            className="flex items-center gap-2 px-4 py-2 mb-2 rounded-sm bg-[#FF5F00] text-white hover:bg-[#FF5F00]/90"
            data-testid="nav-subscription"
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">{user?.subscription_tier || "Free"}</span>
          </Link>
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-slate-400">
            <User className="w-4 h-4" />
            <span className="truncate">{user?.full_name}</span>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><MainLayout><NotesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/formulas" element={<ProtectedRoute><MainLayout><FormulasPage /></MainLayout></ProtectedRoute>} />
          <Route path="/safety-talks" element={<ProtectedRoute><MainLayout><SafetyTalksPage /></MainLayout></ProtectedRoute>} />
          <Route path="/timesheet" element={<ProtectedRoute><MainLayout><TimesheetPage /></MainLayout></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><MainLayout><MaterialsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/bidding" element={<ProtectedRoute><MainLayout><BiddingPage /></MainLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><MainLayout><CalendarPage /></MainLayout></ProtectedRoute>} />
          <Route path="/osha" element={<ProtectedRoute><MainLayout><OSHAPage /></MainLayout></ProtectedRoute>} />
          <Route path="/sds" element={<ProtectedRoute><MainLayout><SDSPage /></MainLayout></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><MainLayout><CalculatorPage /></MainLayout></ProtectedRoute>} />
          <Route path="/total-station" element={<ProtectedRoute><MainLayout><TotalStationPage /></MainLayout></ProtectedRoute>} />
          <Route path="/blueprints" element={<ProtectedRoute><MainLayout><BlueprintsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><MainLayout><SubscriptionPage /></MainLayout></ProtectedRoute>} />
          <Route path="/subscription/success" element={<ProtectedRoute><MainLayout><SubscriptionSuccessPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
