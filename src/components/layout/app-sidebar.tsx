import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Package,
  Settings,
  ClipboardList,
  Ticket,
  MessageSquare,
  Receipt,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Kanban,
  SmilePlus,
  CalendarDays,
  Mail,
  HelpCircle,
  Network,
  Server,
  Megaphone,
  Users,
  ChevronDown,
  GitBranch,
  Timer,
  Database,
  ScrollText,
  Clock,
} from "lucide-react";
import pulseLogo from "@/assets/pulse-logo.png";
import { cn } from "@/lib/cn";
import { CountBadge } from "@/components/ui/count-badge/count-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible/collapsible";
import { Separator } from "@/components/ui/separator/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { FeedbackButton } from "@/components/FeedbackButton";
import { useSidebar } from "./sidebar-context";
import { customers } from "@/data/mock";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Customer Management", url: "/", icon: Search },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Tickets", url: "/tickets", icon: Ticket, badgeCount: 6 },
      { title: "Messages", url: "/messages", icon: MessageSquare, badgeCount: 3 },
      { title: "Pipeline", url: "/pipeline", icon: Kanban },
      { title: "Calendar", url: "/calendar", icon: CalendarDays, badgeCount: 2 },
      { title: "Product Catalogue", url: "/products", icon: Package },
      { title: "Billing", url: "/billing", icon: Receipt },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
      { title: "Email Templates", url: "/email-templates", icon: Mail },
      { title: "Surveys & CSAT", url: "/surveys", icon: SmilePlus },
      { title: "Demo Data", url: "/demo-data", icon: Database },
      { title: "Changelog", url: "/changelog", icon: ScrollText },
      { title: "Documentation", url: "/docs", icon: HelpCircle },
      { title: "Architecture", url: "/architecture", icon: Network },
      { title: "Platform", url: "/platform", icon: Server },
      { title: "Feedback Log", url: "/feedback-log", icon: MessageSquare },
    ],
  },
  {
    label: "Administration",
    adminOnly: false,
    items: [
      { title: "User Management", url: "/user-management", icon: Users },
      { title: "Escalation Workflows", url: "/escalation-workflows", icon: GitBranch },
      { title: "SLA Policies", url: "/sla-policies", icon: Timer },
      { title: "Announcements", url: "/announcements", icon: Megaphone },
      { title: "Approvals", url: "/approvals", icon: ClipboardCheck, badgeCount: 3 },
      { title: "Performance", url: "/performance", icon: BarChart3 },
      { title: "Audit Log", url: "/audit", icon: ClipboardList },
      { title: "My Profile", url: "/settings", icon: Settings },
    ],
  },
];

function NavBadge({ count }: { count?: number }) {
  return <CountBadge count={count} tone="primary" size="sm" className="ml-auto" />;
}

function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">About PulseGS</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <img src={pulseLogo} alt="PulseGS logo" className="h-20 w-40 object-contain" />
          <Separator />
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">PulseGS</h3>
            <p className="text-sm text-muted-foreground">Customer Management Platform</p>
          </div>
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Release Date</span>
              <span className="font-medium text-foreground">Feb 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Release Number</span>
              <span className="font-medium text-foreground">Alpha 001</span>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">© Netbeam 2026. All rights reserved.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppSidebar() {
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const location = useLocation();
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const getInitialOpenState = React.useCallback(() => {
    const open: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      const hasActive = group.items.some((item) =>
        item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
      );
      open[group.label] = hasActive;
    });
    if (!Object.values(open).some(Boolean)) open["Main"] = true;
    return open;
  }, [location.pathname]);

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(getInitialOpenState);

  React.useEffect(() => {
    setOpenGroups(getInitialOpenState());
  }, [getInitialOpenState]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden transition-transform duration-200 ease-in-out",
          // Mobile: fixed off-canvas drawer
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, collapsible by width
          "md:static md:translate-x-0 md:min-h-screen md:shrink-0 md:transition-[width]",
          collapsed ? "md:w-0 md:border-r-0" : "md:w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 w-full">
            <FeedbackButton className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
            <button
              onClick={() => setAboutOpen(true)}
              className="flex flex-col items-center gap-2 flex-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src={pulseLogo}
                alt="PulseGS logo"
                className="h-20 w-40 rounded-md object-contain"
              />
              <div>
                <h2 className="text-sm font-bold text-sidebar-foreground tracking-tight">PulseGS</h2>
                <p className="text-[10px] text-sidebar-foreground/60">Customer Management</p>
              </div>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin">
          {navigationGroups.map((group) => (
            <Collapsible
              key={group.label}
              open={openGroups[group.label] ?? false}
              onOpenChange={() => toggleGroup(group.label)}
              className="mb-1"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
                <span>{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openGroups[group.label] ? "rotate-0" : "-rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 pt-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    end={item.url === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    <NavBadge count={item.badgeCount} />
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Recent (mock) */}
          <Collapsible defaultOpen className="mb-1">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Recent
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 pt-1">
              {customers.slice(0, 3).map((c) => (
                <NavLink
                  key={c.id}
                  to={`/customer/${c.id}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )
                  }
                >
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{c.name}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                NN
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">Nihala Nazar</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-[10px] text-sidebar-foreground/60">Online · Supervisor</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
