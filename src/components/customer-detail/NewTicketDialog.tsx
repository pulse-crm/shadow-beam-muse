import * as React from "react";
import {
  TicketPlus,
  Phone,
  Mail,
  Globe,
  Bot,
  Zap,
  Users,
  Smartphone,
  Store,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Textarea } from "@/components/ui/textarea/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio/radio-group";
import { SearchablePicker } from "@/components/ui/searchable-picker/searchable-picker";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast/toaster";
import { type Customer, type Subscription, type Ticket, assignmentTeams } from "@/data/mock";

type TicketChannel = "Phone" | "Portal" | "Email" | "Chatbot" | "SMS" | "In-Store";

const channelIcons: Record<TicketChannel, React.ElementType> = {
  Phone,
  Portal: Globe,
  Email: Mail,
  Chatbot: Bot,
  SMS: Smartphone,
  "In-Store": Store,
};

interface CaseTemplate {
  id: string;
  name: string;
  category: string;
  defaultPriority: Ticket["priority"];
  estimatedResolutionHours: number;
  defaultSkills: string[];
  description: string;
  steps: string[];
}

const caseTemplates: CaseTemplate[] = [
  {
    id: "TPL-BILL",
    name: "Billing Dispute",
    category: "Billing",
    defaultPriority: "Medium",
    estimatedResolutionHours: 24,
    defaultSkills: ["Billing", "Account"],
    description: "Customer is disputing a charge on a recent invoice.",
    steps: ["Verify the disputed invoice", "Check payment history", "Raise adjustment if valid", "Confirm resolution with customer"],
  },
  {
    id: "TPL-NET",
    name: "Network Outage",
    category: "Network",
    defaultPriority: "Critical",
    estimatedResolutionHours: 4,
    defaultSkills: ["Network", "Field"],
    description: "Customer reporting loss of connectivity.",
    steps: ["Check line status", "Run remote diagnostics", "Check area outage map", "Dispatch engineer if needed"],
  },
  {
    id: "TPL-PROV",
    name: "Provisioning Delay",
    category: "Provisioning",
    defaultPriority: "High",
    estimatedResolutionHours: 48,
    defaultSkills: ["Provisioning", "Onboarding"],
    description: "New service activation is delayed.",
    steps: ["Confirm order status", "Check wayleave / survey", "Escalate to provisioning team", "Update customer ETA"],
  },
];

interface AgentInfo {
  agentName: string;
  availability: "Available" | "Busy" | "Offline";
  currentLoad: number;
  maxLoad: number;
  skills: string[];
}

const agentDirectory: AgentInfo[] = (() => {
  const names = Array.from(new Set(assignmentTeams.flatMap((t) => t.members)));
  const avail: AgentInfo["availability"][] = ["Available", "Busy", "Available", "Offline"];
  const skillPool = ["Billing", "Account", "Network", "Field", "Provisioning", "Onboarding"];
  return names.map((name, i) => ({
    agentName: name,
    availability: avail[i % avail.length],
    currentLoad: 4 + ((name.length * 3) % 10),
    maxLoad: 16,
    skills: [skillPool[i % skillPool.length], skillPool[(i + 2) % skillPool.length]],
  }));
})();

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  customerServices: Subscription[];
  onTicketCreated: (ticket: Ticket) => void;
}

export function NewTicketDialog({
  open,
  onOpenChange,
  customer,
  customerServices,
  onTicketCreated,
}: NewTicketDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [channel, setChannel] = React.useState<TicketChannel>("Phone");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [showAi, setShowAi] = React.useState(false);
  const [relatedServiceId, setRelatedServiceId] = React.useState("");

  const [manualAssignOpen, setManualAssignOpen] = React.useState(false);
  const [assignMode, setAssignMode] = React.useState<"agent" | "team">("agent");
  const [assignTargetAgent, setAssignTargetAgent] = React.useState("");
  const [assignTargetTeam, setAssignTargetTeam] = React.useState("");
  const [manualAssignee, setManualAssignee] = React.useState<string | null>(null);

  const template = caseTemplates.find((t) => t.id === selectedTemplate);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const tpl = caseTemplates.find((t) => t.id === id);
    if (tpl) setDescription(tpl.description);
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setShowAi(val.length > 5);
  };

  const matchedAgent = template
    ? agentDirectory.find(
        (a) => a.availability !== "Offline" && template.defaultSkills.some((s) => a.skills.includes(s))
      )
    : null;

  const handleManualAssignConfirm = () => {
    if (assignMode === "agent" && assignTargetAgent) {
      setManualAssignee(assignTargetAgent);
      toast({ title: "Agent Selected", description: `Ticket will be assigned to ${assignTargetAgent}.` });
    } else if (assignMode === "team" && assignTargetTeam) {
      const team = assignmentTeams.find((t) => t.name === assignTargetTeam);
      const members = team?.members || [];
      const pick = members[0] || "Unassigned";
      setManualAssignee(`${assignTargetTeam} (${pick})`);
      toast({
        title: "Team Selected",
        description: `Ticket will be distributed to ${assignTargetTeam} (${members.length} members).`,
      });
    }
    setManualAssignOpen(false);
  };

  const handleCreate = () => {
    const relatedService = customerServices.find((s) => s.id === relatedServiceId);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      subject: subject || "New Ticket",
      customer: customer.name,
      customerId: customer.id,
      priority: template?.defaultPriority || "Medium",
      status: "Open",
      category: template?.category || "Billing",
      assignee: manualAssignee || matchedAgent?.agentName || "Unassigned",
      createdAt: now,
      slaDeadline: new Date(
        Date.now() + (template?.estimatedResolutionHours || 24) * 3600000
      ).toISOString(),
    };
    onTicketCreated(newTicket);
    onOpenChange(false);
    setSubject("");
    setDescription("");
    setSelectedTemplate("");
    setChannel("Phone");
    setRelatedServiceId("");
    setManualAssignee(null);
    setShowAi(false);
    toast({
      title: "Ticket Created",
      description: `Ticket ${newTicket.id} created for ${customer.name}${
        relatedService ? ` (re: ${relatedService.product})` : ""
      }.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketPlus className="h-5 w-5 text-primary" /> Create New Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Context Banner */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{customer.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {customer.accountNumber} · {customer.segment} · {customer.type}
                    </p>
                  </div>
                </div>
                <StatusBadge status={customer.status} />
              </div>
              <div className="flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </span>
              </div>
            </div>

            {/* Related Service */}
            {customerServices.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Related Service (optional)
                </label>
                <Select value={relatedServiceId} onValueChange={setRelatedServiceId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Link to a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customerServices.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.product} ({s.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Channel */}
            <div data-tour="customer-new-ticket-channel" className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Channel</label>
              <div className="flex gap-2 flex-wrap">
                {(["Phone", "Portal", "Email", "Chatbot", "SMS", "In-Store"] as TicketChannel[]).map(
                  (ch) => {
                    const Icon = channelIcons[ch] || Globe;
                    return (
                      <Button
                        key={ch}
                        variant={channel === ch ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => setChannel(ch)}
                      >
                        <Icon className="h-3.5 w-3.5" /> {ch}
                      </Button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Template */}
            <div data-tour="customer-new-ticket-template" className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Case Template</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {caseTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template steps */}
            {template && (
              <div className="p-3 rounded-lg bg-accent/30 space-y-2">
                <p className="text-xs font-medium">Template Steps:</p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-0.5">
                  {template.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>
                    Priority: <strong>{template.defaultPriority}</strong>
                  </span>
                  <span>
                    Est. Resolution: <strong>{template.estimatedResolutionHours}h</strong>
                  </span>
                  <span>
                    Skills: <strong>{template.defaultSkills.join(", ")}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Subject */}
            <div data-tour="customer-new-ticket-subject" className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Input
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Describe the issue..."
              />
            </div>

            {/* AI categorization preview */}
            {showAi && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">AI Categorization Preview</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 border-primary/30">
                    <Zap className="h-3 w-3" /> Category: {template?.category || "Billing Dispute"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 border-primary/30">
                    Confidence: 87%
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 border-primary/30">
                    Suggested Priority: {template?.defaultPriority || "Medium"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-6 text-[10px]"
                    onClick={() => toast({ title: "AI Suggestion Accepted" })}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px]"
                    onClick={() => toast({ title: "Override mode enabled" })}
                  >
                    Override
                  </Button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide details..."
              />
            </div>

            {/* Skills-based routing preview + manual override */}
            {matchedAgent && (
              <div className="p-3 rounded-lg bg-accent/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Auto-Assignment Preview</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Best match: <strong>{matchedAgent.agentName}</strong> — Load:{" "}
                  {matchedAgent.currentLoad}/{matchedAgent.maxLoad} —
                  <StatusBadge status={matchedAgent.availability} className="ml-1" />
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Skills: {matchedAgent.skills.join(", ")}
                </p>
                {manualAssignee && (
                  <p className="text-[10px] text-primary font-medium">
                    ✓ Manual override: {manualAssignee}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-6 text-[10px]"
                    onClick={() => {
                      setManualAssignee(null);
                      toast({
                        title: "Auto-assigned",
                        description: `Ticket will be assigned to ${matchedAgent.agentName}`,
                      });
                    }}
                  >
                    Accept Auto-Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px]"
                    onClick={() => {
                      setAssignMode("agent");
                      setAssignTargetAgent("");
                      setAssignTargetTeam("");
                      setManualAssignOpen(true);
                    }}
                  >
                    Manual Assign
                  </Button>
                </div>
              </div>
            )}

            <Button data-tour="customer-new-ticket-submit" className="w-full" onClick={handleCreate}>
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Assign Dialog */}
      <Dialog open={manualAssignOpen} onOpenChange={setManualAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Manual Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Choose to assign this ticket to an individual agent or distribute to a team.
            </p>
            <RadioGroup
              value={assignMode}
              onValueChange={(v) => setAssignMode(v as "agent" | "team")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="agent" id="ma-agent" />
                <Label htmlFor="ma-agent" className="text-xs">
                  Assign to Agent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="ma-team" />
                <Label htmlFor="ma-team" className="text-xs">
                  Distribute to Team
                </Label>
              </div>
            </RadioGroup>

            {assignMode === "agent" ? (
              <SearchablePicker
                options={agentDirectory
                  .filter((a) => a.availability !== "Offline")
                  .map((a) => ({
                    value: a.agentName,
                    label: a.agentName,
                    description: `${a.availability} · Load: ${a.currentLoad}/${a.maxLoad}`,
                  }))}
                value={assignTargetAgent}
                onValueChange={setAssignTargetAgent}
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
                  value={assignTargetTeam}
                  onValueChange={setAssignTargetTeam}
                  placeholder="Search teams..."
                />
                {assignTargetTeam &&
                  (() => {
                    const team = assignmentTeams.find((t) => t.name === assignTargetTeam);
                    const members = team?.members || [];
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
              onClick={() => setManualAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleManualAssignConfirm}
              disabled={assignMode === "agent" ? !assignTargetAgent : !assignTargetTeam}
            >
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
