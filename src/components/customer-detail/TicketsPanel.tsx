import * as React from "react";
import { AlertCircle, Phone, Mail, MessageSquare, Monitor, Globe, Bot } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { DataTable, type Column } from "@/components/ui/table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge/badge";
import { TicketDetailDialog } from "./TicketDetailDialog";
import type { Ticket } from "@/data/mock";

/** Pulse tickets have no channel field — approximate one from the category so
 *  the leading "Ch" icon column mirrors project-files. */
const categoryChannelIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Billing: Mail,
  Network: Phone,
  Provisioning: Monitor,
  Performance: MessageSquare,
};

/** Deterministic pseudo AI-confidence so the AI column has a stable value
 *  (pulse mock has no aiConfidence field). */
function aiConfidence(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 70 + (h % 30);
}

function slaPercent(t: Ticket): { pct: number; breached: boolean } {
  const created = Date.parse(t.createdAt);
  const deadline = Date.parse(t.slaDeadline);
  if (!created || !deadline) return { pct: 0, breached: false };
  const total = deadline - created;
  const elapsed = Date.now() - created;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return { pct: Math.round(pct), breached: Date.now() > deadline && t.status !== "Resolved" && t.status !== "Closed" };
}

function slaToneClass(pct: number, breached: boolean): string {
  if (breached) return "text-destructive";
  if (pct >= 80) return "text-warning";
  return "text-muted-foreground";
}

function slaBarClass(pct: number, breached: boolean): string {
  if (breached) return "bg-destructive";
  if (pct >= 80) return "bg-warning";
  return "bg-primary";
}

export function TicketsPanel({ data }: { data: Ticket[] }) {
  const [selected, setSelected] = React.useState<Ticket | null>(null);
  const [open, setOpen] = React.useState(false);

  const columns: Column<Ticket>[] = [
    {
      key: "channel",
      header: "Ch",
      render: (t) => {
        const Icon = categoryChannelIcon[t.category] ?? Globe;
        return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
      },
    },
    { key: "id", header: "ID", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
    {
      key: "subject",
      header: "Subject",
      render: (t) => <span className="font-medium max-w-[150px] truncate inline-block">{t.subject}</span>,
    },
    { key: "priority", header: "Priority", render: (t) => <StatusBadge status={t.priority} /> },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    {
      key: "sla",
      header: "SLA",
      render: (t) => {
        const { pct, breached } = slaPercent(t);
        return (
          <div className="w-16">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={slaBarClass(pct, breached)} style={{ width: `${pct}%`, height: "100%" }} />
            </div>
            <span className={`text-[9px] ${slaToneClass(pct, breached)}`}>
              {breached ? "BREACHED" : `${pct}%`}
            </span>
          </div>
        );
      },
    },
    {
      key: "esc",
      header: "Esc",
      render: (t) =>
        t.status === "Escalated" ? (
          <Badge
            variant="outline"
            className="text-[9px] bg-destructive/10 text-destructive border-destructive/30"
          >
            L1
          </Badge>
        ) : (
          <span className="text-[9px] text-muted-foreground">—</span>
        ),
    },
    {
      key: "ai",
      header: "AI",
      render: (t) => (
        <Badge variant="outline" className="text-[9px] gap-0.5 bg-primary/10 border-primary/30">
          <Bot className="h-2.5 w-2.5" />
          {aiConfidence(t.id)}%
        </Badge>
      ),
    },
    {
      key: "approval",
      header: "Approval",
      render: (t) => (
        <StatusBadge
          status={
            t.status === "Resolved" || t.status === "Closed" ? "Approved" : "Pending"
          }
        />
      ),
    },
  ];
  return (
    <>
      <CollapsiblePanel title="Open Tickets & Cases" icon={AlertCircle} count={data.length}>
        <DataTable
          columns={columns}
          data={data}
          getRowKey={(t) => t.id}
          emptyMessage="No open tickets"
          onRowClick={(t) => {
            setSelected(t);
            setOpen(true);
          }}
        />
      </CollapsiblePanel>
      <TicketDetailDialog ticket={selected} open={open} onOpenChange={setOpen} />
    </>
  );
}
