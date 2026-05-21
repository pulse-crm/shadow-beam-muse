import { PageHeader } from "@/components/ui/page-header/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Progress } from "@/components/ui/progress/progress";
import {
  Activity,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Mail,
  MessageSquare,
  Network,
  Radio,
  Server,
  Shield,
  Smartphone,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  External system data                                               */
/* ------------------------------------------------------------------ */

interface ExternalSystemProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  integrationStatus: "connected" | "partial" | "planned";
  migrationPhase: "coexist" | "migrating" | "deprecated" | "stable";
  dataFlows: {
    direction: "inbound" | "outbound" | "bidirectional";
    type: "API" | "Event" | "Batch" | "Webhook";
    description: string;
  }[];
  metrics?: {
    label: string;
    value: string;
  }[];
}

const leftSystems: ExternalSystemProps[] = [
  {
    id: "salesforce",
    name: "Salesforce CRM",
    description:
      "Customer records, opportunities, and account management. PULSE reads customer context but does not duplicate CRM functions.",
    icon: Building2,
    category: "CRM & Sales",
    integrationStatus: "connected",
    migrationPhase: "coexist",
    dataFlows: [
      { direction: "inbound", type: "API", description: "Customer context sync" },
      { direction: "outbound", type: "Event", description: "Operational events" },
    ],
    metrics: [
      { label: "Sync", value: "Real-time" },
      { label: "Records", value: "1.2M" },
    ],
  },
  {
    id: "payments",
    name: "Payment Gateway",
    description:
      "Stripe/Adyen integration for payment processing. PULSE orchestrates billing, gateway handles transactions.",
    icon: CreditCard,
    category: "Financial Services",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "outbound", type: "API", description: "Payment requests" },
      { direction: "inbound", type: "Webhook", description: "Transaction status" },
    ],
    metrics: [
      { label: "Providers", value: "2" },
      { label: "Uptime", value: "99.99%" },
    ],
  },
  {
    id: "vision",
    name: "Vision AI Platform",
    description:
      "Predictive analytics and ML models. Insights are embedded into PULSE operational workflows.",
    icon: Brain,
    category: "Intelligence",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "outbound", type: "Event", description: "Operational data feed" },
      { direction: "inbound", type: "API", description: "Predictions & insights" },
    ],
    metrics: [
      { label: "Models", value: "7 active" },
      { label: "Latency", value: "< 200ms" },
    ],
  },
  {
    id: "legacy-billing",
    name: "Legacy Billing System",
    description:
      "Heritage billing platform. Gradual migration of accounts to PULSE billing engine.",
    icon: Server,
    category: "Legacy Systems",
    integrationStatus: "partial",
    migrationPhase: "deprecated",
    dataFlows: [
      { direction: "bidirectional", type: "Batch", description: "Account migration" },
      { direction: "inbound", type: "API", description: "Historical data" },
    ],
    metrics: [
      { label: "Migrated", value: "65%" },
      { label: "ETA", value: "Q4 2024" },
    ],
  },
];

const rightSystems: ExternalSystemProps[] = [
  {
    id: "network-oss",
    name: "Network OSS",
    description:
      "HLR, HSS, PCRF, and OCS integration for subscriber provisioning and network inventory.",
    icon: Network,
    category: "Network Operations",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "outbound", type: "API", description: "Provisioning commands" },
      { direction: "inbound", type: "Event", description: "Network events" },
    ],
    metrics: [
      { label: "Elements", value: "847" },
      { label: "Latency", value: "45ms" },
    ],
  },
  {
    id: "comms-platform",
    name: "Communications Platform",
    description: "Twilio/Vonage for customer notifications, SMS, and voice services.",
    icon: MessageSquare,
    category: "Communications",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "outbound", type: "API", description: "Message dispatch" },
      { direction: "inbound", type: "Webhook", description: "Delivery receipts" },
    ],
    metrics: [
      { label: "Channels", value: "SMS, Email" },
      { label: "Volume", value: "50K/day" },
    ],
  },
  {
    id: "email-platform",
    name: "Email Service",
    description: "SendGrid/Postmark for transactional and marketing email delivery.",
    icon: Mail,
    category: "Communications",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "outbound", type: "API", description: "Email dispatch" },
      { direction: "inbound", type: "Webhook", description: "Open/click events" },
    ],
    metrics: [{ label: "Deliverability", value: "99.2%" }],
  },
  {
    id: "mobile-apps",
    name: "Mobile & Self-Service",
    description: "Customer-facing mobile apps and web portal consuming PULSE APIs.",
    icon: Smartphone,
    category: "Customer Channels",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "inbound", type: "API", description: "Customer requests" },
      { direction: "outbound", type: "API", description: "Account data" },
    ],
    metrics: [
      { label: "MAU", value: "890K" },
      { label: "API calls", value: "2.3M/day" },
    ],
  },
  {
    id: "partner-apis",
    name: "Partner Gateway",
    description: "B2B APIs for wholesale partners, MVNOs, and enterprise integrations.",
    icon: Globe,
    category: "Partner Ecosystem",
    integrationStatus: "connected",
    migrationPhase: "stable",
    dataFlows: [
      { direction: "bidirectional", type: "API", description: "Partner operations" },
    ],
    metrics: [
      { label: "Partners", value: "23" },
      { label: "Transactions", value: "145K/day" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  PULSE core services                                                */
/* ------------------------------------------------------------------ */

interface CoreService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "migrating" | "planned";
}

const coreServices: CoreService[] = [
  { id: "subscriber-mgmt", name: "Subscriber Management", description: "Customer lifecycle & identity", icon: Users, status: "active" },
  { id: "billing-engine", name: "Billing Engine", description: "Usage rating & invoicing", icon: CreditCard, status: "active" },
  { id: "provisioning", name: "Provisioning", description: "Service activation & network", icon: Workflow, status: "active" },
  { id: "assurance", name: "Fault & Assurance", description: "Network monitoring & SLA", icon: Activity, status: "active" },
  { id: "event-bus", name: "Event Bus", description: "Real-time event streaming", icon: Zap, status: "active" },
  { id: "data-layer", name: "Operational Data", description: "Unified data platform", icon: Database, status: "migrating" },
  { id: "api-gateway", name: "API Gateway", description: "External API management", icon: Server, status: "active" },
  { id: "security", name: "Security & Auth", description: "Identity & access control", icon: Shield, status: "active" },
];

function PulseCoreServices() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Active
          </Badge>
        );
      case "migrating":
        return (
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
            Migrating
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
            Planned
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-primary">PULSE Core</h3>
          <p className="text-xs text-muted-foreground">Operations Control Platform</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {coreServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-lg border bg-card p-3 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <service.icon className="h-4 w-4 text-primary" />
                </div>
                {getStatusBadge(service.status)}
              </div>
              <h4 className="text-xs font-medium leading-tight">{service.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{service.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  External system card                                               */
/* ------------------------------------------------------------------ */

function ExternalSystem({
  system,
  position,
}: {
  system: ExternalSystemProps;
  position: "left" | "right";
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "partial":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "planned":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getMigrationBadge = (phase: string) => {
    switch (phase) {
      case "coexist":
        return { label: "Coexisting", color: "bg-primary/10 text-primary border-primary/20" };
      case "migrating":
        return { label: "Migrating", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "deprecated":
        return { label: "Sunsetting", color: "bg-destructive/10 text-destructive border-destructive/20" };
      case "stable":
        return { label: "Stable", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      default:
        return { label: phase, color: "bg-muted text-muted-foreground border-border" };
    }
  };

  const getFlowIcon = (direction: string) => {
    switch (direction) {
      case "inbound":
        return <ArrowDown className="h-3 w-3" />;
      case "outbound":
        return <ArrowUp className="h-3 w-3" />;
      case "bidirectional":
        return <ArrowLeftRight className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const migration = getMigrationBadge(system.migrationPhase);

  return (
    <Card className="transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent p-2.5 shrink-0">
            <system.icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm">{system.name}</h4>
                <p className="text-xs text-muted-foreground">{system.category}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${getStatusColor(system.integrationStatus)}`}
              >
                {system.integrationStatus}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-2">{system.description}</p>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={`text-[10px] ${migration.color}`}>
                {migration.label}
              </Badge>
            </div>

            <div className="mt-3 space-y-1.5">
              {system.dataFlows.map((flow, index) => (
                <div
                  key={index}
                  title={`${flow.direction} ${flow.type}: ${flow.description}`}
                  className="flex items-center gap-2 text-xs rounded-md bg-muted/50 px-2 py-1"
                  data-position={position}
                >
                  {getFlowIcon(flow.direction)}
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {flow.type}
                  </Badge>
                  <span className="text-muted-foreground truncate">{flow.description}</span>
                </div>
              ))}
            </div>

            {system.metrics && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                {system.metrics.map((metric, index) => (
                  <div key={index} className="text-xs">
                    <span className="text-muted-foreground">{metric.label}: </span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Migration timeline                                                 */
/* ------------------------------------------------------------------ */

interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in_progress" | "upcoming";
  progress: number;
  targetDate: string;
  systems: string[];
}

const migrationPhases: MigrationPhase[] = [
  { id: "phase-1", name: "Foundation", description: "Core platform and event bus deployment", status: "completed", progress: 100, targetDate: "Q2 2024", systems: ["Event Bus", "API Gateway", "Security"] },
  { id: "phase-2", name: "Operations Core", description: "Billing, provisioning, and assurance migration", status: "in_progress", progress: 65, targetDate: "Q4 2024", systems: ["Billing Engine", "Provisioning", "Fault Management"] },
  { id: "phase-3", name: "Intelligence Layer", description: "Vision AI integration and analytics", status: "in_progress", progress: 40, targetDate: "Q1 2025", systems: ["Vision Platform", "Insights", "Automation"] },
  { id: "phase-4", name: "Full Coexistence", description: "Complete CRM separation and legacy sunset", status: "upcoming", progress: 0, targetDate: "Q3 2025", systems: ["Salesforce", "Legacy Systems", "Data Migration"] },
];

function MigrationTimeline() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-primary animate-pulse" />;
      case "upcoming":
        return <Target className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "in_progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "upcoming":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Migration Roadmap</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Gradual migration strategy — coexistence, not replacement
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrationPhases.map((phase, index) => (
          <div key={phase.id} className="relative">
            {index < migrationPhases.length - 1 && (
              <div className="absolute left-[11px] top-8 h-full w-0.5 bg-border" />
            )}
            <div className="flex gap-3">
              <div className="relative z-10 mt-0.5">{getStatusIcon(phase.status)}</div>
              <div className="flex-1 space-y-2 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{phase.name}</h4>
                    <p className="text-xs text-muted-foreground">{phase.description}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${getStatusBadge(phase.status)}`}>
                    {phase.targetDate}
                  </Badge>
                </div>

                {phase.status !== "upcoming" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-1.5" />
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {phase.systems.map((system) => (
                    <Badge key={system} variant="outline" className="text-[10px]">
                      {system}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Integration stats                                                  */
/* ------------------------------------------------------------------ */

function IntegrationStats({
  totalIntegrations,
  activeConnections,
  eventsPerMinute,
  apiLatency,
}: {
  totalIntegrations: number;
  activeConnections: number;
  eventsPerMinute: number;
  apiLatency: string;
}) {
  const stats = [
    { label: "Total Integrations", value: totalIntegrations, icon: Layers, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Active Connections", value: activeConnections, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "Events/min", value: eventsPerMinute.toLocaleString(), icon: ArrowLeftRight, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Avg API Latency", value: apiLatency, icon: Clock, color: "text-accent-foreground", bgColor: "bg-accent" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${stat.bgColor} p-2.5`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Architecture() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Architecture & Integration"
        description="PULSE integration landscape — coexisting with enterprise systems, not replacing them"
      />

      <IntegrationStats
        totalIntegrations={leftSystems.length + rightSystems.length}
        activeConnections={8}
        eventsPerMinute={12400}
        apiLatency="34ms"
      />

      {/* Architecture Diagram */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Left Systems */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Radio className="h-4 w-4" />
            <span>Inbound Systems</span>
          </div>
          {leftSystems.map((system) => (
            <ExternalSystem key={system.id} system={system} position="left" />
          ))}
        </div>

        {/* Center - PULSE Core */}
        <div className="flex flex-col items-center justify-center lg:min-w-[320px]">
          <div className="hidden lg:flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>API</span>
              <span>•</span>
              <span>Events</span>
              <span>•</span>
              <span>Webhooks</span>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-0.5 bg-primary/30" />
              <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-primary/30" />
            </div>
          </div>

          <PulseCoreServices />

          <div className="hidden lg:flex flex-col items-center gap-2 mt-4">
            <div className="flex items-center">
              <div className="w-0 h-0 border-y-4 border-y-transparent border-r-[6px] border-r-primary/30" />
              <div className="w-16 h-0.5 bg-primary/30" />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Commands</span>
              <span>•</span>
              <span>Queries</span>
              <span>•</span>
              <span>Notifications</span>
            </div>
          </div>
        </div>

        {/* Right Systems */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Radio className="h-4 w-4 rotate-180" />
            <span>Outbound Systems</span>
          </div>
          {rightSystems.map((system) => (
            <ExternalSystem key={system.id} system={system} position="right" />
          ))}
        </div>
      </div>

      {/* Migration Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MigrationTimeline />

        <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-transparent p-6">
          <h3 className="font-semibold mb-2">Integration Philosophy</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="rounded-full bg-emerald-500/10 p-1.5 h-fit">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Coexistence over Replacement</p>
                <p>PULSE enhances existing investments. CRM remains for sales, PULSE handles operations.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-full bg-primary/10 p-1.5 h-fit">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Event-Driven Architecture</p>
                <p>Real-time events flow between systems. No batch delays, no stale data.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-full bg-amber-500/10 p-1.5 h-fit">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gradual Migration</p>
                <p>Legacy systems sunset progressively. No big-bang cutovers, no business disruption.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-full bg-accent p-1.5 h-fit">
                <div className="h-2 w-2 rounded-full bg-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">API-First Design</p>
                <p>Every capability exposed via APIs. Partners and channels integrate seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
