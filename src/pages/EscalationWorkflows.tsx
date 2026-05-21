import * as React from "react";
import { PageHeader } from "@/components/ui/page-header/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select-pf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Separator } from "@/components/ui/separator/separator";
import { Textarea } from "@/components/ui/textarea/textarea";
import { toast } from "@/components/ui/toast/toaster";
import { assignmentTeams } from "@/data/mock";
import { cn } from "@/lib/cn";
import {
  GitBranch,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  Trash2,
  Pencil,
  ChevronRight,
  Zap,
  Users,
  Copy,
} from "lucide-react";

interface EscalationStep {
  id: string;
  order: number;
  teamId: string;
  timeoutMinutes: number;
  action: "assign" | "notify" | "escalate";
  notifyManager: boolean;
}

interface EscalationWorkflow {
  id: string;
  name: string;
  description: string;
  triggerPriority: string[];
  triggerCustomerTier: string[];
  isActive: boolean;
  steps: EscalationStep[];
  createdAt: string;
  updatedAt: string;
}

const defaultWorkflows: EscalationWorkflow[] = [
  {
    id: "WF001",
    name: "Critical P1 Escalation",
    description:
      "Immediate escalation path for P1 critical outages affecting enterprise customers",
    triggerPriority: ["Critical"],
    triggerCustomerTier: ["Enterprise", "Government"],
    isActive: true,
    steps: [
      { id: "S1", order: 1, teamId: "TEAM-002", timeoutMinutes: 15, action: "assign", notifyManager: true },
      { id: "S2", order: 2, teamId: "TEAM-002", timeoutMinutes: 30, action: "escalate", notifyManager: true },
      { id: "S3", order: 3, teamId: "TEAM-003", timeoutMinutes: 60, action: "notify", notifyManager: true },
    ],
    createdAt: "2025-01-15",
    updatedAt: "2025-02-10",
  },
  {
    id: "WF002",
    name: "Billing Dispute Path",
    description:
      "Handles billing disputes through specialist review and approval chain",
    triggerPriority: ["High", "Medium"],
    triggerCustomerTier: ["Enterprise", "SMB"],
    isActive: true,
    steps: [
      { id: "S4", order: 1, teamId: "TEAM-001", timeoutMinutes: 60, action: "assign", notifyManager: false },
      { id: "S5", order: 2, teamId: "TEAM-003", timeoutMinutes: 120, action: "escalate", notifyManager: true },
    ],
    createdAt: "2025-01-20",
    updatedAt: "2025-02-05",
  },
  {
    id: "WF003",
    name: "General Support Overflow",
    description: "Routes unresolved general queries through support tiers",
    triggerPriority: ["Medium", "Low"],
    triggerCustomerTier: ["Consumer", "SMB"],
    isActive: false,
    steps: [
      { id: "S6", order: 1, teamId: "TEAM-004", timeoutMinutes: 120, action: "assign", notifyManager: false },
      { id: "S7", order: 2, teamId: "TEAM-002", timeoutMinutes: 240, action: "escalate", notifyManager: false },
    ],
    createdAt: "2025-02-01",
    updatedAt: "2025-02-01",
  },
];

const priorities = ["Critical", "High", "Medium", "Low"];
const customerTiers = ["Enterprise", "Government", "SMB", "Consumer"];

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
        "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        checked ? "bg-primary" : "bg-muted",
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

export default function EscalationWorkflows() {
  const [workflows, setWorkflows] =
    React.useState<EscalationWorkflow[]>(defaultWorkflows);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EscalationWorkflow | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formPriorities, setFormPriorities] = React.useState<string[]>([]);
  const [formTiers, setFormTiers] = React.useState<string[]>([]);
  const [formSteps, setFormSteps] = React.useState<EscalationStep[]>([]);
  const [formActive, setFormActive] = React.useState(true);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormPriorities([]);
    setFormTiers([]);
    setFormSteps([
      {
        id: `S${Date.now()}`,
        order: 1,
        teamId: "",
        timeoutMinutes: 30,
        action: "assign",
        notifyManager: false,
      },
    ]);
    setFormActive(true);
    setDialogOpen(true);
  };

  const openEdit = (wf: EscalationWorkflow) => {
    setEditing(wf);
    setFormName(wf.name);
    setFormDescription(wf.description);
    setFormPriorities([...wf.triggerPriority]);
    setFormTiers([...wf.triggerCustomerTier]);
    setFormSteps([...wf.steps]);
    setFormActive(wf.isActive);
    setDialogOpen(true);
  };

  const duplicateWorkflow = (wf: EscalationWorkflow) => {
    const newWf: EscalationWorkflow = {
      ...wf,
      id: `WF${Date.now()}`,
      name: `${wf.name} (Copy)`,
      isActive: false,
      steps: wf.steps.map((s) => ({ ...s, id: `S${Date.now()}${s.order}` })),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setWorkflows((prev) => [...prev, newWf]);
    toast({ title: "Workflow duplicated", variant: "success" });
  };

  const togglePriority = (p: string) => {
    setFormPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleTier = (t: string) => {
    setFormTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addStep = () => {
    setFormSteps((prev) => [
      ...prev,
      {
        id: `S${Date.now()}`,
        order: prev.length + 1,
        teamId: "",
        timeoutMinutes: 30,
        action: "assign",
        notifyManager: false,
      },
    ]);
  };

  const removeStep = (idx: number) => {
    setFormSteps((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const updateStep = (idx: number, patch: Partial<EscalationStep>) => {
    setFormSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  };

  const saveWorkflow = () => {
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (formSteps.length === 0) {
      toast({ title: "At least one step is required", variant: "destructive" });
      return;
    }
    if (formSteps.some((s) => !s.teamId)) {
      toast({ title: "All steps need a team assigned", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString().split("T")[0];
    if (editing) {
      setWorkflows((prev) =>
        prev.map((wf) =>
          wf.id === editing.id
            ? {
                ...wf,
                name: formName,
                description: formDescription,
                triggerPriority: formPriorities,
                triggerCustomerTier: formTiers,
                steps: formSteps,
                isActive: formActive,
                updatedAt: now,
              }
            : wf
        )
      );
      toast({ title: "Workflow updated", variant: "success" });
    } else {
      const newWf: EscalationWorkflow = {
        id: `WF${Date.now()}`,
        name: formName,
        description: formDescription,
        triggerPriority: formPriorities,
        triggerCustomerTier: formTiers,
        isActive: formActive,
        steps: formSteps,
        createdAt: now,
        updatedAt: now,
      };
      setWorkflows((prev) => [...prev, newWf]);
      toast({ title: "Workflow created", variant: "success" });
    }
    setDialogOpen(false);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
    toast({ title: "Workflow deleted", variant: "destructive" });
  };

  const toggleActive = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === id
          ? {
              ...wf,
              isActive: !wf.isActive,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : wf
      )
    );
  };

  const getTeamName = (teamId: string) =>
    assignmentTeams.find((t) => t.id === teamId)?.name ?? teamId;

  const actionColors: Record<string, string> = {
    assign: "bg-primary/10 text-primary border-primary/20",
    escalate: "bg-destructive/10 text-destructive border-destructive/20",
    notify: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Escalation Workflows
          </span>
        }
        description="Define escalation paths, auto-assignment rules, and timeout actions"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        }
      />

      <div className="grid gap-4">
        {workflows.map((wf) => (
          <Card key={wf.id} className={wf.isActive ? "" : "opacity-60"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                    <Badge
                      variant={wf.isActive ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {wf.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {wf.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => duplicateWorkflow(wf)}
                    title="Duplicate workflow"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(wf)}
                    title="Edit workflow"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteWorkflow(wf.id)}
                    title="Delete workflow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Triggers */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Priority:</span>
                  {wf.triggerPriority.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">
                      {p}
                    </Badge>
                  ))}
                  {wf.triggerPriority.length === 0 && (
                    <span className="text-muted-foreground italic">Any</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Tier:</span>
                  {wf.triggerCustomerTier.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                  {wf.triggerCustomerTier.length === 0 && (
                    <span className="text-muted-foreground italic">Any</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Steps visual flow */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {wf.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-3 min-w-[140px]",
                        actionColors[step.action] ?? ""
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {step.action === "assign" && (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                        {step.action === "escalate" && (
                          <ArrowRight className="h-3.5 w-3.5" />
                        )}
                        {step.action === "notify" && (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs font-semibold capitalize">
                          {step.action}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-center">
                        {getTeamName(step.teamId)}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {step.timeoutMinutes}m timeout
                      </div>
                      {step.notifyManager && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] mt-0.5"
                        >
                          + Manager
                        </Badge>
                      )}
                    </div>
                    {idx < wf.steps.length - 1 && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span>Updated: {wf.updatedAt}</span>
                <div className="flex items-center gap-2">
                  <span>{wf.isActive ? "Active" : "Inactive"}</span>
                  <Toggle
                    checked={wf.isActive}
                    onCheckedChange={() => toggleActive(wf.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Workflow" : "New Escalation Workflow"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Critical P1 Path"
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={formActive}
                    onCheckedChange={setFormActive}
                  />
                  <Label>{formActive ? "Active" : "Inactive"}</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe when this workflow triggers..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Trigger Conditions */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Trigger Conditions
              </Label>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Priority Levels
                </Label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={
                        formPriorities.includes(p) ? "default" : "outline"
                      }
                      className="text-xs"
                      onClick={() => togglePriority(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Customer Tiers
                </Label>
                <div className="flex gap-2">
                  {customerTiers.map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={formTiers.includes(t) ? "default" : "outline"}
                      className="text-xs"
                      onClick={() => toggleTier(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Steps Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Escalation Steps
                </Label>
                <Button size="sm" variant="outline" onClick={addStep}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-3">
                {formSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="rounded-lg border bg-muted/30 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Step {idx + 1}
                      </span>
                      {formSteps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeStep(idx)}
                          title="Remove step"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Action</Label>
                        <Select
                          value={step.action}
                          onValueChange={(v) =>
                            updateStep(idx, {
                              action: v as EscalationStep["action"],
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assign">Assign</SelectItem>
                            <SelectItem value="escalate">Escalate</SelectItem>
                            <SelectItem value="notify">Notify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Team</Label>
                        <Select
                          value={step.teamId}
                          onValueChange={(v) =>
                            updateStep(idx, { teamId: v })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignmentTeams.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Timeout (min)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          value={step.timeoutMinutes}
                          onChange={(e) =>
                            updateStep(idx, {
                              timeoutMinutes: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={step.notifyManager}
                        onCheckedChange={(v) =>
                          updateStep(idx, { notifyManager: v })
                        }
                      />
                      <Label className="text-xs">
                        Notify manager on timeout
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWorkflow}>
              {editing ? "Save Changes" : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
