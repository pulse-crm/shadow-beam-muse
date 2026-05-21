import { History, Phone, Mail, MessageSquare, CreditCard, ShoppingCart, Monitor, Store } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box/icon-box";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Interaction, Payment, Order } from "@/data/mock";
import { formatCurrency } from "@/lib/format";

type TimelineKind = "interaction" | "payment" | "order";

interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  icon: React.ComponentType<{ className?: string }>;
  tone: IconBoxTone;
  title: string;
  detail: string;
  statusLabel: string;
  sortKey: number;
}

const interactionIcon: Record<Interaction["channel"], React.ComponentType<{ className?: string }>> = {
  Phone,
  Email: Mail,
  Chat: MessageSquare,
  Portal: Monitor,
  SMS: MessageSquare,
  "In-Store": Store,
};

interface ActivityTimelinePanelProps {
  interactions: Interaction[];
  payments: Payment[];
  orders: Order[];
}

export function ActivityTimelinePanel({ interactions, payments, orders }: ActivityTimelinePanelProps) {
  const entries: TimelineEntry[] = [
    ...interactions.map<TimelineEntry>((i) => ({
      id: `int-${i.id}`,
      kind: "interaction",
      icon: interactionIcon[i.channel],
      tone: "info",
      title: i.summary,
      detail: `${i.channel} · ${i.agent}`,
      statusLabel: i.channel,
      sortKey: Date.parse(i.when) || 0,
    })),
    ...payments.map<TimelineEntry>((p) => ({
      id: `pay-${p.id}`,
      kind: "payment",
      icon: CreditCard,
      tone: "success",
      title: `Payment received · ${formatCurrency(p.amount)}`,
      detail: `${p.method}${p.invoiceId ? ` · ${p.invoiceId}` : ""}`,
      statusLabel: "Paid",
      sortKey: Date.parse(p.paidAt) || 0,
    })),
    ...orders.map<TimelineEntry>((o) => ({
      id: `ord-${o.id}`,
      kind: "order",
      icon: ShoppingCart,
      tone: "primary",
      title: `${o.id} · ${o.items.join(", ")}`,
      detail: `${o.type} · ${formatCurrency(o.totalValue)}`,
      statusLabel: o.status,
      sortKey: Date.parse(o.createdAt) || 0,
    })),
  ].sort((a, b) => b.sortKey - a.sortKey);

  return (
    <CollapsiblePanel title="Activity Timeline" icon={History} count={entries.length} defaultOpen={false}>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
      ) : (
        <ol className="relative p-4">
          <span className="absolute left-[1.65rem] top-4 bottom-4 w-px bg-border" aria-hidden />
          {entries.map((e) => (
            <li key={e.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
              <IconBox icon={e.icon} tone={e.tone} size="sm" shape="circle" className="ring-4 ring-card relative z-10" />
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <StatusBadge status={e.statusLabel} className="shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </CollapsiblePanel>
  );
}
