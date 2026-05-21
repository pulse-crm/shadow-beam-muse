import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Order } from "@/data/mock";
import { cn } from "@/lib/cn";

const orderStages = ["Draft", "Submitted", "Validation", "Provisioning", "Testing", "Complete"];

/** Maps a pulse `Order.status` to an index in `orderStages`. */
function stageOf(status: Order["status"]): number {
  switch (status) {
    case "Pending":
      return 1; // Submitted
    case "Active":
      return 3; // Provisioning
    case "Completed":
      return 5; // Complete
    case "Cancelled":
      return -1;
    default:
      return 0;
  }
}

export function OrderTracker({ order }: { order: Order }) {
  const current = stageOf(order.status);

  if (current === -1) {
    return (
      <div className="flex items-center gap-1 text-xs text-destructive">
        <Circle className="h-3 w-3" /> Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 w-full">
      {orderStages.map((stage, i) => {
        const isComplete = i < current;
        const isCurrent = i === current;
        const isFuture = i > current;
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-primary animate-spinner shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={cn(
                  "text-[9px] mt-0.5 whitespace-nowrap",
                  isComplete && "text-success font-medium",
                  isCurrent && "text-primary font-medium",
                  isFuture && "text-muted-foreground/50"
                )}
              >
                {stage}
              </span>
            </div>
            {i < orderStages.length - 1 && (
              <div className={cn("h-px flex-1 mx-1", isComplete ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
