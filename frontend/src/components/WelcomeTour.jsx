import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, MousePointer2, Settings as SettingsIcon, X, ChevronRight, Sparkles } from "lucide-react";

const STORAGE_KEY = "welcome-tour-completed";

const steps = [
  {
    icon: Shield,
    title: "Welcome to PlumbPro!",
    body: "Every morning we generate a fresh OSHA-aligned safety talk. Find it right on your dashboard — perfect for crew toolbox meetings.",
    cta: "Got it"
  },
  {
    icon: MousePointer2,
    title: "Tap any tool to get started",
    body: "Quick Access tiles give you one-tap entry to Notes, Job Bids, Calculators, Plumbing Code, and more. Tap any tile to dive in.",
    cta: "Show me"
  },
  {
    icon: SettingsIcon,
    title: "Make it yours",
    body: "Don't use Total Station or Voice Notes? Hide them. Customize your menu anytime in Settings → Customize Menu.",
    cta: "Let's go!"
  }
];

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") {
      // Tiny delay so dashboard renders first
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      finish();
    }
  };

  if (!open) return null;

  const step = steps[stepIdx];
  const Icon = step.icon;
  const isLast = stepIdx === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300"
      data-testid="welcome-tour-overlay"
    >
      <div
        className="bg-card border-2 border-[#FF5F00] rounded-sm w-full max-w-md shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        data-testid="welcome-tour-card"
      >
        {/* Header with progress dots + skip */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx
                    ? "w-6 bg-[#FF5F00]"
                    : i < stepIdx
                    ? "w-1.5 bg-[#FF5F00]/50"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2 font-medium">
              {stepIdx + 1} of {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={finish}
            className="p-1 rounded-sm hover:bg-muted transition-colors"
            aria-label="Skip tour"
            data-testid="welcome-tour-skip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-gradient-to-br from-[#FF5F00] to-[#FF8533]">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2
              className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center justify-center gap-2"
              data-testid="welcome-tour-title"
            >
              {stepIdx === 0 && <Sparkles className="w-5 h-5 text-[#FF5F00]" />}
              {step.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.body}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between gap-3 bg-muted/30">
          <button
            type="button"
            onClick={finish}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            data-testid="welcome-tour-skip-text"
          >
            Skip tour
          </button>
          {isLast ? (
            <Button
              type="button"
              onClick={finish}
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="welcome-tour-finish-btn"
            >
              {step.cta} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={next}
              className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
              data-testid="welcome-tour-next-btn"
            >
              {step.cta} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
