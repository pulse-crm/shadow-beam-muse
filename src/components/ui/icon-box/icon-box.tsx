import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconBoxVariants = cva(
  "flex items-center justify-center shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
        danger: "bg-destructive/10 text-destructive",
        muted: "bg-muted text-muted-foreground",
        solid: "bg-primary text-primary-foreground",
      },
      size: {
        xs: "h-6 w-6 [&_svg]:size-3",
        sm: "h-8 w-8 [&_svg]:size-4",
        md: "h-10 w-10 [&_svg]:size-5",
        lg: "h-12 w-12 [&_svg]:size-6",
        xl: "h-14 w-14 [&_svg]:size-7",
      },
      shape: {
        square: "rounded-md",
        rounded: "rounded-lg",
        circle: "rounded-full",
      },
    },
    defaultVariants: { tone: "primary", size: "md", shape: "square" },
  }
);

export type IconBoxTone = NonNullable<VariantProps<typeof iconBoxVariants>["tone"]>;
export type IconBoxSize = NonNullable<VariantProps<typeof iconBoxVariants>["size"]>;
export type IconBoxShape = NonNullable<VariantProps<typeof iconBoxVariants>["shape"]>;

interface IconBoxProps extends VariantProps<typeof iconBoxVariants> {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function IconBox({ icon: Icon, tone, size, shape, className }: IconBoxProps) {
  return (
    <div className={cn(iconBoxVariants({ tone, size, shape }), className)}>
      <Icon />
    </div>
  );
}
