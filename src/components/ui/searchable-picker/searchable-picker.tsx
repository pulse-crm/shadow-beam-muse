import * as React from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { cn } from "@/lib/cn";

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchablePickerProps {
  options: PickerOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchablePicker({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  className,
}: SearchablePickerProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs pl-8"
        />
      </div>
      <div className="max-h-[160px] overflow-y-auto">
        <div className="space-y-0.5">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">No results found</p>
          )}
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onValueChange(opt.value)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left",
                value === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <div className="flex-1 min-w-0">
                <span className="block truncate">{opt.label}</span>
                {opt.description && (
                  <span className="block text-[10px] text-muted-foreground truncate">
                    {opt.description}
                  </span>
                )}
              </div>
              {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}