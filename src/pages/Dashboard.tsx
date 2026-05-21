import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Ticket as TicketIcon,
  PoundSterling,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  User,
  ArrowRightLeft,
  BarChart3,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { Progress } from "@/components/ui/progress/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio/radio-group";
import { Label } from "@/components/ui/label/label";
import { SearchablePicker } from "@/components/ui/searchable-picker/searchable-picker";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { TicketDashboardDialog } from "@/components/TicketDashboardDialog";
import { RevenueDashboardDialog } from "@/components/RevenueDashboardDialog";
import { customers, tickets, invoices, assignmentTeams } from "@/data/mock";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

type Period = "weekly" | "monthly" | "yearly";

const ticketTrendByPeriod: Record<Period, { label: string; value: number }[]> = {
  weekly: [
    { label: "Mon", value: 187 }, { label: "Tue", value: 214 }, { label: "Wed", value: 156 },
    { label: "Thu", value: 198 }, { label: "Fri", value: 223 }, { label: "Sat", value: 89 }, { label: "Sun", value: 62 },
  ],
  monthly: [
    { label: "Wk1", value: 820 }, { label: "Wk2", value: 945 }, { label: "Wk3", value: 878 }, { label: "Wk4", value: 910 },
  ],
  yearly: [
    { label: "Jan", value: 3400 }, { label: "Feb", value: 3100 }, { label: "Mar", value: 3650 },
    { label: "Apr", value: 3200 }, { label: "May", value: 3500 }, { label: "Jun", value: 3800 },
    { label: "Jul", value: 3300 }, { label: "Aug", value: 3150 }, { label: "Sep", value: 3600 },
    { label: "Oct", value: 3750 }, { label: "Nov", value: 3400 }, { label: "Dec", value: 3550 },
  ],
};

const revenueTrendByPeriod: Record<Period, { label: string; value: number }[]> = {
  weekly: [
    { label: "Mon", value: 720000 }, { label: "Tue", value: 810000 }, { label: "Wed", value: 690000 },
    { label: "Thu", value: 850000 }, { label: "Fri", value: 920000 }, { label: "Sat", value: 340000 }, { label: "Sun", value: 180000 },
  ],
  monthly: [
    { label: "Wk1", value: 1250000 }, { label: "Wk2", value: 1380000 }, { label: "Wk3", value: 1190000 }, { label: "Wk4", value: 1300000 },
  ],
  yearly: [
    { label: "Sep", value: 4200000 }, { label: "Oct", value: 4450000 }, { label: "Nov", value: 4380000 },
    { label: "Dec", value: 4780000 }, { label: "Jan", value: 5100000 }, { label: "Feb", value: 4920000 },
  ],
};

const churnDataByPeriod: Record<Period, { name: string; value: number }[]> = {
  weekly: [
    { name: "Bad Debt", value: 28 },
    { name: "Moved to Competitor", value: 34 },
    { name: "Relocated", value: 14 },
    { name: "Deceased/Closed", value: 6 },
    { name: "Unknown", value: 18 },
  ],
  monthly: [
    { name: "Bad Debt", value: 26 },
    { name: "Moved to Competitor", value: 35 },
    { name: "Relocated", value: 15 },
    { name: "Deceased/Closed", value: 7 },
    { name: "Unknown", value: 17 },
  ],
  yearly: [
    { name: "Bad Debt", value: 24 },
    { name: "Moved to Competitor", value: 38 },
    { name: "Relocated", value: 16 },
    { name: "Deceased/Closed", value: 8 },
    { name: "Unknown", value: 14 },
  ],
};

const churnColors = [
  "hsl(0 72% 51%)",
  "hsl(25 90% 55%)",
  "hsl(45 85% 50%)",
  "hsl(270 50% 55%)",
  "hsl(200 15% 55%)",
];

const segmentData = [
  { segment: "Consumer", count: 1842000, pct: 89.4 },
  { segment: "SMB", count: 142000, pct: 6.9 },
  { segment: "Enterprise", count: 64000, pct: 3.1 },
  { segment: "Government", count: 12400, pct: 0.6 },
];

const customerGrowth = [
  { label: "Sep", value: 12400 },
  { label: "Oct", value: 14800 },
  { label: "Nov", value: 11200 },
  { label: "Dec", value: 8900 },
  { label: "Jan", value: 16200 },
  { label: "Feb", value: 13500 },
];

const csatTrend = [
  { label: "Sep", value: 78 },
  { label: "Oct", value: 76 },
  { label: "Nov", value: 79 },
  { label: "Dec", value: 74 },
  { label: "Jan", value: 81 },
  { label: "Feb", value: 83 },
];

const npsTrend = [
  { label: "Sep", value: 32 },
  { label: "Oct", value: 29 },
  { label: "Nov", value: 34 },
  { label: "Dec", value: 28 },
  { label: "Jan", value: 38 },
  { label: "Feb", value: 41 },
];

const sentimentData = [
  { name: "Positive", value: 62, color: "hsl(142 72% 40%)" },
  { name: "Neutral", value: 24, color: "hsl(45 85% 50%)" },
  { name: "Negative", value: 14, color: "hsl(0 72% 51%)" },
];

const topComplaintAreas = [
  { area: "Billing Accuracy", pct: 28 },
  { area: "Network Reliability", pct: 22 },
  { area: "Wait Times", pct: 18 },
  { area: "Speed Issues", pct: 15 },
  { area: "Provisioning Delays", pct: 12 },
  { area: "Other", pct: 5 },
];

const surveyChannelData = [
  { channel: "Post-Call IVR", responses: 24800, csat: 79 },
  { channel: "Email Survey", responses: 18200, csat: 82 },
  { channel: "In-App", responses: 31400, csat: 85 },
  { channel: "SMS", responses: 12600, csat: 76 },
  { channel: "Chat Post-Session", responses: 8900, csat: 88 },
];

const periods: Period[] = ["weekly", "monthly", "yearly"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [ticketPeriod, setTicketPeriod] = React.useState<Period>("weekly");
  const [revenuePeriod, setRevenuePeriod] = React.useState<Period>("yearly");
  const [churnPeriod, setChurnPeriod] = React.useState<Period>("monthly");
  const [ticketDashOpen, setTicketDashOpen] = React.useState(false);
  const [revenueDashOpen, setRevenueDashOpen] = React.useState(false);

  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const openTickets = tickets.filter((t) => t.status === "Open" || t.status === "Escalated").length;
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
  const revenueMTD = invoices.filter((i) => i.issueDate.startsWith("2026-05")).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back. Here's your operational overview.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div data-tour="dashboard-kpi-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-tour="dashboard-subscribers-card" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/customers")}>
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Subscribers</p>
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-1">{activeCustomers}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />+2.4% vs last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTicketDashOpen(true)}>
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Tickets</p>
                <div className="h-5 w-5 rounded bg-warning/10 flex items-center justify-center">
                  <TicketIcon className="h-3 w-3 text-warning" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-1">{openTickets}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                <TrendingUp className="h-3 w-3" />+5 today
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRevenueDashOpen(true)}>
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue MTD</p>
                <div className="h-5 w-5 rounded bg-success/10 flex items-center justify-center">
                  <PoundSterling className="h-3 w-3 text-success" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-1">{formatCurrency(revenueMTD, 0)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />On track
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/billing")}>
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue Invoices</p>
                <div className="h-5 w-5 rounded bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-1">{overdueInvoices.length}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))} outstanding
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customer-base" className="space-y-4">
        <TabsList data-tour="dashboard-tabs">
          <TabsTrigger value="customer-base" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />Customer Base
          </TabsTrigger>
          <TabsTrigger value="agent-workload" className="gap-1.5">
            <User className="h-3.5 w-3.5" />Agent Workload
          </TabsTrigger>
          <TabsTrigger value="surveys-csat" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />Surveys & CSAT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer-base" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card data-tour="dashboard-ticket-volume">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Ticket Volume</CardTitle>
                <div className="flex gap-1">
                  {periods.map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={ticketPeriod === p ? "default" : "outline"}
                      className="h-6 text-[10px] px-2 capitalize"
                      onClick={() => setTicketPeriod(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <BarChart data={ticketTrendByPeriod[ticketPeriod]} height={180} />
              </CardContent>
            </Card>

            <Card data-tour="dashboard-revenue-trend">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
                <div className="flex gap-1">
                  {periods.map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={revenuePeriod === p ? "default" : "outline"}
                      className="h-6 text-[10px] px-2 capitalize"
                      onClick={() => setRevenuePeriod(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={revenueTrendByPeriod[revenuePeriod]}
                  color="hsl(142 72% 40%)"
                  height={180}
                  formatValue={(v) => formatCurrencyCompact(v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Churn Breakdown</CardTitle>
                <div className="flex gap-1">
                  {periods.map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={churnPeriod === p ? "default" : "outline"}
                      className="h-6 text-[10px] px-2 capitalize"
                      onClick={() => setChurnPeriod(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnDataByPeriod[churnPeriod].map((d, i) => (
                    <div key={d.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground">{d.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${d.value}%`, backgroundColor: churnColors[i] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Subscriber Growth</CardTitle></CardHeader>
              <CardContent>
                <BarChart
                  data={customerGrowth}
                  height={180}
                  formatValue={(v) => `${(v / 1000).toFixed(0)}k`}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Subscriber Segments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {segmentData.map((s) => (
                    <div key={s.segment} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.segment}</span>
                        <span className="text-muted-foreground">{s.count.toLocaleString()} ({s.pct}%)</span>
                      </div>
                      <Progress value={Math.max(s.pct, 2)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agent-workload" className="space-y-4">
          <AgentWorkloadSection />
        </TabsContent>

        <TabsContent value="surveys-csat" className="space-y-4">
          {/* CSAT & NPS KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CSAT Score</p>
                    <p className="text-3xl font-bold mt-1">83%</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />+2pts vs last month
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">NPS</p>
                    <p className="text-3xl font-bold mt-1">+41</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />+3pts vs last month
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Survey Responses (MTD)</p>
                    <p className="text-3xl font-bold mt-1">95.9K</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />18% response rate
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Contact Resolution</p>
                    <p className="text-3xl font-bold mt-1">72%</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <TrendingDown className="h-3 w-3" />-1pt vs last month
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CSAT Trend (6 months)</CardTitle></CardHeader>
              <CardContent>
                <LineChart
                  data={csatTrend}
                  color="hsl(215 90% 52%)"
                  height={200}
                  formatValue={(v) => `${v}%`}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">NPS Trend (6 months)</CardTitle></CardHeader>
              <CardContent>
                <LineChart
                  data={npsTrend}
                  color="hsl(142 72% 40%)"
                  height={200}
                  formatValue={(v) => `+${v}`}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sentiment Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentimentData.map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-1.5">
                          {s.name === "Positive" && <Smile className="h-4 w-4 text-success" />}
                          {s.name === "Neutral" && <Meh className="h-4 w-4 text-warning" />}
                          {s.name === "Negative" && <Frown className="h-4 w-4 text-destructive" />}
                          {s.name}
                        </span>
                        <span className="text-muted-foreground">{s.value}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CSAT by Channel</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {surveyChannelData.map((ch) => (
                    <div key={ch.channel} className="flex items-center justify-between text-sm gap-2">
                      <span className="font-medium truncate flex-1">{ch.channel}</span>
                      <span className="text-muted-foreground text-xs">{ch.responses.toLocaleString()} responses</span>
                      <Badge
                        tone={ch.csat >= 85 ? "success" : ch.csat >= 80 ? "info" : "warning"}
                        className="min-w-[48px] justify-center text-xs"
                      >
                        {ch.csat}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top Complaint Areas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {topComplaintAreas.map((c, i) => (
                    <div key={c.area} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{i + 1}. {c.area}</span>
                        <span className="text-muted-foreground">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-destructive/70" style={{ width: `${c.pct * 3}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TicketDashboardDialog open={ticketDashOpen} onOpenChange={setTicketDashOpen} />
      <RevenueDashboardDialog open={revenueDashOpen} onOpenChange={setRevenueDashOpen} />
    </div>
  );
}

type Availability = "Available" | "Busy" | "Offline";

interface AgentRow {
  name: string;
  availability: Availability;
  currentLoad: number;
  maxLoad: number;
  skills: string[];
}

const initialAgents: AgentRow[] = [
  { name: "Sarah Chen", availability: "Available", currentLoad: 14, maxLoad: 16, skills: ["Billing", "Account", "Escalations"] },
  { name: "Marcus Lee", availability: "Busy", currentLoad: 9, maxLoad: 14, skills: ["Network", "Performance", "Field"] },
  { name: "Priya Patel", availability: "Available", currentLoad: 6, maxLoad: 14, skills: ["Provisioning", "Onboarding"] },
  { name: "Diego Alvarez", availability: "Busy", currentLoad: 12, maxLoad: 15, skills: ["Network", "Performance"] },
  { name: "Nina Sokolova", availability: "Available", currentLoad: 3, maxLoad: 12, skills: ["Admin", "Reporting"] },
  { name: "Aiden Park", availability: "Offline", currentLoad: 0, maxLoad: 14, skills: ["Billing", "SMB"] },
];

function AgentWorkloadSection() {
  const [agents, setAgents] = React.useState<AgentRow[]>(initialAgents);
  const [reassignFrom, setReassignFrom] = React.useState("");
  const [reassignTo, setReassignTo] = React.useState("");

  const [statusDialog, setStatusDialog] = React.useState<{ agent: string; newStatus: Availability } | null>(null);
  const [reassignMode, setReassignMode] = React.useState<"agent" | "team">("agent");
  const [targetAgent, setTargetAgent] = React.useState("");
  const [targetTeam, setTargetTeam] = React.useState("");

  const agentStats = agents.map((a) => {
    const agentTickets = tickets.filter((t) => t.assignee === a.name);
    const resolvedTickets = agentTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
    const openTickets = agentTickets.filter((t) => t.status === "Open" || t.status === "Escalated" || t.status === "In Progress").length;
    const loadPct = a.maxLoad > 0 ? Math.round((a.currentLoad / a.maxLoad) * 100) : 0;
    const slaCompliance = 70 + ((a.name.length * 7) % 30); // stable pseudo-random per name
    const avgHours = 2 + ((a.name.length * 3) % 18);
    return { ...a, openTickets, resolvedTickets, loadPct, slaCompliance, avgHours };
  });

  const applyStatusChange = (name: string, newStatus: Availability) => {
    setAgents((prev) => prev.map((a) => (a.name === name ? { ...a, availability: newStatus } : a)));
    toast({ title: "Status Updated", description: `${name} is now ${newStatus}.` });
  };

  const handleStatusChange = (name: string, newStatus: Availability) => {
    const agent = agentStats.find((a) => a.name === name);
    const currentStatus = agent?.availability;

    if (newStatus === "Offline" && currentStatus !== "Offline") {
      setStatusDialog({ agent: name, newStatus });
      setReassignMode("agent");
      setTargetAgent("");
      setTargetTeam("");
      return;
    }

    applyStatusChange(name, newStatus);
  };

  const handleConfirmReassignment = () => {
    if (!statusDialog) return;
    const { agent, newStatus } = statusDialog;
    const agentData = agentStats.find((a) => a.name === agent);
    const openCount = agentData?.openTickets || 0;

    if (reassignMode === "agent") {
      if (!targetAgent) return;
      toast({
        title: "Tickets Reassigned & Status Updated",
        description: `${openCount} open ticket(s) moved from ${agent} to ${targetAgent}. ${agent} is now ${newStatus}.`,
      });
    } else {
      if (!targetTeam) return;
      const team = assignmentTeams.find((t) => t.name === targetTeam);
      const memberCount = team?.members.filter((m) => m !== agent).length || 1;
      const perMember = Math.floor(openCount / memberCount);
      const remainder = openCount % memberCount;
      toast({
        title: "Tickets Distributed & Status Updated",
        description: `${openCount} ticket(s) evenly distributed across ${memberCount} members of ${targetTeam} (~${perMember}${remainder > 0 ? `-${perMember + 1}` : ""} each). ${agent} is now ${newStatus}.`,
      });
    }

    applyStatusChange(agent, newStatus);
    setStatusDialog(null);
  };

  const availableAgentsForReassign = agents.filter(
    (a) => a.name !== statusDialog?.agent && a.availability !== "Offline"
  );

  const handleReassign = () => {
    if (!reassignFrom || !reassignTo || reassignFrom === reassignTo) return;
    toast({ title: "Tickets reassigned", description: `1 ticket moved from ${reassignFrom} to ${reassignTo}.` });
    setReassignFrom("");
    setReassignTo("");
  };

  return (
    <>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Agent Workload
          <Badge variant="outline" className="text-[10px] ml-1">Supervisor View</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentStats.map((agent) => (
            <div key={agent.name} className="p-3 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{agent.name}</span>
                <StatusBadge status={agent.availability} />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Change Status</label>
                <Select
                  value={agent.availability}
                  onValueChange={(v) => handleStatusChange(agent.name, v as Availability)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Load</span>
                  <span className="font-mono">{agent.currentLoad}/{agent.maxLoad}</span>
                </div>
                <Progress
                  value={agent.loadPct}
                  tone={agent.loadPct >= 90 ? "destructive" : agent.loadPct >= 70 ? "warning" : "success"}
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BarChart3 className="h-2.5 w-2.5" /> Open:{" "}
                  <span className="font-medium text-foreground">{agent.openTickets}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Resolved:{" "}
                  <span className="font-medium text-foreground">{agent.resolvedTickets}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" /> SLA:{" "}
                  <span
                    className={`font-medium ${
                      agent.slaCompliance >= 90
                        ? "text-success"
                        : agent.slaCompliance >= 70
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {agent.slaCompliance}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" /> Avg:{" "}
                  <span className="font-medium text-foreground">{agent.avgHours}h</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {agent.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-[8px] px-1 py-0">
                    {skill}
                  </Badge>
                ))}
                {agent.skills.length > 3 && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                    +{agent.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg border bg-accent/30 space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium">Reassign Ticket</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
              <SearchablePicker
                options={agents.map((a) => ({
                  value: a.name,
                  label: a.name,
                  description: `${a.availability} · ${a.currentLoad}/${a.maxLoad}`,
                }))}
                value={reassignFrom}
                onValueChange={setReassignFrom}
                placeholder="Search source agent..."
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
              <SearchablePicker
                options={agents
                  .filter((a) => a.name !== reassignFrom)
                  .map((a) => ({
                    value: a.name,
                    label: a.name,
                    description: `${a.availability} · ${a.currentLoad}/${a.maxLoad}`,
                  }))}
                value={reassignTo}
                onValueChange={setReassignTo}
                placeholder="Search target agent..."
              />
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs w-full"
            disabled={!reassignFrom || !reassignTo || reassignFrom === reassignTo}
            onClick={handleReassign}
          >
            Move
          </Button>
        </div>
      </CardContent>
    </Card>

    <Dialog open={!!statusDialog} onOpenChange={(open) => !open && setStatusDialog(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Reassign Open Tickets
          </DialogTitle>
        </DialogHeader>
        {statusDialog && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{statusDialog.agent}</span> has{" "}
              <span className="font-semibold text-foreground">
                {agentStats.find((a) => a.name === statusDialog.agent)?.openTickets || 0}
              </span>{" "}
              open ticket(s). How would you like to reassign them before setting status to{" "}
              <Badge variant="outline" className="text-[10px]">{statusDialog.newStatus}</Badge>?
            </p>

            <RadioGroup value={reassignMode} onValueChange={(v) => setReassignMode(v as "agent" | "team")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="agent" id="mode-agent" />
                <Label htmlFor="mode-agent" className="text-sm">Transfer to a specific agent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="mode-team" />
                <Label htmlFor="mode-team" className="text-sm">Distribute across a team</Label>
              </div>
            </RadioGroup>

            {reassignMode === "agent" ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Target Agent</label>
                <SearchablePicker
                  options={availableAgentsForReassign.map((a) => ({
                    value: a.name,
                    label: a.name,
                    description: `${a.availability} · Load: ${a.currentLoad}/${a.maxLoad}`,
                  }))}
                  value={targetAgent}
                  onValueChange={setTargetAgent}
                  placeholder="Search agents..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Target Team</label>
                <SearchablePicker
                  options={assignmentTeams.map((t) => {
                    const eligibleMembers = t.members.filter((m) => m !== statusDialog.agent);
                    return {
                      value: t.name,
                      label: t.name,
                      description: `${eligibleMembers.length} member${eligibleMembers.length !== 1 ? "s" : ""}`,
                    };
                  })}
                  value={targetTeam}
                  onValueChange={setTargetTeam}
                  placeholder="Search teams..."
                />
                {targetTeam && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    <p className="font-medium text-foreground mb-1">Distribution preview:</p>
                    {(() => {
                      const team = assignmentTeams.find((t) => t.name === targetTeam);
                      const members = team?.members.filter((m) => m !== statusDialog.agent) || [];
                      const openCount = agentStats.find((a) => a.name === statusDialog.agent)?.openTickets || 0;
                      const perMember = members.length > 0 ? Math.floor(openCount / members.length) : 0;
                      const remainder = members.length > 0 ? openCount % members.length : 0;
                      return members.map((m, i) => (
                        <div key={m} className="flex items-center justify-between py-0.5">
                          <span>{m}</span>
                          <Badge variant="outline" className="text-[10px]">
                            +{perMember + (i < remainder ? 1 : 0)} ticket(s)
                          </Badge>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmReassignment}
            disabled={reassignMode === "agent" ? !targetAgent : !targetTeam}
          >
            Reassign & Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
