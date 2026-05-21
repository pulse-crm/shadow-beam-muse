import * as React from "react";
import { cn } from "@/lib/cn";

interface RadioGroupContextValue {
  value: string;
  onChange: (v: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onValueChange: (v: string) => void;
  name?: string;
}

let radioCounter = 0;

export function RadioGroup({ value, onValueChange, name, className, children, ...props }: RadioGroupProps) {
  const groupName = React.useMemo(() => name ?? `radio-group-${++radioCounter}`, [name]);
  return (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange, name: groupName }}>
      <div role="radiogroup" className={cn("grid gap-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) return null;
    const checked = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={() => ctx.onChange(value)}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-input ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked && "border-primary",
          "flex items-center justify-center transition-colors",
          className
        )}
        id={(props as { id?: string }).id}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </button>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";
