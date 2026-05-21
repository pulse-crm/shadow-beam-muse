import * as React from "react";
import { Clock, Users, ArrowUpCircle, Bot, Shield, History, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Label } from "@/components/ui/label/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio/radio-group";
import { SearchablePicker } from "@/components/ui/searchable-picker/searchable-picker";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast/toaster";
import { type Ticket, assignmentTeams } from "@/data/mock";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

interface TicketDetailDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slaInfo(t: Ticket) {
  const created = Date.parse(t.createdAt);
  const deadline = Date.parse(t.slaDeadline);
  const now = Date.now();
  const total = deadline - created;
  const elapsed = now - created;
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const breached = now > deadline && t.status !== "Resolved" && t.status !== "Closed";
  return { pct, breached, deadline };
}

function slaColorClass(pct: number, breached: boolean) {
  if (breached) return "text-destructive";
  if (pct >= 75) return "text-warning";
  return "text-success";
}

function slaBarClass(pct: number, breached: boolean) {
  if (breached) return "bg-destructive";
  if (pct >= 75) return "bg-warning";
  return "bg-success";
}

/** Pulse tickets carry no AI confidence — derive a stable value from the id. */
function aiConfidence(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 70 + (h % 30);
}

export function TicketDetailDialog({ ticket, open, onOpenChange }: TicketDetailDialogProps) {
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [transferMode, setTransferMode] = React.useState<"agent" | "team">("agent");
  const [transferTargetAgent, setTransferTargetAgent] = React.useState("");
  const [transferTargetTeam, setTransferTargetTeam] = React.useState("");

  if (!ticket) return null;
  const { pct, breached, deadline } = slaInfo(ticket);

  const agentOptions = Array.from(new Set(assignmentTeams.flatMap((t) => t.members)))
    .filter((name) => name !== ticket.assignee)
    .map((name) => ({ value: name, label: name }));

  const handleTransferConfirm = () => {
    if (transferMode === "agent") {
      if (!transferTargetAgent) return;
      toast({
        title: "Ticket Transferred",
        description: `${ticket.id} moved from ${ticket.assignee} to ${transferTargetAgent}.`,
      });
    } else {
      if (!transferTargetTeam) return;
      const team = assignmentTeams.find((t) => t.name === transferTargetTeam);
      const members = team?.members.filter((m) => m !== ticket.assignee) || [];
      toast({
        title: "Ticket Distributed",
        description: `${ticket.id} assigned to ${transferTargetTeam} (${members.length} members).`,
      });
    }
    setTransferOpen(false);
    setTransferTargetAgent("");
    setTransferTargetTeam("");
  };
  const conf = aiConfidence(ticket.id);
  // Pulse Ticket has no audit log; surface the create + assignment events we know.
  const auditEntries = [
    {
      id: "a-created",
      action: "Ticket created",
      user: "System",
      timestamp: ticket.createdAt,
      notes: `Logged via ${ticket.category} queue.`,
    },
    {
      id: "a-assigned",
      action: "Assigned",
      user: ticket.assignee,
      timestamp: ticket.createdAt,
      notes: `Routed to ${ticket.assignee} via skills-based routing.`,
    },
  ];

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
            {ticket.subject}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status row */}
          <div className="flex gap-2 flex-wrap items-center">
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">Category: {ticket.category}</span>
            <span className="text-xs text-muted-foreground">Assignee: {ticket.assignee}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            {ticket.subject} — reported by {ticket.customer}. This case is being handled by the{" "}
            {ticket.category} team.
          </p>

          {/* Dual SLA Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Response SLA
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    pct >= 25 ? "text-success" : "text-muted-foreground"
                  )}
                >
                  ✓ MET
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-success" style={{ width: "100%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">First response logged</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Resolution SLA
                </span>
                <span className={cn("text-[10px] font-medium", slaColorClass(pct, breached))}>
                  {breached ? "BREACHED" : `${pct}% elapsed`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full", slaBarClass(pct, breached))}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Due {formatDateTime(deadline.toString())}
              </p>
            </div>
          </div>

          {/* AI Categorization */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">AI Categorization</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30">
                Category: {ticket.category}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30">
                Confidence: {conf}%
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30">
                Suggested: {ticket.priority}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => toast({ title: "AI suggestion accepted" })}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px]"
                onClick={() => toast({ title: "Override mode" })}
              >
                Override
              </Button>
            </div>
          </div>

          {/* Channel & Routing */}
          <div className="p-3 rounded-lg bg-accent/30 space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Routing & Skills</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Required skills: <strong>{ticket.category}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Assigned to: <strong>{ticket.assignee}</strong> via skills-based routing
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 mt-1"
              onClick={() => {
                setTransferMode("agent");
                setTransferTargetAgent("");
                setTransferTargetTeam("");
                setTransferOpen(true);
              }}
            >
              <ArrowUpCircle className="h-3 w-3" /> Transfer Ticket
            </Button>
          </div>

          {/* Approval Workflow */}
          <div className="p-3 rounded-lg bg-accent/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Approval Workflow</span>
              </div>
              <StatusBadge status="Not Required" />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px]"
                onClick={() => toast({ title: "Approval Requested" })}
              >
                Request Approval
              </Button>
            </div>
          </div>

          {/* Ticket Audit Log */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Ticket Audit Log
            </h4>
            <div className="space-y-3">
              {auditEntries.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-primary" />
                    </div>
                    {i < auditEntries.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-2 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">{entry.action}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.user} · {formatDateTime(entry.timestamp)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{entry.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                toast({
                  title: "Resolved",
                  description: `${ticket.id} marked as resolved.`,
                  variant: "success",
                });
              }}
            >
              Mark Resolved
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Transfer Ticket {ticket.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Currently assigned to <strong>{ticket.assignee}</strong>. Choose where to transfer
            this ticket.
          </p>
          <RadioGroup
            value={transferMode}
            onValueChange={(v) => setTransferMode(v as "agent" | "team")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agent" id="tr-agent" />
              <Label htmlFor="tr-agent" className="text-xs">
                Transfer to Agent
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="team" id="tr-team" />
              <Label htmlFor="tr-team" className="text-xs">
                Distribute to Team
              </Label>
            </div>
          </RadioGroup>

          {transferMode === "agent" ? (
            <SearchablePicker
              options={agentOptions}
              value={transferTargetAgent}
              onValueChange={setTransferTargetAgent}
              placeholder="Search agents..."
            />
          ) : (
            <div className="space-y-3">
              <SearchablePicker
                options={assignmentTeams.map((t) => ({
                  value: t.name,
                  label: t.name,
                  description: `${t.members.length} members`,
                }))}
                value={transferTargetTeam}
                onValueChange={setTransferTargetTeam}
                placeholder="Search teams..."
              />
              {transferTargetTeam &&
                (() => {
                  const team = assignmentTeams.find((t) => t.name === transferTargetTeam);
                  const members = team?.members.filter((m) => m !== ticket.assignee) || [];
                  return (
                    <div className="p-2 rounded-md bg-muted/50 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Distribution preview — 1 ticket to {members.length} member(s)
                      </p>
                      {members.map((m, i) => (
                        <div key={m} className="flex justify-between text-xs">
                          <span>{m}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {i === 0 ? "assigned" : "queued"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setTransferOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={handleTransferConfirm}
            disabled={transferMode === "agent" ? !transferTargetAgent : !transferTargetTeam}
          >
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
