import * as React from "react";
import { cn } from "@/lib/cn";

interface CollapsibleCtx {
  open: boolean;
  toggle: () => void;
}
const Ctx = React.createContext<CollapsibleCtx | null>(null);

interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;
  const toggle = React.useCallback(() => {
    const next = !open;
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);
  return (
    <Ctx.Provider value={{ open, toggle }}>
      <div className={cn(className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function CollapsibleTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={ctx.toggle}
      aria-expanded={ctx.open}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return (
    <div className={cn("animate-fade-in", className)} {...props}>
      {children}
    </div>
  );
}
