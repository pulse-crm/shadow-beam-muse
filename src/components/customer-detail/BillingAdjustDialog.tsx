import * as React from "react";
import { CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { toast } from "@/components/ui/toast/toaster";
import type { Invoice } from "@/data/mock";
import { formatCurrency } from "@/lib/format";

interface BillingAdjustDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reasonCodes = [
  { value: "goodwill", label: "Goodwill Gesture" },
  { value: "billing_error", label: "Billing Error" },
  { value: "sla_breach", label: "SLA Breach Compensation" },
  { value: "loyalty", label: "Loyalty Retention" },
  { value: "service_outage", label: "Service Outage Credit" },
  { value: "overcharge", label: "Overcharge Correction" },
];

export function BillingAdjustDialog({ invoice, open, onOpenChange }: BillingAdjustDialogProps) {
  const [type, setType] = React.useState<"credit" | "adjustment">("credit");
  const [reason, setReason] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setType("credit");
      setReason("");
      setAmount("");
      setNotes("");
    }
  }, [open]);

  if (!invoice) return null;

  const amountVal = parseFloat(amount) || 0;
  const approvalThreshold = invoice.amount * 0.1;
  const needsApproval = type === "credit" && amountVal > approvalThreshold;

  const handleSubmit = () => {
    if (!reason || amountVal <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a reason and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    const reasonLabel = reasonCodes.find((r) => r.value === reason)?.label || reason;
    if (needsApproval) {
      toast({
        title: "Approval Required",
        description: `Credits over 10% of invoice total (${formatCurrency(
          approvalThreshold
        )}) require authorisation.`,
      });
    } else {
      toast({
        title: type === "credit" ? "Credit Issued" : "Adjustment Applied",
        description: `${formatCurrency(amountVal)} ${type} applied to ${invoice.id} for ${invoice.customer}. Reason: ${reasonLabel}.`,
        variant: "success",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Billing Adjustment — {invoice.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-2 rounded-lg bg-accent/30 text-xs">
            <span className="text-muted-foreground">Customer:</span>{" "}
            <span className="font-medium">{invoice.customer}</span>
            <span className="text-muted-foreground ml-3">Invoice Total:</span>{" "}
            <span className="font-mono font-medium">{formatCurrency(invoice.amount)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={type === "credit" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => setType("credit")}
              >
                Issue Credit
              </Button>
              <Button
                size="sm"
                variant={type === "adjustment" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => setType("adjustment")}
              >
                Adjustment
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Reason Code</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {reasonCodes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Amount (£)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-8 text-xs"
              min="0"
              step="0.01"
            />
          </div>

          {needsApproval && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
              <span className="text-xs text-warning">
                Credits over 10% of invoice total ({formatCurrency(approvalThreshold)}) require
                supervisor authorisation.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs"
              placeholder="Additional context..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={handleSubmit}>
            <CheckCircle2 className="h-3 w-3" />
            {needsApproval ? "Submit for Approval" : type === "credit" ? "Issue Credit" : "Apply Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
