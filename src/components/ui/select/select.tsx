import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectContextValue {
  value: string | undefined;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}
const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}

export function Select({ value: controlled, defaultValue, onValueChange, children }: SelectProps) {
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;
  const handle = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };
  return (
    <SelectContext.Provider value={{ value, onValueChange: handle, open, setOpen, triggerRef }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  const localRef = React.useRef<HTMLButtonElement | null>(null);
  const setRefs = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (ctx) ctx.triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLButtonElement | null>).current = node;
  };
  if (!ctx) return null;
  return (
    <button
      ref={setRefs}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      aria-expanded={ctx.open}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <span className={cn("truncate", !ctx.value && "text-muted-foreground", className)}>
      {ctx.value || placeholder}
    </span>
  );
}

export function SelectContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!ctx?.open || !ctx.triggerRef.current) return;
    const measure = () => {
      const rect = ctx.triggerRef.current!.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [ctx?.open, ctx?.triggerRef]);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current && ref.current.contains(target)) return;
      if (ctx.triggerRef.current && ctx.triggerRef.current.contains(target)) return;
      ctx.setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ctx?.open, ctx]);

  if (!ctx?.open || !pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      className={cn(
        "fixed z-[60] min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-fade-in max-h-60 overflow-y-auto",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>,
    document.body
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const isSelected = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
    >
      <span className="flex-1 text-left">{children}</span>
      {isSelected && <Check className="h-3.5 w-3.5 ml-2" />}
    </button>
  );
}
