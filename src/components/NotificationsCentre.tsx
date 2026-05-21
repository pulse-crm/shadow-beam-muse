import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  ArrowUpCircle,
  UserPlus,
  CreditCard,
  CalendarClock,
  Server,
  X,
  CheckCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Popover } from "@/components/ui/popover/popover";
import { CountBadge } from "@/components/ui/count-badge/count-badge";
import { useNotifications, type AppNotification, type NotificationType } from "@/lib/notifications";
import { cn } from "@/lib/cn";

const typeConfig: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  sla_breach: { icon: AlertTriangle, color: "text-destructive" },
  escalation: { icon: ArrowUpCircle, color: "text-warning" },
  assignment: { icon: UserPlus, color: "text-primary" },
  payment_failed: { icon: CreditCard, color: "text-destructive" },
  contract_expiry: { icon: CalendarClock, color: "text-warning" },
  system: { icon: Server, color: "text-muted-foreground" },
  approval_rejected: { icon: X, color: "text-destructive" },
};

export function NotificationsCentre() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [open, setOpen] = React.useState(false);

  const handleClick = (n: AppNotification) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.customerId) navigate(`/customer/${n.customerId}`);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      width={400}
      className="p-0"
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <CountBadge
            count={unreadCount}
            tone="destructive"
            size="xs"
            placement="topRight"
            className="-top-0.5 -right-0.5"
          />
        </Button>
      }
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">Notifications</h3>
          <p className="text-[10px] text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={markAllAsRead}>
            <CheckCheck className="h-3 w-3" /> Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {notifications.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground">No notifications</div>
        )}
        <div className="divide-y divide-border">
          {notifications.map((n) => {
            const conf = typeConfig[n.type] ?? typeConfig.system;
            const Icon = conf.icon;
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => handleClick(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(n);
                  }
                }}
                className={cn(
                  "p-3 hover:bg-accent/50 cursor-pointer transition-colors relative group",
                  !n.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", conf.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium truncate">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{n.description}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5" /> {n.time}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}
