import { useDemoMode } from "./demo-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { demoScenarios } from "./scenarios";
import { LayoutDashboard, TicketPlus, Receipt, CreditCard, MessageSquare } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  TicketPlus,
  Receipt,
  CreditCard,
  MessageSquare,
};

export function DemoLauncher() {
  const { launcherOpen, setLauncherOpen, startScenario } = useDemoMode();

  return (
    <Dialog open={launcherOpen} onOpenChange={setLauncherOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            🎯 Demo Mode — Choose a Scenario
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          Select a guided walkthrough to learn how to perform common tasks.
        </p>
        <div className="space-y-2 mt-2">
          {demoScenarios.map((scenario, i) => {
            const Icon = iconMap[scenario.icon] || LayoutDashboard;
            return (
              <button
                key={scenario.id}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/30 transition-all text-left group"
                onClick={() => startScenario(scenario.id)}
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{i + 1}.</span>
                    <h3 className="text-sm font-semibold">{scenario.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{scenario.steps.length} steps</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
