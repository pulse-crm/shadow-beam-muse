import { X } from "lucide-react";
import type { CustomerTag } from "@/lib/tags";

interface TagBadgeProps {
  tag: CustomerTag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
      style={{
        borderColor: `color-mix(in oklab, ${tag.color} 50%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${tag.color} 14%, transparent)`,
        color: tag.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
      {tag.label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-80"
          aria-label={`Remove ${tag.label}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}
