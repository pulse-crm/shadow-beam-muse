import * as React from "react";
import { cn } from "@/lib/cn";

export type ActivityTone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export interface ActivityItem {
  id: string | number;
  initials: string;
  tone?: ActivityTone;
  time: React.ReactNode;
  content: React.ReactNode;
}

const toneClasses: Record<ActivityTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <ul className={cn("p-5 pt-0 space-y-4", className)}>
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
              toneClasses[it.tone ?? "neutral"]
            )}
          >
            {it.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-foreground">{it.content}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{it.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
