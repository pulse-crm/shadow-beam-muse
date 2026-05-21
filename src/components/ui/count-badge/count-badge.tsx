import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const countBadgeVariants = cva(
  "inline-flex items-center justify-center font-semibold leading-none rounded-full px-1.5 shrink-0",
  {
    variants: {
      tone: {
        primary: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        success: "bg-success text-success-foreground",
        muted: "bg-muted text-muted-foreground border border-border",
      },
      size: {
        xs: "h-4 min-w-[16px] text-[10px]",
        sm: "h-5 min-w-[20px] text-[10px]",
        md: "h-6 min-w-[24px] text-xs",
      },
      placement: {
        inline: "",
        topRight: "absolute -top-1 -right-1",
      },
    },
    defaultVariants: { tone: "primary", size: "sm", placement: "inline" },
  }
);

interface CountBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof countBadgeVariants> {
  count?: number;
  /** When > this number, render `${max}+` instead of the exact count */
  max?: number;
  /** Hide the badge when count is 0 or undefined */
  hideWhenZero?: boolean;
}

export function CountBadge({
  count,
  max = 99,
  hideWhenZero = true,
  tone,
  size,
  placement,
  className,
  children,
  ...props
}: CountBadgeProps) {
  const value = count;
  if (hideWhenZero && (!value || value <= 0)) return null;
  const label =
    typeof value === "number" && value > max ? `${max}+` : value !== undefined ? String(value) : children;
  return (
    <span className={cn(countBadgeVariants({ tone, size, placement }), className)} {...props}>
      {label}
    </span>
  );
}
