import * as React from "react";
import { cn } from "@/lib/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const sz =
    size === "xs"
      ? "h-3 w-3 border"
      : size === "sm"
        ? "h-4 w-4 border-2"
        : size === "lg"
          ? "h-8 w-8 border-[3px]"
          : "h-5 w-5 border-2";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-current border-t-transparent text-primary animate-spinner",
        sz,
        className
      )}
      {...props}
    />
  );
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
