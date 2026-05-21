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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Separator } from "@/components/ui/separator/separator";
import { Textarea } from "@/components/ui/textarea/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible/collapsible";
import { toast } from "@/components/ui/toast/toaster";
import { assignmentTeams } from "@/data/mock";
import { cn } from "@/lib/cn";
import {
  Timer,
  Plus,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface SlaTarget {
  priority: string;
  responseMinutes: number;
  resolutionMinutes: number;
}

interface SlaPolicy {
  id: string;
  name: string;
  description: string;
  customerTiers: string[];
  assignedTeams: string[];
  isActive: boolean;
  targets: SlaTarget[];
  breachAction: string;
  createdAt: string;
  updatedAt: string;
}

const seedPolicies: SlaPolicy[] = [
  {
    id: "SLA001",
    name: "Enterprise Premium SLA",
    description:
      "Premium SLA for enterprise and government customers with strict response/resolution targets",
    customerTiers: ["Enterprise", "Government"],
    assignedTeams: ["TEAM-002", "TEAM-003"],
    isActive: true,
    targets: [
      { priority: "Critical", responseMinutes: 15, resolutionMinutes: 120 },
      { priority: "High", responseMinutes: 30, resolutionMinutes: 240 },
      { priority: "Medium", responseMinutes: 60, resolutionMinutes: 480 },
      { priority: "Low", responseMinutes: 120, resolutionMinutes: 1440 },
    ],
    breachAction: "Escalate to Senior Tech Ops and notify account manager",
    createdAt: "2025-01-01",
    updatedAt: "2025-02-10",
  },
  {
    id: "SLA002",
    name: "Standard Business SLA",
    description: "Standard SLA for SMB customers with balanced response times",
    customerTiers: ["SMB"],
    assignedTeams: ["TEAM-001", "TEAM-004"],
    isActive: true,
    targets: [
      { priority: "Critical", responseMinutes: 30, resolutionMinutes: 240 },
      { priority: "High", responseMinutes: 60, resolutionMinutes: 480 },
      { priority: "Medium", responseMinutes: 120, resolutionMinutes: 1440 },
      { priority: "Low", responseMinutes: 240, resolutionMinutes: 2880 },
    ],
    breachAction: "Notify supervisor and flag on dashboard",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15",
  },
  {
    id: "SLA003",
    name: "Consumer Basic SLA",
    description: "Basic SLA for consumer residential customers",
    customerTiers: ["Consumer"],
    assignedTeams: ["TEAM-004"],
    isActive: true,
    targets: [
      { priority: "Critical", responseMinutes: 60, resolutionMinutes: 480 },
      { priority: "High", responseMinutes: 120, resolutionMinutes: 1440 },
      { priority: "Medium", responseMinutes: 240, resolutionMinutes: 2880 },
      { priority: "Low", responseMinutes: 480, resolutionMinutes: 4320 },
    ],
    breachAction: "Auto-escalate to general support team lead",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
];

const allPriorities = ["Critical", "High", "Medium", "Low"];
const customerTiers = ["Enterprise", "Government", "SMB", "Consumer"];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440)
    return `${Math.floor(minutes / 60)}h ${
      minutes % 60 > 0 ? `${minutes % 60}m` : ""
    }`.trim();
  const days = Math.floor(minutes / 1440);
  const remaining = minutes % 1440;
  return `${days}d ${remaining > 0 ? formatDuration(remaining) : ""}`.trim();
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

export default function SlaPolicies() {
  const [policies, setPolicies] = React.useState<SlaPolicy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SlaPolicy | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formTiers, setFormTiers] = React.useState<string[]>([]);
  const [formTeams, setFormTeams] = React.useState<string[]>([]);
  const [formTargets, setFormTargets] = React.useState<SlaTarget[]>([]);
  const [formBreach, setFormBreach] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Seed local store (replaces supabase fetch/seed)
    setPolicies(seedPolicies);
    setLoading(false);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormTiers([]);
    setFormTeams([]);
    setFormTargets(
      allPriorities.map((p) => ({
        priority: p,
        responseMinutes: 60,
        resolutionMinutes: 480,
      }))
    );
    setFormBreach("");
    setFormActive(true);
    setDialogOpen(true);
  };

  const openEdit = (pol: SlaPolicy) => {
    setEditing(pol);
    setFormName(pol.name);
    setFormDescription(pol.description);
    setFormTiers([...pol.customerTiers]);
    setFormTeams([...pol.assignedTeams]);
    setFormTargets([...pol.targets]);
    setFormBreach(pol.breachAction);
    setFormActive(pol.isActive);
    setDialogOpen(true);
  };

  const toggleTier = (t: string) =>
    setFormTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const toggleTeam = (id: string) =>
    setFormTeams((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const updateTarget = (idx: number, patch: Partial<SlaTarget>) => {
    setFormTargets((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, ...patch } : t))
    );
  };

  const savePolicy = () => {
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const now = new Date().toISOString().split("T")[0];
    if (editing) {
      const updated: SlaPolicy = {
        ...editing,
        name: formName,
        description: formDescription,
        customerTiers: formTiers,
        assignedTeams: formTeams,
        targets: formTargets,
        breachAction: formBreach,
        isActive: formActive,
        updatedAt: now,
      };
      setPolicies((prev) =>
        prev.map((p) => (p.id === editing.id ? updated : p))
      );
      toast({ title: "Policy updated", variant: "success" });
    } else {
      const newPolicy: SlaPolicy = {
        id: `SLA${Date.now()}`,
        name: formName,
        description: formDescription,
        customerTiers: formTiers,
        assignedTeams: formTeams,
        isActive: formActive,
        targets: formTargets,
        breachAction: formBreach,
        createdAt: now,
        updatedAt: now,
      };
      setPolicies((prev) => [...prev, newPolicy]);
      toast({ title: "Policy created", variant: "success" });
    }
    setDialogOpen(false);
  };

  const deletePolicy = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Policy deleted", variant: "destructive" });
  };

  const toggleActive = (id: string) => {
    const now = new Date().toISOString().split("T")[0];
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive, updatedAt: now } : p
      )
    );
  };

  const getTeamName = (id: string) =>
    assignmentTeams.find((t) => t.id === id)?.name ?? id;

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        Loading SLA policies…
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary" />
            SLA Policy Management
          </span>
        }
        description="Define response and resolution targets per priority, customer tier, and team"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Policy
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {policies.filter((p) => p.isActive).length}
              </p>
              <p className="text-xs text-muted-foreground">Active Policies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {policies
                  .find(
                    (p) =>
                      p.isActive && p.customerTiers.includes("Enterprise")
                  )
                  ?.targets.find((t) => t.priority === "Critical")
                  ?.responseMinutes ?? "—"}
                m
              </p>
              <p className="text-xs text-muted-foreground">
                Fastest P1 Response
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {policies.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Policies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy List */}
      <div className="space-y-3">
        {policies.map((pol) => (
          <Collapsible
            key={pol.id}
            open={expandedId === pol.id}
            onOpenChange={() =>
              setExpandedId(expandedId === pol.id ? null : pol.id)
            }
          >
            <Card className={pol.isActive ? "" : "opacity-60"}>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="cursor-pointer pb-3 hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedId === pol.id ? "" : "-rotate-90"
                        )}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {pol.name}
                          </CardTitle>
                          <Badge
                            variant={pol.isActive ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {pol.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pol.description}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          {pol.customerTiers.map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(pol)}
                        title="Edit policy"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deletePolicy(pol.id)}
                        title="Delete policy"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Toggle
                        checked={pol.isActive}
                        onCheckedChange={() => toggleActive(pol.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Priority</TableHead>
                        <TableHead className="text-xs">
                          Response Time
                        </TableHead>
                        <TableHead className="text-xs">
                          Resolution Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pol.targets.map((t) => (
                        <TableRow key={t.priority}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                t.priority === "Critical" &&
                                  "border-destructive/50 text-destructive",
                                t.priority === "High" &&
                                  "border-warning/50 text-warning"
                              )}
                            >
                              {t.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatDuration(t.responseMinutes)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatDuration(t.resolutionMinutes)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        Assigned Teams:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pol.assignedTeams.map((id) => (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {getTeamName(id)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Breach Action:
                      </span>
                      <p className="mt-0.5 text-foreground">
                        {pol.breachAction}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    Created: {pol.createdAt} · Updated: {pol.updatedAt}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit SLA Policy" : "New SLA Policy"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Enterprise Premium SLA"
                />
              </div>
              <div className="flex items-end gap-3">
                <Toggle
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
                <Label>{formActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Applies To</Label>
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
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Teams</Label>
                <div className="flex flex-wrap gap-2">
                  {assignmentTeams.map((t) => (
                    <Button
                      key={t.id}
                      size="sm"
                      variant={
                        formTeams.includes(t.id) ? "default" : "outline"
                      }
                      className="text-xs"
                      onClick={() => toggleTeam(t.id)}
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Response & Resolution Targets
              </Label>
              <div className="space-y-2">
                {formTargets.map((t, idx) => (
                  <div
                    key={t.priority}
                    className="grid grid-cols-3 gap-3 items-center"
                  >
                    <Badge
                      variant="outline"
                      className="justify-center text-xs py-1.5"
                    >
                      {t.priority}
                    </Badge>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Response (min)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={t.responseMinutes}
                        onChange={(e) =>
                          updateTarget(idx, {
                            responseMinutes: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Resolution (min)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={t.resolutionMinutes}
                        onChange={(e) =>
                          updateTarget(idx, {
                            resolutionMinutes: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Breach Action</Label>
              <Textarea
                value={formBreach}
                onChange={(e) => setFormBreach(e.target.value)}
                placeholder="What happens when SLA is breached..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePolicy}>
              {editing ? "Save Changes" : "Create Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
