import * as React from "react";
import { cn } from "@/lib/cn";

interface SectionTitleProps {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

export function SectionTitle({ icon: Icon, children, count, action, className }: SectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {children}
        {count !== undefined && (
          <span className="text-xs text-muted-foreground font-normal">({count})</span>
        )}
      </h4>
      {action}
    </div>
  );
}
