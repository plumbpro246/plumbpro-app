import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, refreshUser } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;
  const pollInterval = 2000;

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        const response = await axios.get(
          `${API}/subscriptions/status/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.payment_status === "paid") {
          setStatus("success");
          await refreshUser();
          toast.success("Subscription activated!");
          return;
        }

        if (response.data.status === "expired") {
          setStatus("error");
          toast.error("Payment session expired");
          return;
        }

        // Continue polling
        if (attempts < maxAttempts) {
          setAttempts(prev => prev + 1);
          setTimeout(pollPaymentStatus, pollInterval);
        } else {
          setStatus("error");
          toast.error("Payment verification timed out");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (attempts < maxAttempts) {
          setAttempts(prev => prev + 1);
          setTimeout(pollPaymentStatus, pollInterval);
        } else {
          setStatus("error");
        }
      }
    };

    pollPaymentStatus();
  }, [sessionId, token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="subscription-success-page">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h2 className="font-heading text-2xl font-bold uppercase mb-2">Processing Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your subscription...
              </p>
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(attempts / maxAttempts) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold uppercase mb-2">Welcome Aboard!</h2>
              <p className="text-muted-foreground mb-6">
                Your subscription is now active. Enjoy all your new features!
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                data-testid="go-to-dashboard"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold uppercase mb-2">Something Went Wrong</h2>
              <p className="text-muted-foreground mb-6">
                We couldn&apos;t verify your payment. Please try again or contact support.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/subscription")}
                  className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
                  data-testid="try-again"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="w-full h-12 font-bold uppercase"
                  data-testid="back-to-dashboard"
                >
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
