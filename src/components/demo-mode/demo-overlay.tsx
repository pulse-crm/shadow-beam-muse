import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useDemoMode } from "./demo-context";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card/card";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function DemoOverlay() {
  const { state, nextStep, prevStep, stop } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: "bottom" | "top" }>({ top: 0, left: 0, placement: "bottom" });
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigated = useRef(false);

  const findAndHighlight = useCallback(() => {
    if (!state.currentStep) return;
    const el = document.querySelector(`[data-tour="${state.currentStep.target}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Delay rect calculation to allow scroll to settle
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect(r);

      const tooltipWidth = 360;
      const tooltipHeight = 200;
      const gap = 12;

      let top: number;
      let placement: "bottom" | "top";
      if (r.bottom + tooltipHeight + gap < window.innerHeight) {
        top = r.bottom + gap;
        placement = "bottom";
      } else {
        top = r.top - tooltipHeight - gap;
        placement = "top";
      }

      let left = r.left + r.width / 2 - tooltipWidth / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

      setTooltipPos({ top, left, placement });
      setVisible(true);
    }, 300);
  }, [state.currentStep]);

  // Handle navigation and element finding
  useEffect(() => {
    if (!state.active || !state.currentStep) {
      setVisible(false);
      setRect(null);
      return;
    }

    setVisible(false);
    hasNavigated.current = false;

    const step = state.currentStep;

    // Navigate if needed
    if (step.navigateTo && location.pathname !== step.navigateTo) {
      navigate(step.navigateTo);
      hasNavigated.current = true;
    }

    // Try to find element with retries (for navigation/render delays)
    const tryFind = (attempts: number) => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        findAndHighlight();
        return;
      }
      if (attempts > 0) {
        retryRef.current = setTimeout(() => tryFind(attempts - 1), 200);
      }
    };

    // Start looking after a small delay to allow navigation
    const delay = hasNavigated.current ? 500 : 100;
    retryRef.current = setTimeout(() => tryFind(15), delay);

    // Also watch for DOM changes
    observerRef.current = new MutationObserver(() => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        findAndHighlight();
        observerRef.current?.disconnect();
      }
    });
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    return () => {
      observerRef.current?.disconnect();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [state.active, state.currentStep, state.stepIndex, navigate, location.pathname, findAndHighlight]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!state.active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      if (e.key === "ArrowRight") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.active, stop, nextStep, prevStep]);

  // Recalculate on resize
  useEffect(() => {
    if (!state.active) return;
    const handler = () => findAndHighlight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [state.active, findAndHighlight]);

  if (!state.active || !state.scenario || !state.currentStep) return null;

  const totalSteps = state.scenario.steps.length;
  const isFirst = state.stepIndex === 0;
  const isLast = state.stepIndex === totalSteps - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-label="Demo walkthrough">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={stop} />

      {/* Highlight cutout */}
      {rect && visible && (
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        >
          <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent" />
          <div className="absolute inset-0 rounded-lg animate-pulse ring-2 ring-primary/40" />
          {/* Allow clicks through to highlighted element */}
          <div
            className="absolute bg-transparent"
            style={{
              top: 6,
              left: 6,
              width: rect.width,
              height: rect.height,
              pointerEvents: "auto",
            }}
          />
        </div>
      )}

      {/* Tooltip */}
      {visible && (
        <Card
          className={cn(
            "absolute w-[360px] shadow-2xl border-primary/20 z-[10000] transition-all duration-300 ease-out",
            !visible && "opacity-0 translate-y-2"
          )}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          <CardContent className="p-4 pt-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {state.scenario.title}
                </span>
              </div>
              <button onClick={stop} className="h-6 w-6 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-sm font-semibold">{state.currentStep.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {state.currentStep.description}
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full flex-1 transition-colors duration-200",
                    i <= state.stepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Step {state.stepIndex + 1} of {totalSteps}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={stop}
                >
                  Skip
                </Button>
                {!isFirst && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="h-3 w-3" /> Back
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-7 text-xs px-3 gap-1"
                  onClick={nextStep}
                >
                  {isLast ? "Finish" : "Next"} {!isLast && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>,
    document.body
  );
}
