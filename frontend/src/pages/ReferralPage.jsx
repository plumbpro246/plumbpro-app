import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Share2, Users, Check, Clock, Sparkles } from "lucide-react";

export default function ReferralPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchReferral = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/referrals/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch {
      toast.error("Failed to load referral info");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  const referralLink = data
    ? `${window.location.origin}/login?ref=${data.referral_code}`
    : "";

  const copyToClipboard = async (text, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try long-pressing to copy");
    }
  };

  const shareLink = async () => {
    const shareData = {
      title: "Join me on PlumbPro",
      text: `I'm using PlumbPro Field Companion — try it free with my code ${data.referral_code}. You'll get 30 days free when you subscribe!`,
      url: referralLink
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — silent
      }
    } else {
      copyToClipboard(referralLink, "Link copied — share it anywhere!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="referral-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Gift className="w-8 h-8 text-[#FF5F00]" />
          Refer a Plumber
        </h1>
        <p className="text-muted-foreground text-sm">
          Share PlumbPro with your crew — you both get a free month
        </p>
      </div>

      {/* Hero Reward Card */}
      <Card className="bg-gradient-to-br from-[#003366] to-[#004080] text-white border-[#FF5F00]/40 overflow-hidden">
        <CardContent className="p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-[#FF5F00]/20 mb-1">
            <Sparkles className="w-8 h-8 text-[#FF5F00]" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase">
            Get <span className="text-[#FF5F00]">30 Days Free</span>
          </h2>
          <p className="text-slate-300 max-w-md mx-auto">
            Share your code with another plumber. When they subscribe, you BOTH get
            an extra {data?.reward_days_per_referral ?? 30} days free — no limit on how many you refer.
          </p>
        </CardContent>
      </Card>

      {/* My Code */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Your Referral Code</CardTitle>
          <CardDescription>Share this code or link with anyone — there's no cap on earnings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Big code display */}
          <div className="bg-muted p-6 rounded-sm text-center border-2 border-dashed border-[#FF5F00]/40">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-2">
              Your Code
            </p>
            <p
              className="font-heading text-4xl sm:text-5xl font-bold tracking-[0.3em] text-[#FF5F00] select-all"
              data-testid="referral-code-display"
            >
              {data?.referral_code}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={() => copyToClipboard(data?.referral_code || "", "Code copied!")}
              variant="outline"
              className="h-12 font-bold uppercase"
              data-testid="copy-code-btn"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy Code"}
            </Button>
            <Button
              onClick={shareLink}
              className="h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
              data-testid="share-link-btn"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>

          {/* Link box */}
          <div>
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide mb-2">
              Your Referral Link
            </p>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="h-12 text-sm font-mono"
                onFocus={(e) => e.target.select()}
                data-testid="referral-link-input"
              />
              <Button
                onClick={() => copyToClipboard(referralLink, "Link copied!")}
                variant="outline"
                size="icon"
                className="h-12 w-12 flex-shrink-0"
                data-testid="copy-link-btn"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold" data-testid="stat-pending">
              {data?.pending_count ?? 0}
            </p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Signed Up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold" data-testid="stat-completed">
              {data?.completed_count ?? 0}
            </p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Subscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-[#FF5F00] mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#FF5F00]" data-testid="stat-credits">
              {data?.credits_days_earned ?? 0}
            </p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Days Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-sm bg-[#FF5F00] text-white font-bold flex items-center justify-center">1</span>
              <div>
                <p className="font-bold">Share your code or link</p>
                <p className="text-sm text-muted-foreground">Send to any plumber, post on social, text your crew.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-sm bg-[#FF5F00] text-white font-bold flex items-center justify-center">2</span>
              <div>
                <p className="font-bold">They sign up &amp; subscribe</p>
                <p className="text-sm text-muted-foreground">They enter your code at signup and pick any paid plan.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-sm bg-[#FF5F00] text-white font-bold flex items-center justify-center">3</span>
              <div>
                <p className="font-bold">You both get 30 days free</p>
                <p className="text-sm text-muted-foreground">Added instantly to your accounts. No limits, no expiry on referrals.</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Completed referrals list */}
      {data?.completed_referrals?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading uppercase text-lg">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.completed_referrals.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-sm"
                  data-testid={`referral-history-${i}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.referee_email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#FF5F00]">+{r.reward_days}d</p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
