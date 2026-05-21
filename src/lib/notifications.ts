import * as React from "react";

export type NotificationType =
  | "sla_breach"
  | "escalation"
  | "assignment"
  | "payment_failed"
  | "contract_expiry"
  | "system"
  | "approval_rejected";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  customerId?: string;
  ticketId?: string;
}

const seed: AppNotification[] = [
  { id: "N001", type: "sla_breach", title: "SLA Breach — TKT-4503", description: "Resolution deadline breached for James Rodriguez's broadband reactivation request.", time: "5 min ago", read: false, customerId: "C003", ticketId: "TKT-4503" },
  { id: "N002", type: "escalation", title: "Ticket Escalated — TKT-4502", description: "Leased line outage at London office escalated to Senior Tech Ops.", time: "12 min ago", read: false, customerId: "C002", ticketId: "TKT-4502" },
  { id: "N003", type: "payment_failed", title: "Payment Failed — ACC-100456", description: "Direct debit payment of £34.00 failed for James Rodriguez.", time: "1 hr ago", read: false, customerId: "C003" },
  { id: "N004", type: "contract_expiry", title: "Contract Expiring — James Rodriguez", description: "Contract expires in 25 days. Retention action recommended.", time: "2 hrs ago", read: true, customerId: "C003" },
  { id: "N005", type: "assignment", title: "New Ticket Assigned — TKT-4505", description: "Add 50 new extensions to PBX assigned to you by Enterprise Sales.", time: "3 hrs ago", read: true, ticketId: "TKT-4505" },
  { id: "N006", type: "system", title: "Scheduled Maintenance", description: "Network maintenance window tonight 02:00-04:00 GMT. Some services may be affected.", time: "5 hrs ago", read: true },
];

export function useNotifications() {
  const [items, setItems] = React.useState<AppNotification[]>(seed);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = React.useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications: items, unreadCount, markAsRead, markAllAsRead, dismiss };
}
