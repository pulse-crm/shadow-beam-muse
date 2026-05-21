import * as React from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { Popover } from "@/components/ui/popover/popover";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";

export type UserMenuStatus = "available" | "busy" | "away" | "offline";

const statusConfig: Record<UserMenuStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-success" },
  busy: { label: "Busy", color: "bg-destructive" },
  away: { label: "Away", color: "bg-warning" },
  offline: { label: "Offline", color: "bg-muted-foreground" },
};

const statusOrder: UserMenuStatus[] = ["available", "busy", "away", "offline"];

export interface UserMenuItem {
  /** Stable key for React; falls back to `label` if omitted. */
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  /** Called with the close() callback so handlers can defer or skip closing. */
  onSelect: (close: () => void) => void;
  tone?: "default" | "danger";
  /** Render a separator line above this item — useful for grouping Sign Out. */
  separatorBefore?: boolean;
  disabled?: boolean;
}

type Side = "bottom" | "top" | "left" | "right";
type Align = "start" | "center" | "end";

interface UserMenuProps {
  name?: string;
  email?: string;
  role?: string;
  initials?: string;
  avatarSrc?: string;
  /** Controlled current status. Omit to let the component manage it internally. */
  status?: UserMenuStatus;
  defaultStatus?: UserMenuStatus;
  onStatusChange?: (next: UserMenuStatus) => void;
  /** Override the default 4-item menu. */
  items?: UserMenuItem[];
  /** Append extra items to the default menu instead of replacing it. */
  extraItems?: UserMenuItem[];
  side?: Side;
  align?: Align;
  width?: number;
  className?: string;
}

function defaultItems(navigate: (path: string) => void): UserMenuItem[] {
  return [
    {
      id: "profile",
      icon: UserIcon,
      label: "My Profile",
      onSelect: (close) => {
        close();
        navigate("/settings");
      },
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      onSelect: (close) => {
        close();
        navigate("/settings");
      },
    },
    {
      id: "help",
      icon: HelpCircle,
      label: "Help & Support",
      onSelect: (close) => {
        close();
        toast({ title: "Help centre", description: "Documentation opens in a new tab soon." });
      },
    },
    {
      id: "signout",
      icon: LogOut,
      label: "Sign Out",
      tone: "danger",
      separatorBefore: true,
      onSelect: (close) => {
        close();
        toast({ title: "Signed out", description: "You have been signed out of PulseGS." });
      },
    },
  ];
}

export function UserMenu({
  name = "Nihala Nazar",
  email = "nihala.nazar@timegroup.com",
  role = "Software Developer",
  initials = "NN",
  avatarSrc,
  status: controlledStatus,
  defaultStatus = "available",
  onStatusChange,
  items,
  extraItems,
  side = "bottom",
  align = "end",
  width = 224,
  className,
}: UserMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [internalStatus, setInternalStatus] = React.useState<UserMenuStatus>(defaultStatus);
  const status = controlledStatus ?? internalStatus;
  const close = React.useCallback(() => setOpen(false), []);

  // Reset the sub-popover whenever the parent menu closes.
  React.useEffect(() => {
    if (!open) setStatusOpen(false);
  }, [open]);

  const changeStatus = (next: UserMenuStatus) => {
    if (controlledStatus === undefined) setInternalStatus(next);
    onStatusChange?.(next);
    setStatusOpen(false);
  };

  const resolvedItems = React.useMemo<UserMenuItem[]>(() => {
    const base = items ?? defaultItems(navigate);
    return extraItems ? [...base, ...extraItems] : base;
  }, [items, extraItems, navigate]);

  const statusInfo = statusConfig[status];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side={side}
      align={align}
      width={width}
      className={cn("p-0", className)}
      trigger={
        <button
          type="button"
          aria-label="Open user menu"
          className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/30 focus:outline-none focus:ring-primary/50 transition-all"
        >
          <Avatar className="h-8 w-8">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card", statusInfo.color)} />
        </button>
      }
    >
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setStatusOpen((v) => !v)}
            aria-expanded={statusOpen}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.color)} />
            <span className="text-[10px] text-muted-foreground">
              {statusInfo.label} · {role}
            </span>
            <ChevronDown
              className={cn(
                "h-2.5 w-2.5 text-muted-foreground transition-transform",
                statusOpen && "rotate-180"
              )}
            />
          </button>
          {statusOpen && (
            <div className="absolute left-0 top-full mt-1 w-40 rounded-md border border-border bg-popover shadow-md z-50 py-1 animate-scale-in">
              {statusOrder.map((s) => {
                const conf = statusConfig[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(s)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent transition-colors text-left",
                      s === status && "bg-accent font-medium"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", conf.color)} />
                    {conf.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="py-1">
        {resolvedItems.map((item) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id ?? item.label}>
              {item.separatorBefore && <div className="my-1 border-t border-border" />}
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => item.onSelect(close)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left",
                  item.tone === "danger" && "text-destructive hover:text-destructive",
                  item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </Popover>
  );
}
