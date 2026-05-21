import * as React from "react";
import { cn } from "@/lib/cn";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  tone?: "primary" | "success" | "warning" | "destructive";
}

export function Progress({ className, value = 0, tone = "primary", ...props }: ProgressProps) {
  const fill =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "destructive"
          ? "bg-destructive"
          : "bg-primary";
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div
        className={cn("h-full transition-all duration-300 rounded-full", fill)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
