import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Database,
  FileText,
  HardDrive,
  X,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { toast } from "@/components/ui/toast/toaster";

interface Service {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency?: string;
  uptime: string;
}

const services: Service[] = [
  { name: "API Gateway", status: "healthy", latency: "12ms", uptime: "99.99%" },
  { name: "Billing Engine", status: "healthy", latency: "45ms", uptime: "99.97%" },
  { name: "Provisioning Service", status: "healthy", latency: "28ms", uptime: "99.95%" },
  { name: "Subscriber Registry", status: "healthy", latency: "8ms", uptime: "99.99%" },
  { name: "Fault Management", status: "degraded", latency: "156ms", uptime: "99.82%" },
  { name: "Analytics Pipeline", status: "healthy", latency: "89ms", uptime: "99.91%" },
  { name: "Notification Service", status: "healthy", latency: "22ms", uptime: "99.98%" },
  { name: "Audit Logger", status: "healthy", latency: "5ms", uptime: "99.99%" },
];

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  acknowledged: boolean;
}

const mockAlerts: Alert[] = [
  { id: "1", severity: "warning", title: "Elevated API Latency", description: "Fault Management service showing 3x normal response times", time: "4 hours ago", acknowledged: false },
  { id: "2", severity: "info", title: "Certificate Renewal Due", description: "TLS certificate expires in 14 days", time: "1 day ago", acknowledged: true },
];

const loggingMetrics = [
  { label: "Log Events (24h)", value: "2.4M", trend: "+12%", icon: FileText },
  { label: "Metrics Collected", value: "847K", trend: "+8%", icon: Activity },
  { label: "Storage Used", value: "124 GB", trend: "+2%", icon: HardDrive },
  { label: "Retention Period", value: "90 days", trend: "", icon: Database },
];

const integrations = [
  { name: "Elasticsearch", status: "connected" },
  { name: "Prometheus", status: "connected" },
  { name: "Grafana", status: "connected" },
];

const latencyTrend = [
  { label: "00:00", value: 110 },
  { label: "04:00", value: 95 },
  { label: "08:00", value: 140 },
  { label: "12:00", value: 168 },
  { label: "16:00", value: 152 },
  { label: "20:00", value: 132 },
  { label: "24:00", value: 118 },
];

const requestVolume = [
  { label: "00:00", value: 1820 },
  { label: "04:00", value: 1240 },
  { label: "08:00", value: 3120 },
  { label: "12:00", value: 4210 },
  { label: "16:00", value: 3680 },
  { label: "20:00", value: 2950 },
  { label: "24:00", value: 2010 },
];

function getServiceStatusConfig(status: Service["status"]) {
  switch (status) {
    case "healthy":
      return { icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10", label: "Healthy" };
    case "degraded":
      return { icon: AlertCircle, color: "text-warning", bgColor: "bg-warning/10", label: "Degraded" };
    case "down":
      return { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", label: "Down" };
  }
}

function getSeverityConfig(severity: Alert["severity"]) {
  switch (severity) {
    case "critical":
      return { icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/10 border-destructive/20" };
    case "warning":
      return { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10 border-warning/20" };
    case "info":
      return { icon: Bell, color: "text-info", bgColor: "bg-info/10 border-info/20" };
  }
}

function ServiceHealth() {
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Service Health</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {healthyCount} healthy
            </Badge>
            {degradedCount > 0 && (
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                {degradedCount} degraded
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {services.map((service) => {
            const config = getServiceStatusConfig(service.status);
            const StatusIcon = config.icon;
            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-full p-1 ${config.bgColor}`}>
                    <StatusIcon className={`h-3 w-3 ${config.color}`} />
                  </div>
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {service.latency && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {service.latency}
                    </div>
                  )}
                  <span className="w-14 text-right">{service.uptime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsSummary() {
  const activeAlerts = mockAlerts.filter((a) => !a.acknowledged);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <Badge variant="outline" className="text-xs">
            {activeAlerts.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAlerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <CheckCircle2 className="h-4 w-4 text-success" />
            No active alerts
          </div>
        ) : (
          mockAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const SeverityIcon = config.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-md border p-3 ${config.bgColor} ${
                  alert.acknowledged ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <SeverityIcon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {alert.time}
                        {alert.acknowledged && " • Acknowledged"}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() =>
                        toast({ title: "Alert acknowledged", description: alert.title })
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function LoggingMetrics() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Logging &amp; Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {loggingMetrics.map((metric) => (
            <div key={metric.label} className="rounded-md bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <metric.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">{metric.value}</span>
                {metric.trend && (
                  <span className="text-[10px] text-muted-foreground">{metric.trend}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Connected Systems</p>
          <div className="flex flex-wrap gap-2">
            {integrations.map((integration) => (
              <Badge
                key={integration.name}
                variant="outline"
                className="text-xs bg-success/5 border-success/20"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5" />
                {integration.name}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground pt-2 border-t border-border">
          Detailed dashboards available via Grafana integration. Platform logs are immutable and
          tamper-evident.
        </p>
      </CardContent>
    </Card>
  );
}

export default function PlatformObservability() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <Button variant="ghost" size="sm" className="gap-2 self-start" onClick={() => navigate("/platform")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Platform
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Observability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Service health, alerts, and operational monitoring
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">High-level operational visibility.</span>{" "}
          Detailed metrics and dashboards are available via integrated Grafana and Prometheus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Latency (P95)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={latencyTrend} height={220} formatValue={(v) => `${v}ms`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Request Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={requestVolume} height={220} formatValue={(v) => `${v.toLocaleString()}`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ServiceHealth />
        </div>
        <div className="space-y-6">
          <AlertsSummary />
          <LoggingMetrics />
        </div>
      </div>
    </div>
  );
}
