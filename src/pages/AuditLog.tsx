import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Input } from "@/components/ui/input/input";
import { Badge } from "@/components/ui/badge/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Button } from "@/components/ui/button/button";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { toast } from "@/components/ui/toast/toaster";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import {
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  user_id: string | null;
  user_name: string | null;
  success: boolean;
  failure_reason: string | null;
  user_agent: string | null;
  ip_hint: string | null;
  created_at: string;
}

const iso = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

// Inline mock data (replaces useAuditLog hook)
const auditLog: AuditEntry[] = [
  { id: "AL-1001", timestamp: iso(12), user: "Sarah Chen", role: "Agent", action: "Resolved", entity: "Ticket", entityId: "T-1028", details: "Marked ticket T-1028 as resolved after fibre splice repair." },
  { id: "AL-1002", timestamp: iso(45), user: "Marcus Lee", role: "Agent", action: "Escalated", entity: "Ticket", entityId: "T-1025", details: "Escalated T-1025 to NOC — recurring packet loss on EU-west." },
  { id: "AL-1003", timestamp: iso(70), user: "Priya Patel", role: "Manager", action: "Updated", entity: "Account", entityId: "C003", details: "Updated billing contact and tax ID for Northwind Traders." },
  { id: "AL-1004", timestamp: iso(120), user: "system", role: "System", action: "Sent", entity: "Order", entityId: "INV-2026-002", details: "Automated invoice INV-2026-002 dispatched to customer." },
  { id: "AL-1005", timestamp: iso(180), user: "Diego Alvarez", role: "Sales", action: "Updated", entity: "Account", entityId: "D-006", details: "Moved deal D-006 to Negotiation stage." },
  { id: "AL-1006", timestamp: iso(240), user: "Nihala Nazar", role: "Admin", action: "Created", entity: "Users", entityId: "U999", details: "Invited new agent user U999 to the workspace." },
  { id: "AL-1007", timestamp: iso(300), user: "Admin", role: "Admin", action: "Updated", entity: "Settings", entityId: "SET-SLA", details: "Disabled legacy B2C SLA policy." },
  { id: "AL-1008", timestamp: iso(360), user: "Priya Patel", role: "Manager", action: "Approved", entity: "Billing Adjustment", entityId: "BA-0042", details: "Approved £120.00 credit for service outage." },
  { id: "AL-1009", timestamp: iso(420), user: "Sarah Chen", role: "Agent", action: "Created", entity: "Message", entityId: "M-5567", details: "Replied to customer on ticket T-1028." },
  { id: "AL-1010", timestamp: iso(540), user: "Marcus Lee", role: "Agent", action: "Updated", entity: "Knowledge Article", entityId: "KB-014", details: "Revised troubleshooting steps for router provisioning." },
  { id: "AL-1011", timestamp: iso(700), user: "ops.bot", role: "System", action: "Created", entity: "Survey", entityId: "SV-203", details: "Generated post-resolution CSAT survey for T-1019." },
  { id: "AL-1012", timestamp: iso(900), user: "diego.alvarez", role: "Sales", action: "Login", entity: "Login", entityId: "SESS-7781", details: "Successful sign-in from London office." },
  { id: "AL-1013", timestamp: iso(1100), user: "Nihala Nazar", role: "Admin", action: "Deleted", entity: "Users", entityId: "U120", details: "Deactivated offboarded agent account." },
  { id: "AL-1014", timestamp: iso(1300), user: "Sarah Chen", role: "Agent", action: "Updated", entity: "Ticket", entityId: "T-1014", details: "Reassigned T-1014 to the NOC team." },
];

const loginAttempts: LoginAttempt[] = [
  { id: "LA-01", email: "sarah.chen@netbeam.com", user_id: "U101", user_name: "Sarah Chen", success: true, failure_reason: null, user_agent: "Chrome/123", ip_hint: "82.14.x.x", created_at: iso(8) },
  { id: "LA-02", email: "marcus.lee@netbeam.com", user_id: "U102", user_name: "Marcus Lee", success: true, failure_reason: null, user_agent: "Firefox/124", ip_hint: "82.14.x.x", created_at: iso(22) },
  { id: "LA-03", email: "intruder@example.com", user_id: null, user_name: null, success: false, failure_reason: "Invalid password", user_agent: "curl/8.1", ip_hint: "203.0.x.x", created_at: iso(15) },
  { id: "LA-04", email: "intruder@example.com", user_id: null, user_name: null, success: false, failure_reason: "Invalid password", user_agent: "curl/8.1", ip_hint: "203.0.x.x", created_at: iso(12) },
  { id: "LA-05", email: "intruder@example.com", user_id: null, user_name: null, success: false, failure_reason: "Invalid password", user_agent: "curl/8.1", ip_hint: "203.0.x.x", created_at: iso(9) },
  { id: "LA-06", email: "intruder@example.com", user_id: null, user_name: null, success: false, failure_reason: "Account locked", user_agent: "curl/8.1", ip_hint: "203.0.x.x", created_at: iso(5) },
  { id: "LA-07", email: "priya.patel@netbeam.com", user_id: "U103", user_name: "Priya Patel", success: false, failure_reason: "Expired session", user_agent: "Safari/17", ip_hint: "90.11.x.x", created_at: iso(40) },
  { id: "LA-08", email: "priya.patel@netbeam.com", user_id: "U103", user_name: "Priya Patel", success: true, failure_reason: null, user_agent: "Safari/17", ip_hint: "90.11.x.x", created_at: iso(38) },
  { id: "LA-09", email: "diego.alvarez@netbeam.com", user_id: "U104", user_name: "Diego Alvarez", success: true, failure_reason: null, user_agent: "Edge/123", ip_hint: "77.20.x.x", created_at: iso(120) },
  { id: "LA-10", email: "nihala.nazar@netbeam.com", user_id: "U105", user_name: "Nihala Nazar", success: true, failure_reason: null, user_agent: "Chrome/123", ip_hint: "82.14.x.x", created_at: iso(200) },
  { id: "LA-11", email: "old.bot@legacy.io", user_id: null, user_name: null, success: false, failure_reason: "Unknown user", user_agent: "python-requests/2.31", ip_hint: "198.51.x.x", created_at: iso(360) },
];

const exportColumns: CsvColumn<AuditEntry>[] = [
  { key: "timestamp", header: "Timestamp", accessor: (a) => a.timestamp },
  { key: "user", header: "User", accessor: (a) => a.user },
  { key: "role", header: "Role", accessor: (a) => a.role },
  { key: "action", header: "Action", accessor: (a) => a.action },
  { key: "entity", header: "Entity", accessor: (a) => a.entity },
  { key: "entityId", header: "Entity ID", accessor: (a) => a.entityId },
  { key: "details", header: "Details", accessor: (a) => a.details },
];

const ENTITY_COLORS: Record<string, string> = {
  Ticket: "hsl(210, 70%, 55%)",
  Message: "hsl(160, 60%, 45%)",
  User: "hsl(280, 60%, 55%)",
  Users: "hsl(280, 60%, 55%)",
  Order: "hsl(35, 80%, 50%)",
  Account: "hsl(340, 65%, 55%)",
  "Billing Adjustment": "hsl(50, 70%, 50%)",
  Settings: "hsl(200, 20%, 50%)",
  Survey: "hsl(130, 50%, 45%)",
  "Knowledge Article": "hsl(260, 40%, 55%)",
  Login: "hsl(0, 65%, 55%)",
};

const ENTITY_BADGE_VARIANTS: Record<string, string> = {
  Ticket: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Message: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  User: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Users: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Order: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Account: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "Billing Adjustment": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Settings: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
  Survey: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Knowledge Article": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Login: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

/** Detect anomalies: ≥3 failures for same email in last hour */
function detectAnomalies(attempts: LoginAttempt[]) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentFailures: Record<string, number> = {};
  attempts.forEach((a) => {
    if (!a.success && new Date(a.created_at) >= oneHourAgo) {
      recentFailures[a.email] = (recentFailures[a.email] || 0) + 1;
    }
  });
  const flagged = new Set<string>();
  Object.entries(recentFailures).forEach(([email, count]) => {
    if (count >= 3) flagged.add(email);
  });
  return flagged;
}

export default function AuditLog() {
  const [entityFilter, setEntityFilter] = React.useState<string>("All Entities");
  const [actionFilter, setActionFilter] = React.useState<string>("All Actions");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loginSearch, setLoginSearch] = React.useState("");
  const [loginOutcome, setLoginOutcome] = React.useState<string>("all");

  const entities = React.useMemo(
    () => [...new Set(auditLog.map((a) => a.entity))].sort(),
    []
  );
  const actions = React.useMemo(
    () => [...new Set(auditLog.map((a) => a.action))].sort(),
    []
  );

  const filtered = React.useMemo(() => {
    return auditLog
      .filter((a) => {
        if (entityFilter !== "All Entities" && a.entity !== entityFilter) return false;
        if (actionFilter !== "All Actions" && a.action !== actionFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            a.user.toLowerCase().includes(q) ||
            a.details.toLowerCase().includes(q) ||
            a.entityId.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [entityFilter, actionFilter, searchQuery]);

  const flaggedEmails = React.useMemo(
    () => detectAnomalies(loginAttempts),
    []
  );

  const filteredLogin = React.useMemo(() => {
    return loginAttempts.filter((a) => {
      if (loginOutcome === "success" && !a.success) return false;
      if (loginOutcome === "failed" && a.success) return false;
      if (loginOutcome === "anomaly" && !flaggedEmails.has(a.email)) return false;
      if (loginSearch) {
        const q = loginSearch.toLowerCase();
        return (
          a.email.toLowerCase().includes(q) ||
          (a.user_name || "").toLowerCase().includes(q) ||
          (a.failure_reason || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [loginOutcome, loginSearch, flaggedEmails]);

  const loginStats = React.useMemo(() => {
    const total = loginAttempts.length;
    const successes = loginAttempts.filter((a) => a.success).length;
    const failures = total - successes;
    return { total, successes, failures, anomalies: flaggedEmails.size };
  }, [flaggedEmails]);

  const entityBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((a) => {
      counts[a.entity] = (counts[a.entity] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([entity, count]) => ({
        entity,
        count,
        percent: Math.round((count / max) * 100),
      }));
  }, [filtered]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Audit Log"
        description="Every user-facing change recorded for compliance."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadCsv("audit-log", filtered, exportColumns);
                toast({
                  title: "Exported",
                  description: `${filtered.length} records → CSV.`,
                  variant: "success",
                });
              }}
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="logins" className="gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Login Attempts
            {loginStats.anomalies > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                {loginStats.anomalies}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Activity Log Tab ── */}
        <TabsContent value="activity" className="space-y-4">
          {/* Activity Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activity by Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entityBreakdown.map((d) => (
                  <div key={d.entity} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{d.entity}</span>
                      <span className="font-semibold">{d.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${d.percent}%`,
                          backgroundColor:
                            ENTITY_COLORS[d.entity] || "hsl(0,0%,60%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search user, details, ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-56 pl-8 text-sm"
                  />
                </div>
                <div className="w-44">
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Entities">All Entities</SelectItem>
                      {entities.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Actions">All Actions</SelectItem>
                      {actions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No activity matches your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-mono">
                          {new Date(a.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {a.user}
                        </TableCell>
                        <TableCell className="text-sm">{a.role}</TableCell>
                        <TableCell className="text-sm">{a.action}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              ENTITY_BADGE_VARIANTS[a.entity] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {a.entity}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a.entityId}
                        </TableCell>
                        <TableCell className="text-sm max-w-64 truncate">
                          {a.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Login Attempts Tab ── */}
        <TabsContent value="logins" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{loginStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Attempts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{loginStats.successes}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                <XCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{loginStats.failures}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={
                loginStats.anomalies > 0
                  ? "border-destructive/50 bg-destructive/5"
                  : ""
              }
            >
              <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                <AlertTriangle
                  className={`h-8 w-8 ${
                    loginStats.anomalies > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-2xl font-bold">{loginStats.anomalies}</p>
                  <p className="text-xs text-muted-foreground">
                    Anomalies (1hr)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Banner */}
          {flaggedEmails.size > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Anomalous Login Activity Detected
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The following accounts have ≥3 failed login attempts in
                      the last hour:{" "}
                      {[...flaggedEmails].map((e, i) => (
                        <span key={e}>
                          {i > 0 && ", "}
                          <span className="font-mono font-medium text-foreground">
                            {e}
                          </span>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search email, user, reason…"
                    value={loginSearch}
                    onChange={(e) => setLoginSearch(e.target.value)}
                    className="h-8 w-56 pl-8 text-sm"
                  />
                </div>
                <div className="w-40">
                  <Select value={loginOutcome} onValueChange={setLoginOutcome}>
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue placeholder="All Outcomes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="success">Successful</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="anomaly">Anomalies Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {filteredLogin.length} record
                  {filteredLogin.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Login Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Anomaly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogin.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No login attempts recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogin.map((a) => (
                      <TableRow
                        key={a.id}
                        className={
                          flaggedEmails.has(a.email) ? "bg-destructive/5" : ""
                        }
                      >
                        <TableCell className="text-xs font-mono">
                          {new Date(a.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {a.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.user_name || "—"}
                        </TableCell>
                        <TableCell>
                          {a.success ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" /> Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.failure_reason || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {a.ip_hint || "—"}
                        </TableCell>
                        <TableCell>
                          {flaggedEmails.has(a.email) && (
                            <Badge
                              variant="outline"
                              className="border-destructive text-destructive text-xs gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" /> Flagged
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
