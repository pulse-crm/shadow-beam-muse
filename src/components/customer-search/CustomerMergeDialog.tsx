import * as React from "react";
import { GitMerge, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio/radio-group";
import { Label } from "@/components/ui/label/label";
import { toast } from "@/components/ui/toast/toaster";
import type { Customer } from "@/data/mock";

interface CustomerMergeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  duplicates: Customer[];
}

export function CustomerMergeDialog({ open, onOpenChange, duplicates }: CustomerMergeDialogProps) {
  const [primaryId, setPrimaryId] = React.useState(duplicates[0]?.id || "");

  React.useEffect(() => {
    if (open && duplicates.length > 0) setPrimaryId(duplicates[0].id);
  }, [open, duplicates]);

  if (duplicates.length < 2) return null;

  const handleMerge = () => {
    const primary = duplicates.find((c) => c.id === primaryId);
    toast({
      title: "Accounts Merged",
      description: `${duplicates.length} accounts merged into ${primary?.name} (${primary?.accountNumber}). Tickets, orders, and history consolidated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            Merge Duplicate Accounts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 rounded-md bg-warning/10 border border-warning/30">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="text-xs text-warning">
              This will merge all data into the primary account. This action cannot be undone.
            </span>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Select Primary Account</p>
            <RadioGroup value={primaryId} onValueChange={setPrimaryId}>
              {duplicates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-md border hover:bg-accent/30 transition-colors"
                >
                  <RadioGroupItem value={c.id} id={`merge-${c.id}`} />
                  <Label htmlFor={`merge-${c.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {c.accountNumber} · {c.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px]">
                          {c.status}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          {c.type}
                        </Badge>
                        {c.id === primaryId && (
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-primary/10 text-primary border-primary/30"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="p-2 rounded-md bg-accent/30 text-xs space-y-1">
            <p className="font-medium">What will be merged:</p>
            <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>All tickets and cases consolidated under primary account</li>
              <li>All orders and service history transferred</li>
              <li>Payment history and invoices merged</li>
              <li>Secondary account(s) marked as "Merged" and archived</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleMerge}>
            <GitMerge className="h-3 w-3" /> Merge {duplicates.length} Accounts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}