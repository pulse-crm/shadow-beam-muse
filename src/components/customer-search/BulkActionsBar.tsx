import * as React from "react";
import { Download, Tag, GitMerge, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import type { CustomerTag } from "@/lib/tags";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExport: () => void;
  onBulkTag: (tagId: string) => void;
  onMerge: () => void;
  availableTags: CustomerTag[];
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  onBulkTag,
  onMerge,
  availableTags,
}: BulkActionsBarProps) {
  const [tagId, setTagId] = React.useState<string | undefined>();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-primary/5 border-primary/20 animate-in slide-in-from-top-2 flex-wrap">
      <Badge variant="secondary" className="text-xs font-medium gap-1">
        <UserCheck className="h-3 w-3" />
        {selectedCount} selected
      </Badge>

      <div className="flex items-center gap-1.5 flex-1">
        <div className="w-[140px]">
          <Select
            value={tagId}
            onValueChange={(v) => {
              setTagId(v);
              onBulkTag(v);
              setTimeout(() => setTagId(undefined), 50);
            }}
          >
            <SelectTrigger className="h-7 text-xs">
              <Tag className="h-3 w-3" />
              <SelectValue placeholder="Apply tag…" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onExport}>
          <Download className="h-3 w-3" /> Export
        </Button>

        {selectedCount >= 2 && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onMerge}>
            <GitMerge className="h-3 w-3" /> Merge
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="h-6 w-6"
        onClick={onClearSelection}
        aria-label="Clear selection"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}