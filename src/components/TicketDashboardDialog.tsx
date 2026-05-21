import { Ticket as TicketIcon, AlertTriangle, CheckCircle2, Clock, ArrowUpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { Badge } from "@/components/ui/badge/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { tickets as ticketsData, customers as customersData, type Ticket } from "@/data/mock";

interface TicketDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUEUES: { name: string; categories: string[]; color: string }[] = [
  { name: "Customer Service", categories: ["Account", "Billing"], color: "hsl(215 90% 52%)" },
  { name: "Service Faults", categories: ["Network", "Technical", "Performance"], color: "hsl(25 90% 52%)" },
  { name: "Provisioning", categories: ["Service", "Provisioning"], color: "hsl(142 72% 40%)" },
];

function getQueue(category: string) {
  return QUEUES.find((q) => q.categories.includes(category)) ?? QUEUES[0];
}

const openStatuses = ["Open", "Escalated", "In Progress", "Pending"];
const closedStatuses = ["Closed", "Resolved"];

export function TicketDashboardDialog({ open, onOpenChange }: TicketDashboardDialogProps) {
  const openTickets = ticketsData.filter((t) => openStatuses.includes(t.status));
  const closedTickets = ticketsData.filter((t) => closedStatuses.includes(t.status));
  const escalatedTickets = ticketsData.filter((t) => t.status === "Escalated");
  const criticalTickets = ticketsData.filter(
    (t) => t.priority === "Critical" && openStatuses.includes(t.status)
  );

  const queueData = QUEUES.map((q) => {
    const qTickets = ticketsData.filter((t) => q.categories.includes(t.category));
    return {
      name: q.name,
      open: qTickets.filter((t) => openStatuses.includes(t.status)).length,
      closed: qTickets.filter((t) => closedStatuses.includes(t.status)).length,
      total: qTickets.length,
      color: q.color,
    };
  });

  const priorityData = [
    { name: "Critical", value: openTickets.filter((t) => t.priority === "Critical").length, color: "hsl(0 72% 51%)" },
    { name: "High", value: openTickets.filter((t) => t.priority === "High").length, color: "hsl(25 90% 52%)" },
    { name: "Medium", value: openTickets.filter((t) => t.priority === "Medium").length, color: "hsl(45 90% 52%)" },
    { name: "Low", value: openTickets.filter((t) => t.priority === "Low").length, color: "hsl(215 90% 52%)" },
  ];

  const statusData = [
    { name: "Open", value: ticketsData.filter((t) => t.status === "Open").length, color: "hsl(215 90% 52%)" },
    { name: "Escalated", value: escalatedTickets.length, color: "hsl(0 72% 51%)" },
    { name: "Closed", value: ticketsData.filter((t) => closedStatuses.includes(t.status)).length, color: "hsl(215 20% 60%)" },
  ];

  const maxQueueTotal = Math.max(1, ...queueData.map((q) => q.total));
  const maxPriority = Math.max(1, ...priorityData.map((p) => p.value));
  const maxStatus = Math.max(1, ...statusData.map((s) => s.value));

  const renderTicketRows = (rows: Ticket[]) =>
    rows.length === 0 ? (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
          No tickets
        </TableCell>
      </TableRow>
    ) : (
      rows.map((t) => {
        const customer = customersData.find((c) => c.id === t.customerId);
        const queue = getQueue(t.category);
        return (
          <TableRow key={t.id}>
            <TableCell className="font-mono text-xs py-2">{t.id}</TableCell>
            <TableCell className="text-xs py-2 max-w-[200px] truncate">{t.subject}</TableCell>
            <TableCell className="text-xs py-2">{customer?.name ?? t.customer}</TableCell>
            <TableCell className="py-2">
              <Badge variant="outline" className="text-[10px]">{queue.name}</Badge>
            </TableCell>
            <TableCell className="py-2"><StatusBadge status={t.priority} /></TableCell>
            <TableCell className="py-2"><StatusBadge status={t.status} /></TableCell>
            <TableCell className="text-xs py-2">{t.assignee}</TableCell>
          </TableRow>
        );
      })
    );

  const tableHead = (
    <TableHeader>
      <TableRow>
        <TableHead className="text-xs">ID</TableHead>
        <TableHead className="text-xs">Subject</TableHead>
        <TableHead className="text-xs">Customer</TableHead>
        <TableHead className="text-xs">Queue</TableHead>
        <TableHead className="text-xs">Priority</TableHead>
        <TableHead className="text-xs">Status</TableHead>
        <TableHead className="text-xs">Assignee</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            Ticketing Dashboard
          </DialogTitle>
        </DialogHeader>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{openTickets.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowUpCircle className="h-5 w-5 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold">{escalatedTickets.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Escalated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-2xl font-bold">{criticalTickets.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{closedTickets.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">By Queue</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queueData.map((q) => (
                  <div key={q.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{q.name}</span>
                      <span className="text-muted-foreground">
                        {q.open} open · {q.closed} closed
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                      <div
                        className="h-full"
                        style={{
                          width: `${(q.open / maxQueueTotal) * 100}%`,
                          backgroundColor: "hsl(25 90% 52%)",
                        }}
                      />
                      <div
                        className="h-full"
                        style={{
                          width: `${(q.closed / maxQueueTotal) * 100}%`,
                          backgroundColor: "hsl(215 20% 60%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">By Priority</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityData.map((p) => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                      <span className="text-muted-foreground">{p.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.value / maxPriority) * 100}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">By Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusData.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <span className="text-muted-foreground">{s.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(s.value / maxStatus) * 100}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue detail tables */}
        <Tabs defaultValue="all" className="space-y-3">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="all" className="flex-1 text-xs">All ({ticketsData.length})</TabsTrigger>
            {QUEUES.map((q) => {
              const count = ticketsData.filter((t) => q.categories.includes(t.category)).length;
              return (
                <TabsTrigger key={q.name} value={q.name} className="flex-1 text-xs">
                  {q.name} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            <Tabs defaultValue="open" className="space-y-2">
              <TabsList>
                <TabsTrigger value="open" className="text-xs">Open ({openTickets.length})</TabsTrigger>
                <TabsTrigger value="closed" className="text-xs">Closed ({closedTickets.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <div className="overflow-x-auto">
                  <Table>{tableHead}<TableBody>{renderTicketRows(openTickets)}</TableBody></Table>
                </div>
              </TabsContent>
              <TabsContent value="closed">
                <div className="overflow-x-auto">
                  <Table>{tableHead}<TableBody>{renderTicketRows(closedTickets)}</TableBody></Table>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {QUEUES.map((q) => {
            const qOpen = ticketsData.filter(
              (t) => q.categories.includes(t.category) && openStatuses.includes(t.status)
            );
            const qClosed = ticketsData.filter(
              (t) => q.categories.includes(t.category) && closedStatuses.includes(t.status)
            );
            return (
              <TabsContent key={q.name} value={q.name}>
                <Tabs defaultValue="open" className="space-y-2">
                  <TabsList>
                    <TabsTrigger value="open" className="text-xs">Open ({qOpen.length})</TabsTrigger>
                    <TabsTrigger value="closed" className="text-xs">Closed ({qClosed.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="open">
                    <div className="overflow-x-auto">
                      <Table>{tableHead}<TableBody>{renderTicketRows(qOpen)}</TableBody></Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="closed">
                    <div className="overflow-x-auto">
                      <Table>{tableHead}<TableBody>{renderTicketRows(qClosed)}</TableBody></Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
