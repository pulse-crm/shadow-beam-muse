import * as React from "react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Separator } from "@/components/ui/separator/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Input } from "@/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { toast } from "@/components/ui/toast/toaster";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  PoundSterling,
  Bot,
  History,
  Settings2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/cn";

type WorkflowStage = "submitted" | "neo_reviewing" | "awaiting_human" | "complete";

interface BillingAdjustmentEntry {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  type: "Credit" | "Debit";
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes: string;
  workflowStage?: WorkflowStage;
  neoRecommendation?: string;
  assignedApprover?: string;
}

interface ApprovalEvent {
  id: string;
  adjustmentId: string;
  eventType: string;
  actor: string;
  details: string;
  createdAt: string;
}

const initialAdjustments: BillingAdjustmentEntry[] = [
  {
    id: "ADJ-1044",
    customerId: "C003",
    customerName: "Hooli",
    invoiceId: "INV-2026-004",
    type: "Credit",
    amount: 250,
    reason: "Goodwill credit",
    status: "Pending",
    requestedBy: "Priya Patel",
    submittedAt: "2026-05-12T11:01:00Z",
    notes: "Customer reported repeated portal outages during onboarding week.",
    workflowStage: "awaiting_human",
    neoRecommendation: "recommend_approve",
    assignedApprover: "Supervisor",
  },
  {
    id: "ADJ-1045",
    customerId: "C001",
    customerName: "Acme Corp",
    invoiceId: "INV-2026-001",
    type: "Credit",
    amount: 1500,
    reason: "Late delivery on leased line",
    status: "Pending",
    requestedBy: "Diego Alvarez",
    submittedAt: "2026-05-13T16:48:00Z",
    notes: "Leased line install delayed by 11 days vs contracted SLA.",
    workflowStage: "neo_reviewing",
    neoRecommendation: "needs_review",
  },
  {
    id: "ADJ-1046",
    customerId: "C005",
    customerName: "Globex Industries",
    invoiceId: "INV-2026-002",
    type: "Debit",
    amount: 320,
    reason: "Usage overage adjustment",
    status: "Pending",
    requestedBy: "Marcus Lee",
    submittedAt: "2026-05-15T09:20:00Z",
    notes: "Metered bandwidth exceeded plan cap for April billing period.",
    workflowStage: "awaiting_human",
    neoRecommendation: "recommend_reject",
    assignedApprover: "Admin",
  },
  {
    id: "ADJ-1042",
    customerId: "C005",
    customerName: "Globex Industries",
    invoiceId: "INV-2026-002",
    type: "Credit",
    amount: 480,
    reason: "SLA credit for outage on 2026-05-02",
    status: "Approved",
    requestedBy: "Marcus Lee",
    submittedAt: "2026-05-04T09:15:00Z",
    approvedBy: "Nihala Nazar",
    approvedAt: "2026-05-04T14:30:00Z",
    notes: "Confirmed 4h core outage. Within SLA credit policy.",
    workflowStage: "complete",
    neoRecommendation: "auto_approved",
  },
  {
    id: "ADJ-1043",
    customerId: "C004",
    customerName: "Initech LLC",
    invoiceId: "INV-2026-003",
    type: "Credit",
    amount: 120,
    reason: "Pro-rata for downgrade",
    status: "Approved",
    requestedBy: "Sarah Chen",
    submittedAt: "2026-05-05T14:22:00Z",
    approvedBy: "Nihala Nazar",
    approvedAt: "2026-05-05T17:10:00Z",
    notes: "Plan downgrade processed mid-cycle, pro-rata credit applied.",
    workflowStage: "complete",
    neoRecommendation: "auto_approved",
  },
  {
    id: "ADJ-1041",
    customerId: "C006",
    customerName: "Umbrella Co",
    invoiceId: "INV-2026-006",
    type: "Debit",
    amount: 75,
    reason: "Duplicate charge reversal",
    status: "Rejected",
    requestedBy: "Marcus Lee",
    submittedAt: "2026-05-01T10:30:00Z",
    approvedBy: "Admin",
    approvedAt: "2026-05-01T15:45:00Z",
    notes: "No duplicate found on account ledger. | Rejected: Charge is valid per usage records.",
    workflowStage: "complete",
    neoRecommendation: "recommend_reject",
  },
];

const initialEvents: ApprovalEvent[] = [
  { id: "EV-1", adjustmentId: "ADJ-1044", eventType: "submitted", actor: "Priya Patel", details: "Adjustment request submitted.", createdAt: "2026-05-12T11:01:00Z" },
  { id: "EV-2", adjustmentId: "ADJ-1044", eventType: "neo_reviewed", actor: "Neo", details: "Neo analysed the request and recommends approval.", createdAt: "2026-05-12T11:03:00Z" },
  { id: "EV-3", adjustmentId: "ADJ-1045", eventType: "submitted", actor: "Diego Alvarez", details: "Adjustment request submitted.", createdAt: "2026-05-13T16:48:00Z" },
  { id: "EV-4", adjustmentId: "ADJ-1046", eventType: "submitted", actor: "Marcus Lee", details: "Adjustment request submitted.", createdAt: "2026-05-15T09:20:00Z" },
  { id: "EV-5", adjustmentId: "ADJ-1046", eventType: "neo_reviewed", actor: "Neo", details: "Neo flagged this request for human review.", createdAt: "2026-05-15T09:22:00Z" },
  { id: "EV-6", adjustmentId: "ADJ-1042", eventType: "submitted", actor: "Marcus Lee", details: "Adjustment request submitted.", createdAt: "2026-05-04T09:15:00Z" },
  { id: "EV-7", adjustmentId: "ADJ-1042", eventType: "neo_approved", actor: "Neo", details: "Auto-approved by Neo (within policy threshold).", createdAt: "2026-05-04T09:17:00Z" },
  { id: "EV-8", adjustmentId: "ADJ-1042", eventType: "human_approved", actor: "Nihala Nazar", details: "Approved by Nihala Nazar.", createdAt: "2026-05-04T14:30:00Z" },
  { id: "EV-9", adjustmentId: "ADJ-1043", eventType: "submitted", actor: "Sarah Chen", details: "Adjustment request submitted.", createdAt: "2026-05-05T14:22:00Z" },
  { id: "EV-10", adjustmentId: "ADJ-1043", eventType: "human_approved", actor: "Nihala Nazar", details: "Approved by Nihala Nazar.", createdAt: "2026-05-05T17:10:00Z" },
  { id: "EV-11", adjustmentId: "ADJ-1041", eventType: "submitted", actor: "Marcus Lee", details: "Adjustment request submitted.", createdAt: "2026-05-01T10:30:00Z" },
  { id: "EV-12", adjustmentId: "ADJ-1041", eventType: "human_rejected", actor: "Admin", details: "Rejected by Admin. Reason: Charge is valid per usage records.", createdAt: "2026-05-01T15:45:00Z" },
];

const stepperStages: { key: WorkflowStage; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "neo_reviewing", label: "Neo Review" },
  { key: "awaiting_human", label: "Human Review" },
  { key: "complete", label: "Complete" },
];

function ApprovalStepper({
  currentStage,
  status,
}: {
  currentStage: WorkflowStage;
  status: string;
}) {
  const activeIndex = stepperStages.findIndex((s) => s.key === currentStage);
  return (
    <div className="flex items-center justify-between">
      {stepperStages.map((stage, i) => {
        const done = i < activeIndex || status !== "Pending";
        const active = i === activeIndex && status === "Pending";
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                  done
                    ? "bg-success text-success-foreground border-success"
                    : active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                )}
              >
                {done ? <CheckCircle className="h-3 w-3" /> : i + 1}
              </div>
              <span className="text-[9px] text-muted-foreground">{stage.label}</span>
            </div>
            {i < stepperStages.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1",
                  i < activeIndex || status !== "Pending" ? "bg-success" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ApprovalTimeline({ events }: { events: ApprovalEvent[] }) {
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No events recorded yet.</p>;
  }
  return (
    <div className="space-y-3">
      {events.map((e) => {
        const isNeo = e.eventType.startsWith("neo");
        return (
          <div key={e.id} className="flex gap-2">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                isNeo ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
              )}
            >
              {isNeo ? <Bot className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{e.actor}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{e.details}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Approvals() {
  const role: "Admin" | "Supervisor" = "Admin";

  const [items, setItems] = React.useState<BillingAdjustmentEntry[]>(initialAdjustments);
  const [events, setEvents] = React.useState<ApprovalEvent[]>(initialEvents);

  const [selected, setSelected] = React.useState<BillingAdjustmentEntry | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectNotes, setRejectNotes] = React.useState("");
  const [filter, setFilter] = React.useState<"pending" | "all">("pending");
  const [mainTab, setMainTab] = React.useState("queue");
  const [neoAnalysisEntry, setNeoAnalysisEntry] = React.useState<BillingAdjustmentEntry | null>(null);


  const pending = items.filter((i) => i.status === "Pending");
  const displayed = filter === "pending" ? pending : items;

  const approverName = role === "Admin" ? "Admin" : "Supervisor";

  const selectedEvents = selected
    ? events.filter((e) => e.adjustmentId === selected.id)
    : [];

  const handleApprove = (entry: BillingAdjustmentEntry) => {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((i) =>
        i.id === entry.id
          ? { ...i, status: "Approved", approvedBy: approverName, approvedAt: now, workflowStage: "complete" }
          : i
      )
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `EV-${Date.now()}`,
        adjustmentId: entry.id,
        eventType: "human_approved",
        actor: approverName,
        details: `Approved by ${approverName}.`,
        createdAt: now,
      },
    ]);
    toast({
      title: "Approved",
      description: `${formatCurrency(entry.amount)} ${entry.type.toLowerCase()} for ${entry.customerName} approved.`,
    });
    setDetailOpen(false);
  };

  const handleReject = (entry: BillingAdjustmentEntry) => {
    const rejectionReason = rejectNotes || "No reason provided";
    const now = new Date().toISOString();
    const updatedNotes = rejectNotes ? `${entry.notes} | Rejected: ${rejectNotes}` : entry.notes;
    setItems((prev) =>
      prev.map((i) =>
        i.id === entry.id
          ? {
              ...i,
              status: "Rejected",
              approvedBy: approverName,
              approvedAt: now,
              notes: updatedNotes,
              workflowStage: "complete",
            }
          : i
      )
    );
    setEvents((prev) => [
      ...prev,
      {
        id: `EV-${Date.now()}`,
        adjustmentId: entry.id,
        eventType: "human_rejected",
        actor: approverName,
        details: `Rejected by ${approverName}. Reason: ${rejectionReason}`,
        createdAt: now,
      },
    ]);
    toast({
      title: "Rejected",
      description: `${entry.type} request ${entry.id} rejected.`,
      variant: "destructive",
    });
    setRejectOpen(false);
    setDetailOpen(false);
    setRejectNotes("");
  };

  const openDetail = (entry: BillingAdjustmentEntry) => {
    setSelected(entry);
    setDetailOpen(true);
  };

  const statusBadge = (status: string) => {
    if (status === "Approved")
      return (
        <Badge variant="outline" className="border-success/50 text-success bg-success/10 text-[10px]">
          <CheckCircle className="h-3 w-3 mr-1" />Approved
        </Badge>
      );
    if (status === "Rejected")
      return (
        <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10 text-[10px]">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>
      );
    return (
      <Badge variant="outline" className="border-warning/50 text-warning bg-warning/10 text-[10px]">
        <Clock className="h-3 w-3 mr-1" />Pending
      </Badge>
    );
  };

  const stageBadge = (stage?: string) => {
    if (!stage || stage === "submitted")
      return <Badge variant="outline" className="text-[9px]">Submitted</Badge>;
    if (stage === "neo_reviewing")
      return (
        <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-500 bg-blue-500/10">
          <Bot className="h-2.5 w-2.5 mr-0.5" />Neo Reviewing
        </Badge>
      );
    if (stage === "awaiting_human")
      return (
        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/10">
          Awaiting Human
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-[9px] border-success/30 text-success bg-success/10">
        Complete
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approval Centre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending.length} request{pending.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="queue" className="text-xs gap-1">
            <Clock className="h-3.5 w-3.5" /> Queue
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1">
            <History className="h-3.5 w-3.5" /> History
          </TabsTrigger>
          {role === "Admin" && (
            <TabsTrigger value="config" className="text-xs gap-1">
              <Settings2 className="h-3.5 w-3.5" /> Configuration
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                  <p className="text-xl font-bold">{pending.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <PoundSterling className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Pending Total</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(pending.reduce((s, i) => s + i.amount, 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Neo Auto-Approved</p>
                  <p className="text-xl font-bold">
                    {items.filter((i) => i.neoRecommendation === "auto_approved").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Approved Today</p>
                  <p className="text-xl font-bold">
                    {
                      items.filter(
                        (i) =>
                          i.status === "Approved" &&
                          i.approvedAt &&
                          new Date(i.approvedAt).toDateString() === new Date().toDateString()
                      ).length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={filter === "pending" ? "default" : "outline"}
              className="text-xs h-8"
              onClick={() => setFilter("pending")}
            >
              <Clock className="h-3.5 w-3.5 mr-1" /> Pending ({pending.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              className="text-xs h-8"
              onClick={() => setFilter("all")}
            >
              All ({items.length})
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                        {filter === "pending"
                          ? "🎉 No pending approvals — you're all caught up!"
                          : "No adjustment records found."}
                      </TableCell>
                    </TableRow>
                  )}
                  {displayed.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => openDetail(entry)}
                    >
                      <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                      <TableCell className="font-medium text-sm">{entry.customerName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.type === "Credit" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{entry.reason}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>{stageBadge(entry.workflowStage)}</TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell>
                        {entry.status === "Pending" && entry.workflowStage !== "neo_reviewing" && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-500/10"
                              onClick={() => setNeoAnalysisEntry(entry)}
                              title="Neo AI Analysis"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-success hover:bg-success/10"
                              onClick={() => handleApprove(entry)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelected(entry);
                                setRejectOpen(true);
                              }}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {entry.status !== "Pending" && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-500/10"
                              onClick={() => setNeoAnalysisEntry(entry)}
                              title="Neo AI Analysis"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" /> Approval History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Neo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actioned By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items
                    .filter((i) => i.status !== "Pending")
                    .map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => openDetail(entry)}
                      >
                        <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                        <TableCell className="text-sm">{entry.customerName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={entry.type === "Credit" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{entry.reason}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell>
                          {entry.neoRecommendation ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px]",
                                entry.neoRecommendation.includes("approve")
                                  ? "text-success border-success/30"
                                  : entry.neoRecommendation.includes("reject")
                                    ? "text-destructive border-destructive/30"
                                    : "text-warning border-warning/30"
                              )}
                            >
                              {entry.neoRecommendation.replace(/_/g, " ")}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{statusBadge(entry.status)}</TableCell>
                        <TableCell className="text-xs">{entry.approvedBy || "—"}</TableCell>
                        <TableCell className="text-xs font-mono">
                          {entry.approvedAt
                            ? new Date(entry.approvedAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {role === "Admin" && (
          <TabsContent value="config" className="space-y-4">
            <NeoApprovalConfig />
            <ApprovalPolicyEditor />
          </TabsContent>
        )}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Stepper */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <ApprovalStepper
                  currentStage={(selected.workflowStage || "submitted") as WorkflowStage}
                  status={selected.status}
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Customer</p>
                  <p className="font-medium">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Invoice</p>
                  <p className="font-mono">{selected.invoiceId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Type</p>
                  <Badge
                    variant={selected.type === "Credit" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {selected.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Amount</p>
                  <p className="font-mono font-bold text-lg">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Reason</p>
                  <p>{selected.reason}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                  {statusBadge(selected.status)}
                </div>
                {selected.assignedApprover && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Assigned To</p>
                    <p className="text-sm">{selected.assignedApprover}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Event Timeline */}
              <div>
                <p className="text-xs font-medium mb-2">Approval Timeline</p>
                <ApprovalTimeline events={selectedEvents} />
              </div>

              <Separator />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Notes</p>
                <p className="text-sm bg-muted/50 rounded-md p-2">{selected.notes}</p>
              </div>
            </div>
          )}
          {selected?.status === "Pending" && selected?.workflowStage !== "neo_reviewing" && (
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 text-destructive"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1"
                onClick={() => handleApprove(selected)}
              >
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(v) => {
          setRejectOpen(v);
          if (!v) setRejectNotes("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" /> Reject {selected?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">
              Rejecting{" "}
              <span className="font-semibold">{formatCurrency(selected?.amount ?? 0)}</span>{" "}
              {selected?.type.toLowerCase()} for{" "}
              <span className="font-semibold">{selected?.customerName}</span>.
            </p>
            <Textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              className="text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs gap-1"
              onClick={() => selected && handleReject(selected)}
            >
              <XCircle className="h-3.5 w-3.5" /> Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Neo Credit Analysis Dialog */}
      <Dialog
        open={!!neoAnalysisEntry}
        onOpenChange={(v) => {
          if (!v) setNeoAnalysisEntry(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" /> Neo AI Credit Analysis
            </DialogTitle>
          </DialogHeader>
          {neoAnalysisEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Customer</p>
                  <p className="font-medium">{neoAnalysisEntry.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Adjustment</p>
                  <p className="font-mono">{neoAnalysisEntry.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Amount</p>
                  <p className="font-mono font-bold">
                    {formatCurrency(neoAnalysisEntry.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Recommendation</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      (neoAnalysisEntry.neoRecommendation || "").includes("approve")
                        ? "text-success border-success/30"
                        : (neoAnalysisEntry.neoRecommendation || "").includes("reject")
                          ? "text-destructive border-destructive/30"
                          : "text-warning border-warning/30"
                    )}
                  >
                    {(neoAnalysisEntry.neoRecommendation || "needs review").replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-blue-500" /> Neo Analysis
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on the customer's payment history, account tenure, and the stated reason
                  "{neoAnalysisEntry.reason}", Neo assessed this {neoAnalysisEntry.type.toLowerCase()} request of{" "}
                  {formatCurrency(neoAnalysisEntry.amount)} and{" "}
                  {(neoAnalysisEntry.neoRecommendation || "").includes("approve")
                    ? "recommends approval — it aligns with policy and the customer is in good standing."
                    : (neoAnalysisEntry.neoRecommendation || "").includes("reject")
                      ? "recommends rejection — supporting evidence is insufficient."
                      : "flagged it for human review — additional context is required before a decision."}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNeoAnalysisEntry(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Toggle({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        checked ? "bg-primary" : "bg-input",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

const neoReasonGroups = [
  { value: "goodwill", label: "Goodwill" },
  { value: "billing_error", label: "Billing Error" },
  { value: "sla_breach", label: "SLA Breach" },
  { value: "loyalty", label: "Loyalty" },
  { value: "service_outage", label: "Service Outage" },
  { value: "overcharge", label: "Overcharge" },
];

interface NeoConfig {
  auto_approve_max_pct: number;
  min_health_score: number;
  min_value_tier: string;
  auto_reject_reasons: string[];
  enabled: boolean;
  check_spend_pct_enabled: boolean;
  check_health_enabled: boolean;
  check_value_tier_enabled: boolean;
}

function NeoApprovalConfig() {
  const [config, setConfig] = React.useState<NeoConfig>({
    auto_approve_max_pct: 15,
    min_health_score: 70,
    min_value_tier: "Silver",
    auto_reject_reasons: ["service_outage"],
    enabled: true,
    check_spend_pct_enabled: true,
    check_health_enabled: true,
    check_value_tier_enabled: true,
  });

  const toggleRejectReason = (reason: string) => {
    setConfig((c) => ({
      ...c,
      auto_reject_reasons: c.auto_reject_reasons.includes(reason)
        ? c.auto_reject_reasons.filter((r) => r !== reason)
        : [...c.auto_reject_reasons, reason],
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" /> Neo AI Configuration
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Neo Review</span>
            <Toggle
              checked={config.enabled}
              onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Configure thresholds for Neo's automatic credit approval decisions. Toggle each check
          on/off independently.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Spend % Check */}
          <div
            className={cn(
              "space-y-1 rounded-md border p-3 transition-opacity",
              config.check_spend_pct_enabled ? "opacity-100" : "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">
                Max % of Avg Spend
              </label>
              <Toggle
                className="scale-75"
                checked={config.check_spend_pct_enabled}
                onCheckedChange={(v) => setConfig({ ...config, check_spend_pct_enabled: v })}
              />
            </div>
            <Input
              type="number"
              className="h-8 text-xs"
              value={config.auto_approve_max_pct}
              onChange={(e) =>
                setConfig({ ...config, auto_approve_max_pct: parseFloat(e.target.value) || 0 })
              }
              disabled={!config.check_spend_pct_enabled}
            />
            <p className="text-[9px] text-muted-foreground">
              Credits below this % of avg invoice are auto-approved
            </p>
          </div>

          {/* Health Score Check */}
          <div
            className={cn(
              "space-y-1 rounded-md border p-3 transition-opacity",
              config.check_health_enabled ? "opacity-100" : "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">
                Min Health Score
              </label>
              <Toggle
                className="scale-75"
                checked={config.check_health_enabled}
                onCheckedChange={(v) => setConfig({ ...config, check_health_enabled: v })}
              />
            </div>
            <Input
              type="number"
              className="h-8 text-xs"
              value={config.min_health_score}
              onChange={(e) =>
                setConfig({ ...config, min_health_score: parseInt(e.target.value) || 0 })
              }
              min={0}
              max={100}
              disabled={!config.check_health_enabled}
            />
            <p className="text-[9px] text-muted-foreground">
              Customer health must exceed this score
            </p>
          </div>

          {/* Value Tier Check */}
          <div
            className={cn(
              "space-y-1 rounded-md border p-3 transition-opacity",
              config.check_value_tier_enabled ? "opacity-100" : "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">
                Min Value Tier
              </label>
              <Toggle
                className="scale-75"
                checked={config.check_value_tier_enabled}
                onCheckedChange={(v) => setConfig({ ...config, check_value_tier_enabled: v })}
              />
            </div>
            <Select
              value={config.min_value_tier}
              onValueChange={(v) => setConfig({ ...config, min_value_tier: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bronze">Bronze (Consumer)</SelectItem>
                <SelectItem value="Silver">Silver (SMB+)</SelectItem>
                <SelectItem value="Gold">Gold (Enterprise+)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[9px] text-muted-foreground">
              Minimum tier for auto-approval eligibility
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Auto-Approval Reason Groups
          </label>
          <p className="text-[9px] text-muted-foreground">
            Click to toggle. Green = Neo can auto-approve. Red = always requires human review.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {neoReasonGroups.map((r) => {
              const isRejected = config.auto_reject_reasons.includes(r.value);
              return (
                <Badge
                  key={r.value}
                  variant="outline"
                  className={cn(
                    "text-[10px] cursor-pointer transition-colors",
                    isRejected
                      ? "bg-destructive/10 border-destructive/40 text-destructive"
                      : "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  )}
                  onClick={() => toggleRejectReason(r.value)}
                >
                  {r.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={() =>
            toast({ title: "Neo Config Saved", description: "AI approval thresholds updated." })
          }
        >
          <Save className="h-3 w-3" /> Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}

interface Policy {
  id: string;
  role: string;
  user_name: string | null;
  reason_group: string;
  max_amount: number;
  can_final_approve: boolean;
}

const policyReasonGroups = [
  { value: "goodwill", label: "Goodwill Gesture" },
  { value: "billing_error", label: "Billing Error" },
  { value: "sla_breach", label: "SLA Breach" },
  { value: "loyalty", label: "Loyalty Retention" },
  { value: "service_outage", label: "Service Outage" },
  { value: "overcharge", label: "Overcharge" },
];

const seedPolicies: Policy[] = [
  { id: "p1", role: "Agent", user_name: null, reason_group: "goodwill", max_amount: 50, can_final_approve: false },
  { id: "p2", role: "Supervisor", user_name: null, reason_group: "billing_error", max_amount: 500, can_final_approve: true },
  { id: "p3", role: "Supervisor", user_name: null, reason_group: "loyalty", max_amount: 750, can_final_approve: false },
  { id: "p4", role: "Admin", user_name: null, reason_group: "sla_breach", max_amount: 2500, can_final_approve: true },
  { id: "p5", role: "Admin", user_name: "Priya Patel", reason_group: "overcharge", max_amount: 5000, can_final_approve: true },
];

function ApprovalPolicyEditor() {
  const [policies, setPolicies] = React.useState<Policy[]>(seedPolicies);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editPolicy, setEditPolicy] = React.useState<Partial<Policy>>({});

  const handleSave = () => {
    if (!editPolicy.role || !editPolicy.reason_group || !editPolicy.max_amount) {
      toast({
        title: "Validation",
        description: "Fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (editPolicy.id) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editPolicy.id ? ({ ...(p as Policy), ...editPolicy } as Policy) : p
        )
      );
    } else {
      setPolicies((prev) => [
        ...prev,
        {
          id: `p${Date.now()}`,
          role: editPolicy.role!,
          user_name: editPolicy.user_name || null,
          reason_group: editPolicy.reason_group!,
          max_amount: editPolicy.max_amount!,
          can_final_approve: editPolicy.can_final_approve ?? false,
        },
      ]);
    }
    toast({ title: "Saved", description: "Approval policy updated." });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Deleted" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" /> Approval Policies
          </CardTitle>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => {
              setEditPolicy({});
              setDialogOpen(true);
            }}
          >
            <Plus className="h-3 w-3" /> Add Policy
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Configure which roles can approve credit requests by reason group and amount threshold.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">User Override</TableHead>
              <TableHead className="text-xs">Reason Group</TableHead>
              <TableHead className="text-xs text-right">Max Amount</TableHead>
              <TableHead className="text-xs">Final Approve</TableHead>
              <TableHead className="text-xs w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => {
                  setEditPolicy(p);
                  setDialogOpen(true);
                }}
              >
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {p.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{p.user_name || "—"}</TableCell>
                <TableCell className="text-xs">
                  {policyReasonGroups.find((r) => r.value === p.reason_group)?.label ||
                    p.reason_group}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatCurrency(p.max_amount)}
                </TableCell>
                <TableCell>
                  {p.can_final_approve ? (
                    <Badge
                      className="text-[9px] bg-success/15 text-success border-success/30"
                      variant="outline"
                    >
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editPolicy?.id ? "Edit" : "Add"} Approval Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select
                value={editPolicy.role || ""}
                onValueChange={(v) => setEditPolicy((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                User Override (optional)
              </label>
              <Input
                className="h-8 text-xs"
                value={editPolicy.user_name || ""}
                onChange={(e) => setEditPolicy((p) => ({ ...p, user_name: e.target.value }))}
                placeholder="Leave blank for all users in role"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reason Group</label>
              <Select
                value={editPolicy.reason_group || ""}
                onValueChange={(v) => setEditPolicy((p) => ({ ...p, reason_group: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {policyReasonGroups.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Max Amount (£)</label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={editPolicy.max_amount || ""}
                onChange={(e) =>
                  setEditPolicy((p) => ({ ...p, max_amount: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Can Final Approve
              </label>
              <Toggle
                checked={editPolicy.can_final_approve ?? false}
                onCheckedChange={(v) => setEditPolicy((p) => ({ ...p, can_final_approve: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
