import * as React from "react";
import { Button } from "@/components/ui/button/button";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box/icon-box";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  iconTone?: IconBoxTone;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  iconTone = "muted",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border bg-card text-center py-10 px-6",
        className
      )}
    >
      <IconBox icon={icon} tone={iconTone} size="md" shape="square" className="mx-auto" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
