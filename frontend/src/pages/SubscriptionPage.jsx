import { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building } from "lucide-react";

const tiers = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    icon: Zap,
    description: "Essential tools for solo plumbers",
    features: [
      "Notes & Job Tracking",
      "Calculator & Formulas",
      "OSHA Reference",
      "Safety Data Sheets",
      "5 Blueprint Uploads"
    ],
    notIncluded: [
      "AI Safety Talks",
      "Timesheet Tracking",
      "Job Bidding Tools",
      "Calendar & Scheduling",
      "Material Lists"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    icon: Crown,
    popular: true,
    description: "Full toolkit for professional plumbers",
    features: [
      "Everything in Basic",
      "AI-Generated Safety Talks",
      "Timesheet Tracking",
      "Material Lists",
      "Calendar & Scheduling",
      "25 Blueprint Uploads",
      "Job History Export"
    ],
    notIncluded: [
      "Job Bidding Tools",
      "Team Features"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 29.99,
    icon: Building,
    description: "Complete solution for plumbing businesses",
    features: [
      "Everything in Pro",
      "Job Bidding & Estimates",
      "Unlimited Blueprints",
      "Priority Support",
      "Custom Branding (Coming Soon)",
      "Team Management (Coming Soon)"
    ],
    notIncluded: []
  }
];

export default function SubscriptionPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (tier) => {
    setLoading(tier.id);
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/subscriptions/checkout`,
        { tier: tier.id, origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to start checkout");
      setLoading(null);
    }
  };

  const currentTier = user?.subscription_tier || "free";

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

      {/* Current Plan Banner */}
      {currentTier !== "free" && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-500" />
            <p className="font-medium">
              You&apos;re currently on the <span className="font-bold uppercase">{currentTier}</span> plan
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = currentTier === tier.id;
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
                  tier.popular ? "bg-[#FF5F00]" : "bg-[#003366]"
                }`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="font-heading text-2xl uppercase">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
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
                    <>
                      <Check className="w-4 h-4 mr-2" /> Current Plan
                    </>
                  ) : isUpgrade ? (
                    "Upgrade Now"
                  ) : (
                    "Select Plan"
                  )}
                </Button>
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
            <h4 className="font-bold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.
            </p>
          </div>
          <div>
            <h4 className="font-bold">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards through our secure Stripe payment processor.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Can I upgrade or downgrade my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Upgrades take effect immediately, and you&apos;ll be credited for the unused portion of your current plan.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Is my data secure?</h4>
            <p className="text-sm text-muted-foreground">
              Absolutely. All data is encrypted and stored securely. We never share your information with third parties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
