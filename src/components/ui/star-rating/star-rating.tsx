import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  /** When true, clicking the currently-selected star clears the rating */
  clearOnSameValue?: boolean;
  className?: string;
  readOnly?: boolean;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  label,
  clearOnSameValue = true,
  className,
  readOnly,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {label && <span className="text-xs text-muted-foreground mr-1">{label}</span>}
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!onChange) return;
              onChange(clearOnSameValue && value === n ? 0 : n);
            }}
            className={cn(
              "p-0.5 transition-transform",
              !readOnly && "hover:scale-110",
              readOnly && "cursor-default"
            )}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
