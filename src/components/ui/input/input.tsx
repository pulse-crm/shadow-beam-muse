import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "full";
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", rounded = "md", error, type = "text", ...props }, ref) => {
    const sizeCls =
      size === "sm" ? "h-8 px-2.5 text-xs" : size === "lg" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm";
    const roundedCls =
      rounded === "sm"
        ? "rounded-sm"
        : rounded === "lg"
          ? "rounded-lg"
          : rounded === "full"
            ? "rounded-full"
            : "rounded-md";
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full border bg-card text-foreground placeholder:text-muted-foreground transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          sizeCls,
          roundedCls,
          error ? "border-destructive focus-visible:ring-destructive" : "border-input",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
