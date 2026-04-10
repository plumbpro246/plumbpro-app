import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building, Gift, Clock, AlertCircle, Smartphone } from "lucide-react";
import { isCapacitorAndroid, startGooglePlayPurchase, acknowledgeGooglePlayPurchase } from "@/services/googlePlayBillingService";

const tiers = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    description: "Get started with the basics",
    features: [
      "Calculator & Formulas",
      "Safety Talks",
      "Calendar & Scheduling",
      "Plumbing Code Reference"
    ],
    notIncluded: [
      "Notes & Job Tracking",
      "Timesheet Tracking",
      "Material Lists",
      "Job Bidding Tools",
      "OSHA & Safety Data Sheets",
      "Blueprints"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    price: 4.99,
    googlePlayId: "com.plumbpro.fieldcompanion.basic_monthly",
    icon: Crown,
    description: "Essential tools for solo plumbers",
    features: [
      "Everything in Free",
      "Notes & Job Tracking",
      "OSHA Reference",
      "Safety Data Sheets",
      "5 Blueprint Uploads"
    ],
    notIncluded: [
      "AI Safety Talks",
      "Timesheet Tracking",
      "Job Bidding Tools",
      "Material Lists"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    googlePlayId: "com.plumbpro.fieldcompanion.pro_monthly",
    icon: Crown,
    popular: true,
    description: "Full toolkit for professional plumbers",
    features: [
      "Everything in Basic",
      "AI-Generated Safety Talks",
      "Timesheet Tracking",
      "Material Lists",
      "GPS Time Tracking",
      "PDF Exports"
    ],
    notIncluded: [
      "Job Bidding Tools",
      "Team Features"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 19.99,
    googlePlayId: "com.plumbpro.fieldcompanion.enterprise_monthly",
    icon: Building,
    description: "Complete solution for plumbing businesses",
    features: [
      "Everything in Pro",
      "Job Bidding & Estimates",
      "Unlimited Blueprints",
      "Email Bid Sharing",
      "Priority Support",
      "Custom Branding (Coming Soon)",
      "Team Management (Coming Soon)"
    ],
    notIncluded: []
  }
];

export default function SubscriptionPage() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const response = await axios.get(`${API}/subscriptions/trial-status`, { headers });
        setTrialStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch trial status");
      }
    };
    fetchTrialStatus();
  }, []);

  const handleSubscribe = async (tier) => {
    setLoading(tier.id);
    try {
      // On Android, use Google Play Billing
      if (isCapacitorAndroid() && tier.googlePlayId) {
        try {
          const purchase = await startGooglePlayPurchase(tier.googlePlayId);
          
          // Verify purchase with backend
          await axios.post(
            `${API}/subscriptions/google-play/verify`,
            {
              purchase_token: purchase.purchaseToken,
              product_id: purchase.productId,
              order_id: purchase.orderId,
            },
            { headers }
          );
          
          // Acknowledge the purchase
          await acknowledgeGooglePlayPurchase(purchase.purchaseToken);
          
          toast.success(`Subscribed to ${tier.name} via Google Play!`);
          await refreshUser();
          setLoading(null);
          return;
        } catch (err) {
          if (err.message?.includes("canceled")) {
            toast.info("Purchase cancelled");
            setLoading(null);
            return;
          }
          toast.error("Google Play purchase failed. Trying web checkout...");
          // Fall through to Stripe
        }
      }
      
      // Web / fallback: use Stripe Checkout
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/subscriptions/checkout`,
        { tier: tier.id, origin_url: originUrl },
        { headers }
      );
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to start checkout");
      setLoading(null);
    }
  };

  const currentTier = user?.subscription_tier || "free";
  const subscriptionStatus = user?.subscription_status || "inactive";
  const canStartTrial = trialStatus?.can_start_trial && !trialStatus?.trial_started;
  const isOnTrial = subscriptionStatus === "trial";
  const trialExpired = trialStatus?.trial_expired;

  return (
    <div className="space-y-6" data-testid="subscription-page">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground mt-2">
          Unlock all the tools you need to work smarter in the field
        </p>
      </div>

      {/* Trial Banner */}
      {canStartTrial && (
        <Card className="bg-gradient-to-r from-[#FF5F00] to-amber-500 text-white border-0">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Try Any Plan FREE — Cancel Anytime!</h3>
                <p className="text-white/90">Enter your card to start. You won't be charged until your trial ends.</p>
              </div>
            </div>
            <Badge className="bg-white text-[#FF5F00] font-bold text-sm px-4 py-2">
              LIMITED TIME OFFER
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Active Trial Banner */}
      {isOnTrial && trialStatus && (
        <Card className="bg-green-500 text-white border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-bold">You&apos;re on a free trial of {currentTier.toUpperCase()}</p>
                <p className="text-sm text-green-100">
                  {trialStatus.days_remaining} days, {trialStatus.hours_remaining} hours remaining
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="font-bold"
              onClick={() => handleSubscribe(tiers.find(t => t.id === currentTier))}
            >
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trial Expired Banner */}
      {trialExpired && subscriptionStatus !== "active" && (
        <Card className="bg-amber-500 text-white border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Your free trial has ended</p>
              <p className="text-sm text-amber-100">Subscribe now to continue using premium features</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Active Plan Banner */}
      {subscriptionStatus === "active" && currentTier !== "free" && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-500" />
            <p className="font-medium">
              You&apos;re subscribed to <span className="font-bold uppercase">{currentTier}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = currentTier === tier.id && (tier.id === "free" || subscriptionStatus === "active");
          const isTrialPlan = currentTier === tier.id && isOnTrial;
          const isFree = tier.id === "free";
          const isUpgrade = tiers.findIndex(t => t.id === tier.id) > tiers.findIndex(t => t.id === currentTier);
          
          return (
            <Card 
              key={tier.id}
              className={`relative ${tier.popular ? "border-2 border-[#FF5F00]" : ""}`}
              data-testid={`tier-${tier.id}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#FF5F00] text-white font-bold uppercase">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-sm flex items-center justify-center ${
                  isFree ? "bg-slate-500" : tier.popular ? "bg-[#FF5F00]" : "bg-[#003366]"
                }`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="font-heading text-2xl uppercase">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  {isFree ? (
                    <span className="text-4xl font-bold">$0</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Free tier: just show current plan or nothing */}
                {isFree && (
                  <Button
                    disabled={isCurrentPlan}
                    className={`w-full h-12 font-bold uppercase ${
                      isCurrentPlan
                        ? "bg-green-500 text-white cursor-default"
                        : "bg-slate-500 hover:bg-slate-600 text-white"
                    }`}
                    data-testid="select-free"
                  >
                    {isCurrentPlan ? (
                      <><Check className="w-4 h-4 mr-2" /> Current Plan</>
                    ) : (
                      "Free Forever"
                    )}
                  </Button>
                )}

                {/* Paid tiers: single button - goes through Stripe (card required for trial) */}
                {!isFree && (
                  <>
                    <Button
                      onClick={() => handleSubscribe(tier)}
                      disabled={isCurrentPlan || loading === tier.id}
                      className={`w-full h-12 font-bold uppercase ${
                        tier.popular 
                          ? "bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white" 
                          : isCurrentPlan
                            ? "bg-green-500 text-white cursor-default"
                            : "bg-[#003366] hover:bg-[#003366]/90 text-white"
                      }`}
                      data-testid={`subscribe-${tier.id}`}
                    >
                      {loading === tier.id ? (
                        "Processing..."
                      ) : isCurrentPlan ? (
                        <><Check className="w-4 h-4 mr-2" /> Current Plan</>
                      ) : isTrialPlan ? (
                        "Subscribe to Continue"
                      ) : canStartTrial ? (
                        <><Gift className="w-4 h-4 mr-2" /> Start Free Trial</>
                      ) : isUpgrade ? (
                        "Upgrade Now"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                    {canStartTrial && !isCurrentPlan && (
                      <p className="text-xs text-center text-muted-foreground" data-testid={`trial-note-${tier.id}`}>
                        Credit card required. You won't be charged until your trial ends. Cancel anytime.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-bold">How does the free trial work?</h4>
            <p className="text-sm text-muted-foreground">
              Choose your plan and enter your credit card to start your free trial. You won't be charged during the trial period. 
              Early bird users get 90 days free, otherwise you get 7 days. Cancel anytime before the trial ends and you won't be charged.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.
            </p>
          </div>
          <div>
            <h4 className="font-bold">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              On the web, we accept all major credit cards through Stripe. On Android, subscriptions are handled through Google Play Billing with your linked Google payment method.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Can I upgrade or downgrade my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Upgrades take effect immediately, and you&apos;ll be credited for the unused portion of your current plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
