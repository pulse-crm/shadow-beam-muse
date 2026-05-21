import { Gauge } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Progress } from "@/components/ui/progress/progress";
import type { Customer, Invoice, Payment } from "@/data/mock";
import { cn } from "@/lib/cn";

interface CreditScoringPanelProps {
  customer: Customer;
  invoices?: Invoice[];
  payments?: Payment[];
  /** Outstanding amount on this account — positive = owed, negative = credit. */
  outstandingBalance?: number;
}

function creditTone(score: number) {
  if (score >= 800) return "text-success";
  if (score >= 650) return "text-warning";
  return "text-destructive";
}

function progressTone(score: number): "success" | "warning" | "destructive" {
  if (score >= 800) return "success";
  if (score >= 650) return "warning";
  return "destructive";
}

function classOf(score: number) {
  if (score >= 900) return "A+";
  if (score >= 800) return "A";
  if (score >= 700) return "B+";
  if (score >= 600) return "B";
  return "C";
}

function monthsSince(iso: string): number {
  const start = new Date(iso);
  if (isNaN(start.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

export function CreditScoringPanel({
  customer,
  invoices = [],
  payments = [],
  outstandingBalance = 0,
}: CreditScoringPanelProps) {
  const score = customer.creditScore;
  const limit = score * 10;
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;
  // Pulse Payment has no "Failed" status; surface 0 for now.
  const failedPayments = payments.filter((p) => (p as Payment & { status?: string }).status === "Failed").length;
  const accountAge = monthsSince(customer.joinedAt);

  const toneClass = creditTone(score);

  return (
    <CollapsiblePanel title="Credit Scoring" icon={Gauge} defaultOpen={false}>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Score</p>
            <p className={cn("text-2xl font-bold", toneClass)}>{score}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Class</p>
            <p className="text-2xl font-bold">{classOf(score)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Limit</p>
            <p className="text-2xl font-bold">£{limit.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Score Range</span>
            <span className="text-xs font-medium">{score} / 1000</span>
          </div>
          <Progress value={score / 10} tone={progressTone(score)} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-accent/30 flex justify-between">
            <span className="text-muted-foreground">Outstanding Balance:</span>
            <span className="font-mono font-medium">£{Math.max(0, outstandingBalance).toFixed(2)}</span>
          </div>
          <div className="p-2 rounded bg-accent/30 flex justify-between">
            <span className="text-muted-foreground">Overdue Invoices:</span>
            <span className="font-mono font-medium">{overdueCount}</span>
          </div>
          <div className="p-2 rounded bg-accent/30 flex justify-between">
            <span className="text-muted-foreground">Failed Payments:</span>
            <span className="font-mono font-medium">{failedPayments}</span>
          </div>
          <div className="p-2 rounded bg-accent/30 flex justify-between">
            <span className="text-muted-foreground">Account Age:</span>
            <span className="font-mono font-medium">{accountAge} months</span>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
