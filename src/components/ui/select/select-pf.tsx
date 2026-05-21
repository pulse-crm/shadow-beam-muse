import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectContextValue {
  value: string | undefined;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
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
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;
  const handle = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };
  return (
    <SelectContext.Provider value={{ value, onValueChange: handle, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      aria-expanded={ctx.open}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTriggerPf";

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
  React.useEffect(() => {
    if (!ctx?.open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ctx.setOpen(false);
    };
    const id = window.setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", onClick);
    };
  }, [ctx?.open, ctx]);
  if (!ctx?.open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 right-0 top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-fade-in max-h-96 overflow-y-auto",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
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
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors text-left",
        isSelected && "bg-accent/60 text-accent-foreground",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}