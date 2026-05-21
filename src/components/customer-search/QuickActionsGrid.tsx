import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Receipt,
  TrendingUp,
  Calendar as CalendarIcon,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box/icon-box";

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  url: string;
  tone: IconBoxTone;
}

export const defaultQuickActions: QuickAction[] = [
  { icon: LayoutDashboard, label: "Dashboard", desc: "View overview", url: "/dashboard", tone: "primary" },
  { icon: Ticket, label: "Open Tickets", desc: "6 active", url: "/tickets", tone: "danger" },
  { icon: MessageSquare, label: "Messages", desc: "4 unread", url: "/messages", tone: "info" },
  { icon: Receipt, label: "Billing", desc: "Invoices & payments", url: "/billing", tone: "warning" },
  { icon: TrendingUp, label: "Pipeline", desc: "Deals in flight", url: "/pipeline", tone: "success" },
  { icon: CalendarIcon, label: "Calendar", desc: "Upcoming events", url: "/calendar", tone: "primary" },
  { icon: BookOpen, label: "Knowledge Base", desc: "Articles & guides", url: "/knowledge-base", tone: "muted" },
];

interface QuickActionsGridProps {
  actions?: QuickAction[];
}

export function QuickActionsGrid({ actions = defaultQuickActions }: QuickActionsGridProps) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((item) => (
        <Card
          key={item.label}
          className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
          onClick={() => navigate(item.url)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <IconBox
              icon={item.icon}
              tone={item.tone}
              size="md"
              shape="rounded"
              className="group-hover:scale-110 transition-transform"
            />
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
