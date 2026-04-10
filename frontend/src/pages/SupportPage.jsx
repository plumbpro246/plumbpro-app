import { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, Send, CheckCircle, Mail, MessageSquare } from "lucide-react";

const CATEGORIES = [
  { value: "billing", label: "Billing & Subscription" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "account", label: "Account Issue" },
  { value: "general", label: "General Question" },
];

export default function SupportPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    category: "",
    subject: "",
    message: "",
  });

  const headers = { Authorization: `Bearer ${token}` };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/support/ticket`, form, { headers });
      setSubmitted(true);
      toast.success("Support request sent!");
    } catch {
      toast.error("Failed to send. Please email plumbpro246@gmail.com directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6" data-testid="support-page">
        <Card className="max-w-xl mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase">Request Received</h2>
            <p className="text-muted-foreground">
              We've received your support request and will get back to you at <strong>{user?.email}</strong> as soon as possible.
            </p>
            <p className="text-sm text-muted-foreground">
              Typical response time: within 24 hours
            </p>
            <Button
              onClick={() => { setSubmitted(false); setForm({ category: "", subject: "", message: "" }); }}
              variant="outline"
              data-testid="new-ticket-btn"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="support-page">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-8 h-8 text-[#FF5F00]" />
          Support
        </h1>
        <p className="text-muted-foreground text-sm">
          Have a question or issue? We're here to help.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Submit a Request
            </CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="support-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  data-testid="support-subject"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Describe your issue or question in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  data-testid="support-message"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
                data-testid="support-submit"
              >
                {loading ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Request</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-heading uppercase text-sm">Email Us Directly</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:plumbpro246@gmail.com"
                className="flex items-center gap-2 text-[#FF5F00] hover:underline font-medium"
                data-testid="support-email-link"
              >
                <Mail className="w-4 h-4" />
                plumbpro246@gmail.com
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Response within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-heading uppercase text-sm">Common Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-bold">How do I upgrade my plan?</p>
                <p className="text-muted-foreground">Go to the Subscription page from the sidebar and select your preferred plan.</p>
              </div>
              <div>
                <p className="font-bold">How do I cancel?</p>
                <p className="text-muted-foreground">Email us at plumbpro246@gmail.com and we'll process your cancellation immediately.</p>
              </div>
              <div>
                <p className="font-bold">Can I get a refund?</p>
                <p className="text-muted-foreground">Contact us within 7 days of payment if you experience technical issues.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
