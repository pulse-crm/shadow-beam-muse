import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success: "bg-success/15 text-success border-success/30",
        warning: "bg-warning/15 text-warning border-warning/30",
        info: "bg-info/15 text-info border-info/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type BadgeTone =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "primary"
  | "neutral";

type Variant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  tone?: BadgeTone;
}

const toneToVariant: Record<BadgeTone, Variant> = {
  default: "default",
  primary: "default",
  secondary: "secondary",
  destructive: "destructive",
  danger: "destructive",
  outline: "outline",
  neutral: "outline",
  success: "success",
  warning: "warning",
  info: "info",
};

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const resolved: Variant = variant ?? (tone ? toneToVariant[tone] : "default");
  return <span className={cn(badgeVariants({ variant: resolved }), className)} {...props} />;
}
