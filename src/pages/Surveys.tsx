import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Progress } from "@/components/ui/progress/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import {
  Star,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Users,
  SmilePlus,
} from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/cn";

const csatTrend = [
  { label: "Sep", value: 82 },
  { label: "Oct", value: 85 },
  { label: "Nov", value: 83 },
  { label: "Dec", value: 87 },
  { label: "Jan", value: 89 },
  { label: "Feb", value: 91 },
];

const npsDistribution = [
  { name: "Promoters", value: 58, color: "hsl(142, 72%, 40%)" },
  { name: "Passives", value: 27, color: "hsl(38, 92%, 50%)" },
  { name: "Detractors", value: 15, color: "hsl(0, 72%, 51%)" },
];

const channelScores = [
  { channel: "Phone", csat: 88, responses: 342 },
  { channel: "Email", csat: 85, responses: 215 },
  { channel: "Chat", csat: 92, responses: 567 },
  { channel: "Messenger", csat: 90, responses: 189 },
];

const agentScores = [
  { name: "Emily Chen", csat: 95, responses: 87, nps: 72 },
  { name: "Marcus Brown", csat: 91, responses: 112, nps: 65 },
  { name: "Lisa Wong", csat: 89, responses: 95, nps: 58 },
  { name: "Sarah Mitchell", csat: 87, responses: 78, nps: 52 },
  { name: "Raj Patel", csat: 93, responses: 64, nps: 68 },
];

interface FeedbackItem {
  id: string;
  score: number;
  comment: string;
  agent: string;
  date: string;
  channel: string;
}

const seedFeedback: FeedbackItem[] = [
  { id: "f1", score: 5, comment: "Emily was incredibly helpful and resolved my billing issue in minutes!", agent: "Emily Chen", date: "2025-02-12", channel: "Chat" },
  { id: "f2", score: 4, comment: "Good service overall, slight wait time on hold.", agent: "Marcus Brown", date: "2025-02-12", channel: "Phone" },
  { id: "f3", score: 2, comment: "My broadband issue still hasn't been fixed after three calls.", agent: "Lisa Wong", date: "2025-02-11", channel: "Phone" },
  { id: "f4", score: 5, comment: "Quick and professional. Got my leased line order sorted.", agent: "Raj Patel", date: "2025-02-11", channel: "Email" },
  { id: "f5", score: 3, comment: "Agent was friendly but couldn't resolve my contract query.", agent: "Sarah Mitchell", date: "2025-02-10", channel: "Chat" },
  { id: "f6", score: 5, comment: "Excellent support, very knowledgeable about the product.", agent: "Emily Chen", date: "2025-02-10", channel: "Messenger" },
  { id: "f7", score: 1, comment: "Terrible experience. Was transferred 4 times.", agent: "Marcus Brown", date: "2025-02-09", channel: "Phone" },
  { id: "f8", score: 4, comment: "Good response time and clear communication.", agent: "Lisa Wong", date: "2025-02-09", channel: "Email" },
];

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= score ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function Surveys() {
  const [period, setPeriod] = React.useState("This Month");
  const [tab, setTab] = React.useState("overview");
  const [recentFeedback] = React.useState<FeedbackItem[]>(seedFeedback);

  const currentCSAT = 91;
  const prevCSAT = 87;
  const currentNPS = 43;
  const totalResponses = 1313;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Satisfaction</h1>
          <p className="text-sm text-muted-foreground">CSAT &amp; NPS survey results and trends</p>
        </div>
        <div className="w-32 shrink-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="This Quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">CSAT Score</p>
              <SmilePlus className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl font-bold mt-1">{currentCSAT}%</p>
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success font-medium">+{currentCSAT - prevCSAT}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">NPS Score</p>
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-1">{currentNPS}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {currentNPS >= 50 ? "Excellent" : currentNPS >= 30 ? "Good" : "Needs improvement"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Responses</p>
              <Users className="h-4 w-4 text-info" />
            </div>
            <p className="text-2xl font-bold mt-1">{totalResponses.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-1">32% response rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Rating</p>
              <Star className="h-4 w-4 text-warning fill-warning" />
            </div>
            <p className="text-2xl font-bold mt-1">
              4.2<span className="text-sm text-muted-foreground font-normal">/5</span>
            </p>
            <StarRating score={4} />
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview" className="text-xs gap-1">
            <BarChart3 className="h-3 w-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="agents" className="text-xs gap-1">
            <Users className="h-3 w-3" /> By Agent
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" /> Feedback
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CSAT Trend (6 months)</CardTitle>
            </CardHeader>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">NPS Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={npsDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                    >
                      {npsDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {npsDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CSAT by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channelScores.map((ch) => (
                  <div
                    key={ch.channel}
                    className="text-center space-y-1.5 p-3 rounded-lg bg-muted/50"
                  >
                    <p className="text-xs font-medium">{ch.channel}</p>
                    <p className="text-2xl font-bold">{ch.csat}%</p>
                    <Progress value={ch.csat} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">{ch.responses} responses</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "agents" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Agent</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">CSAT</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">NPS</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Responses</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[...agentScores]
                    .sort((a, b) => b.csat - a.csat)
                    .map((agent, i) => (
                      <tr
                        key={agent.name}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground",
                              i === 0 ? "bg-warning" : "bg-muted-foreground/30"
                            )}
                          >
                            {i + 1}
                          </span>
                          <span className="font-medium text-xs">{agent.name}</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              agent.csat >= 90
                                ? "border-success/50 text-success"
                                : "border-warning/50 text-warning"
                            )}
                          >
                            {agent.csat}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-xs font-medium">{agent.nps}</td>
                        <td className="p-3 text-center text-xs text-muted-foreground">
                          {agent.responses}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                            <StarRating score={Math.round(agent.csat / 20)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "feedback" && (
        <div className="space-y-2">
          {recentFeedback.map((fb) => (
            <Card key={fb.id} className={cn(fb.score <= 2 && "border-destructive/30")}>
              <CardContent className="p-3 flex gap-3">
                <div className="shrink-0 pt-0.5">
                  <StarRating score={fb.score} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm">{fb.comment}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{fb.agent}</span>
                    <span>·</span>
                    <span>{fb.channel}</span>
                    <span>·</span>
                    <span>{fb.date}</span>
                  </div>
                </div>
                {fb.score <= 2 && (
                  <Badge variant="destructive" className="text-[9px] h-5 shrink-0">
                    Action Needed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
