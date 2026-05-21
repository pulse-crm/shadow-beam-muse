import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  FileText,
  Lock,
  Shield,
  Server,
  Clock,
  Globe,
  Activity,
  AlertCircle,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";

const quickLinks = [
  { label: "Identity & Access", href: "/platform/iam", icon: Lock, description: "Users, roles, and permissions" },
  { label: "Audit & Compliance", href: "/platform/audit", icon: FileText, description: "Audit trail and compliance" },
  { label: "Observability", href: "/platform/observability", icon: Eye, description: "Service health and monitoring" },
];

const deploymentDetails = [
  { label: "Deployment Model", value: "Single-Tenant", icon: Server },
  { label: "Hosting Location", value: "UK On-Premises", icon: Globe },
  { label: "Data Sovereignty", value: "UK Jurisdiction", icon: Shield },
  { label: "Environment Isolation", value: "Full Separation", icon: Lock },
];

interface Indicator {
  label: string;
  value: string | number;
  status: "healthy" | "warning" | "critical";
  icon: typeof Activity;
}

const indicators: Indicator[] = [
  { label: "System Uptime", value: "99.97%", status: "healthy", icon: Activity },
  { label: "Active Alerts", value: 2, status: "warning", icon: Bell },
  { label: "Audit Events (24h)", value: 1247, status: "healthy", icon: FileText },
  { label: "Security Status", value: "Normal", status: "healthy", icon: ShieldCheck },
];

const recentEvents = [
  { id: "1", type: "info", message: "Scheduled maintenance window completed", time: "2 hours ago" },
  { id: "2", type: "warning", message: "Elevated API response times detected", time: "4 hours ago" },
  { id: "3", type: "success", message: "Security certificate renewed successfully", time: "1 day ago" },
];

const emerald = "bg-success/10 text-success border-success/20";
const amber = "bg-warning/10 text-warning border-warning/20";

function getStatusColor(status: Indicator["status"]) {
  switch (status) {
    case "healthy":
      return emerald;
    case "warning":
      return amber;
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case "warning":
      return <AlertCircle className="h-3 w-3 text-warning" />;
    case "success":
      return <CheckCircle2 className="h-3 w-3 text-success" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
}

function PlatformStatus() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
          <Badge variant="outline" className={emerald}>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-lg font-semibold">99.97%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Environment</p>
            <p className="text-sm font-medium">Production</p>
          </div>
        </div>
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Last Incident</p>
          <p className="text-sm">14 days ago - Scheduled maintenance</p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Server className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Single-tenant • UK On-premises • Production</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DeploymentContext() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Deployment Context</CardTitle>
          <Badge variant="outline" className={emerald}>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deploymentDetails.map((detail) => (
            <div
              key={detail.label}
              className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <detail.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{detail.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{detail.value}</span>
                <CheckCircle2 className="h-3 w-3 text-success" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This platform is deployed in a fully isolated, single-tenant environment within UK
            sovereign infrastructure. Production and non-production environments are completely
            separated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationalIndicators() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Operational Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {indicators.map((indicator) => (
            <div key={indicator.label} className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <indicator.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{indicator.label}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-semibold">{indicator.value}</span>
                <Badge variant="outline" className={`text-[10px] h-4 ${getStatusColor(indicator.status)}`}>
                  {indicator.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Recent Events</p>
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-2 rounded-md bg-muted/30 px-3 py-2"
              >
                {getEventIcon(event.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{event.message}</p>
                  <p className="text-[10px] text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Platform() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Platform</h1>
            <Badge variant="outline" className={emerald}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Production Ready
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Identity, access, and operational controls for the PULSE platform
          </p>
        </div>
      </div>

      {/* Message banner */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Controlled, observable, and production-ready.
          </span>{" "}
          This platform is deployed in a single-tenant, UK-sovereign environment with full audit
          traceability.
        </p>
      </div>

      {/* Quick navigation */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link) => (
          <Button
            key={link.label}
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate(link.href)}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent p-2">
                <link.icon className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformStatus />
        <DeploymentContext />
      </div>

      <OperationalIndicators />
    </div>
  );
}
