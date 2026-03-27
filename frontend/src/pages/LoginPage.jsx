import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Shield, Clock, Calculator } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", password: "", full_name: "", company: "" 
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(
        registerData.email, 
        registerData.password, 
        registerData.full_name, 
        registerData.company
      );
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?crop=entropy&cs=srgb&fm=jpg&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            PLUMB<span className="text-[#FF5F00]">PRO</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mt-2 font-medium">
            Field Companion for Professional Plumbers
          </p>
        </div>
      </div>

      {/* Features Row */}
      <div className="bg-[#003366] py-4">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-4 gap-4 text-center">
          <div className="text-white">
            <Wrench className="w-6 h-6 mx-auto mb-1" strokeWidth={2.5} />
            <span className="text-xs font-medium">Tools</span>
          </div>
          <div className="text-white">
            <Shield className="w-6 h-6 mx-auto mb-1" strokeWidth={2.5} />
            <span className="text-xs font-medium">Safety</span>
          </div>
          <div className="text-white">
            <Clock className="w-6 h-6 mx-auto mb-1" strokeWidth={2.5} />
            <span className="text-xs font-medium">Tracking</span>
          </div>
          <div className="text-white">
            <Calculator className="w-6 h-6 mx-auto mb-1" strokeWidth={2.5} />
            <span className="text-xs font-medium">Calculate</span>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl text-white">GET STARTED</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in or create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="login-email" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                      data-testid="login-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                      data-testid="login-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase tracking-wide"
                    disabled={loading}
                    data-testid="login-submit"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="register-name" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Smith"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                      data-testid="register-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@company.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                      data-testid="register-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-company" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Company (Optional)
                    </Label>
                    <Input
                      id="register-company"
                      type="text"
                      placeholder="Your Plumbing Co."
                      value={registerData.company}
                      onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      data-testid="register-company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password" className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                      data-testid="register-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase tracking-wide"
                    disabled={loading}
                    data-testid="register-submit"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
