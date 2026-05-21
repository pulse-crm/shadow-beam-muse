import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar/avatar";
import { Progress } from "@/components/ui/progress/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { toast } from "@/components/ui/toast/toaster";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  Clock,
  Star,
  Target,
  Zap,
  Medal,
  Download,
  Printer,
} from "lucide-react";

interface AgentMetrics {
  id: string;
  name: string;
  initials: string;
  role: string;
  ticketsResolved: number;
  avgResponseMin: number;
  avgResolutionMin: number;
  csat: number;
  firstContactResolution: number;
  escalationRate: number;
  adherenceScore: number;
  streak: number;
}

const agents: AgentMetrics[] = [
  { id: "A1", name: "Agent Kim", initials: "AK", role: "Senior Agent", ticketsResolved: 142, avgResponseMin: 8, avgResolutionMin: 95, csat: 4.8, firstContactResolution: 87, escalationRate: 4, adherenceScore: 96, streak: 12 },
  { id: "A2", name: "Agent Lopez", initials: "AL", role: "Agent", ticketsResolved: 118, avgResponseMin: 12, avgResolutionMin: 120, csat: 4.6, firstContactResolution: 78, escalationRate: 8, adherenceScore: 92, streak: 5 },
  { id: "A3", name: "Billing Specialist", initials: "BS", role: "Specialist", ticketsResolved: 96, avgResponseMin: 15, avgResolutionMin: 180, csat: 4.5, firstContactResolution: 65, escalationRate: 12, adherenceScore: 88, streak: 3 },
  { id: "A4", name: "Senior Tech Ops", initials: "ST", role: "Lead", ticketsResolved: 78, avgResponseMin: 5, avgResolutionMin: 240, csat: 4.9, firstContactResolution: 72, escalationRate: 2, adherenceScore: 98, streak: 18 },
  { id: "A5", name: "Enterprise Sales", initials: "ES", role: "Account Manager", ticketsResolved: 54, avgResponseMin: 20, avgResolutionMin: 360, csat: 4.7, firstContactResolution: 60, escalationRate: 6, adherenceScore: 94, streak: 7 },
  { id: "A6", name: "Field Tech Team", initials: "FT", role: "Field Ops", ticketsResolved: 67, avgResponseMin: 30, avgResolutionMin: 480, csat: 4.3, firstContactResolution: 55, escalationRate: 15, adherenceScore: 85, streak: 2 },
];

const sorted = [...agents].sort((a, b) => b.ticketsResolved - a.ticketsResolved);

const volumeData = sorted.map((a) => ({
  name: a.name.split(" ").pop() as string,
  resolved: a.ticketsResolved,
  csat: Math.round(a.csat * 20),
}));

const radarData = [
  { metric: "Speed", ...Object.fromEntries(sorted.slice(0, 3).map((a) => [a.id, Math.max(0, 100 - a.avgResponseMin * 3)])) },
  { metric: "CSAT", ...Object.fromEntries(sorted.slice(0, 3).map((a) => [a.id, a.csat * 20])) },
  { metric: "FCR", ...Object.fromEntries(sorted.slice(0, 3).map((a) => [a.id, a.firstContactResolution])) },
  { metric: "Volume", ...Object.fromEntries(sorted.slice(0, 3).map((a) => [a.id, Math.min(100, a.ticketsResolved / 1.5)])) },
  { metric: "Adherence", ...Object.fromEntries(sorted.slice(0, 3).map((a) => [a.id, a.adherenceScore])) },
];

const radarColors = ["hsl(215, 90%, 52%)", "hsl(142, 72%, 40%)", "hsl(38, 92%, 50%)"];

const medalColors: Record<number, string> = {
  0: "text-amber-400",
  1: "text-muted-foreground",
  2: "text-orange-600",
};

const exportColumns = [
  { key: "name", label: "Agent" },
  { key: "ticketsResolved", label: "Resolved" },
  { key: "avgResponseMin", label: "Avg Response (min)" },
  { key: "csat", label: "CSAT" },
  { key: "firstContactResolution", label: "FCR %" },
  { key: "escalationRate", label: "Escalation %" },
  { key: "adherenceScore", label: "Adherence %" },
];

function ExportButtons({
  data,
  filename,
  columns,
}: {
  data: Record<string, unknown>[];
  filename: string;
  columns: { key: string; label: string }[];
}) {
  const exportCSV = () => {
    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          const str = String(val ?? "").replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filename}.csv downloaded.` });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-1.5">
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportCSV}>
        <Download className="h-3 w-3" /> CSV
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handlePrint}>
        <Printer className="h-3 w-3" /> Print
      </Button>
    </div>
  );
}

export default function Performance() {
  const topAgent = sorted[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Performance</h1>
          <p className="text-sm text-muted-foreground">Monthly leaderboard and KPI analytics</p>
        </div>
        <ExportButtons
          data={agents as unknown as Record<string, unknown>[]}
          filename="agent-performance"
          columns={exportColumns}
        />
      </div>

      {/* Top Performer Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Top Performer — This Month
            </p>
            <p className="text-lg font-bold">{topAgent.name}</p>
            <p className="text-xs text-muted-foreground">
              {topAgent.ticketsResolved} resolved · {topAgent.csat}⭐ CSAT · {topAgent.streak} day
              streak 🔥
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Total Resolved</p>
              <p className="text-xl font-bold">
                {agents.reduce((s, a) => s + a.ticketsResolved, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg CSAT</p>
              <p className="text-xl font-bold">
                {(agents.reduce((s, a) => s + a.csat, 0) / agents.length).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg Response</p>
              <p className="text-xl font-bold">
                {Math.round(agents.reduce((s, a) => s + a.avgResponseMin, 0) / agents.length)}m
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg FCR</p>
              <p className="text-xl font-bold">
                {Math.round(
                  agents.reduce((s, a) => s + a.firstContactResolution, 0) / agents.length
                )}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Resolved</TableHead>
                    <TableHead className="text-right">Avg Response</TableHead>
                    <TableHead className="text-right">CSAT</TableHead>
                    <TableHead className="text-right">FCR</TableHead>
                    <TableHead className="text-right">Escalation</TableHead>
                    <TableHead className="text-right">Adherence</TableHead>
                    <TableHead className="text-right">Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((agent, i) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        {i < 3 ? (
                          <Medal className={`h-4 w-4 ${medalColors[i]}`} />
                        ) : (
                          <span className="text-xs text-muted-foreground">{i + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {agent.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {agent.ticketsResolved}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {agent.avgResponseMin}m
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            agent.csat >= 4.7
                              ? "border-success/50 text-success bg-success/10 text-[10px]"
                              : agent.csat >= 4.4
                                ? "border-warning/50 text-warning bg-warning/10 text-[10px]"
                                : "border-destructive/50 text-destructive bg-destructive/10 text-[10px]"
                          }
                        >
                          {agent.csat}⭐
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={agent.firstContactResolution} className="w-16 h-1.5" />
                          <span className="text-xs font-mono">
                            {agent.firstContactResolution}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-xs font-mono ${
                            agent.escalationRate <= 5
                              ? "text-success"
                              : agent.escalationRate <= 10
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {agent.escalationRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={agent.adherenceScore} className="w-16 h-1.5" />
                          <span className="text-xs font-mono">{agent.adherenceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {agent.streak}🔥
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resolution Volume & CSAT</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ReBarChart data={volumeData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="resolved"
                      name="Resolved"
                      fill="hsl(215, 90%, 52%)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="csat"
                      name="CSAT (scaled)"
                      fill="hsl(142, 72%, 40%)"
                      radius={[3, 3, 0, 0]}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 3 — Skill Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                    {sorted.slice(0, 3).map((a, i) => (
                      <Radar
                        key={a.id}
                        name={a.name}
                        dataKey={a.id}
                        stroke={radarColors[i]}
                        fill={radarColors[i]}
                        fillOpacity={0.15}
                      />
                    ))}
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {sorted.slice(0, 3).map((a, i) => (
                    <div key={a.id} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: radarColors[i] }}
                      />
                      <span className="text-[10px] text-muted-foreground">{a.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
