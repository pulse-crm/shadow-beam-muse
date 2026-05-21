import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Shield,
  Bot,
  Download,
  FileText,
  Settings2,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select-pf";
import { toast } from "@/components/ui/toast/toaster";

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "user" | "system" | "service";
  action: string;
  description: string;
  domain: "iam" | "billing" | "subscribers" | "config" | "platform";
}

const mockEvents: AuditEvent[] = [
  { id: "1", timestamp: "2025-02-04T10:32:00Z", actor: "Sarah Chen", actorType: "user", action: "Role Assigned", description: "Assigned 'Ops' role to user m.johnson@enterprise.com", domain: "iam" },
  { id: "2", timestamp: "2025-02-04T10:28:00Z", actor: "Billing Service", actorType: "service", action: "Invoice Generated", description: "Monthly billing run completed for 2,847 subscribers", domain: "billing" },
  { id: "3", timestamp: "2025-02-04T10:15:00Z", actor: "Marcus Johnson", actorType: "user", action: "Subscriber Modified", description: "Updated service package for Acme Corp", domain: "subscribers" },
  { id: "4", timestamp: "2025-02-04T09:45:00Z", actor: "System", actorType: "system", action: "Config Change", description: "Tariff rate schedule updated for Q1 2025", domain: "config" },
  { id: "5", timestamp: "2025-02-04T09:30:00Z", actor: "David Park", actorType: "user", action: "Access Reviewed", description: "Completed quarterly access review for Finance team", domain: "iam" },
  { id: "6", timestamp: "2025-02-04T09:00:00Z", actor: "System", actorType: "system", action: "Maintenance Window", description: "Scheduled maintenance completed successfully", domain: "platform" },
  { id: "7", timestamp: "2025-02-04T08:30:00Z", actor: "Provisioning Service", actorType: "service", action: "Order Completed", description: "Provisioning workflow completed for 12 services", domain: "subscribers" },
  { id: "8", timestamp: "2025-02-04T08:00:00Z", actor: "Sarah Chen", actorType: "user", action: "Login", description: "Authenticated via Azure AD SSO", domain: "iam" },
];

const domainConfig: Record<
  AuditEvent["domain"],
  { label: string; icon: typeof FileText; color: string }
> = {
  iam: { label: "IAM", icon: Lock, color: "text-purple-500" },
  billing: { label: "Billing", icon: FileText, color: "text-success" },
  subscribers: { label: "Subscribers", icon: Users, color: "text-info" },
  config: { label: "Config", icon: Settings2, color: "text-warning" },
  platform: { label: "Platform", icon: Bot, color: "text-primary" },
};

const complianceStatus = [
  { label: "Immutable Audit Log", status: "compliant" },
  { label: "Access Controls", status: "compliant" },
  { label: "Data Encryption", status: "compliant" },
  { label: "Quarterly Review", status: "compliant" },
];

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getActorIcon(type: AuditEvent["actorType"]) {
  switch (type) {
    case "user":
      return <User className="h-3 w-3" />;
    case "system":
      return <Bot className="h-3 w-3" />;
    case "service":
      return <Settings2 className="h-3 w-3" />;
  }
}

function AuditEventsList() {
  const [domainFilter, setDomainFilter] = useState<string>("all");

  const filteredEvents =
    domainFilter === "all" ? mockEvents : mockEvents.filter((e) => e.domain === domainFilter);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-[130px]">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Filter domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="iam">IAM</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() =>
                toast({
                  title: "Export started",
                  description: `${filteredEvents.length} audit events exported.`,
                  variant: "success",
                })
              }
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[500px] overflow-y-auto scrollbar-thin">
          <div className="space-y-1 px-6 pb-4">
            {filteredEvents.map((event) => {
              const config = domainConfig[event.domain];
              const DomainIcon = config.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActorIcon(event.actorType)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{event.action}</span>
                      <Badge variant="outline" className={`text-[10px] h-4 ${config.color}`}>
                        <DomainIcon className="mr-1 h-2.5 w-2.5" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                      <span>{event.actor}</span>
                      <span>•</span>
                      <span>
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlatformAudit() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <Button variant="ghost" size="sm" className="gap-2 self-start" onClick={() => navigate("/platform")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Platform
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit &amp; Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Traceability, accountability, and compliance status
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Immutable and tamper-evident.</span>{" "}
          All platform actions are logged with actor, timestamp, and full context for compliance and
          forensic analysis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AuditEventsList />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20"
                >
                  <Shield className="mr-1 h-3 w-3" />
                  Compliant
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {complianceStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                >
                  <span className="text-sm">{item.label}</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Retention Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Audit Logs</span>
                  <span className="text-sm font-medium">7 years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Access Logs</span>
                  <span className="text-sm font-medium">2 years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">System Logs</span>
                  <span className="text-sm font-medium">90 days</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Write-once storage with integrity verification</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
