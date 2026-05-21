import * as React from "react";
import { Filter, X, Tag, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible/collapsible";
import type { CustomerTag } from "@/lib/tags";

export interface CustomerFilters {
  status: string;
  type: string;
  segment: string;
  contractStatus: string;
  tagId: string;
}

export const emptyFilters: CustomerFilters = {
  status: "",
  type: "",
  segment: "",
  contractStatus: "",
  tagId: "",
};

const statusOptions = ["Active", "Suspended", "Pending", "Closed"] as const;
const typeOptions = ["B2C", "B2B"] as const;
const segmentOptions = ["Consumer", "SMB", "Enterprise", "Government"] as const;
const contractStatusOptions = ["Active", "Expiring Soon", "Expired", "Renewed", "Pending"] as const;

interface CustomerFilterBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  tags: CustomerTag[];
  onAddTag: (tag: CustomerTag) => void;
}

export function CustomerFilterBar({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  tags,
  onAddTag,
}: CustomerFilterBarProps) {
  const [newTagInput, setNewTagInput] = React.useState("");
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const setFilter = (patch: Partial<CustomerFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  const handleAddTag = () => {
    const label = newTagInput.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (tags.some((t) => t.id === id)) return;
    const hue = Math.floor(Math.random() * 360);
    onAddTag({ id, label, color: `hsl(${hue} 65% 45%)` });
    setNewTagInput("");
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleContent>
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filter Customers
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => onFiltersChange(emptyFilters)}
                >
                  <X className="h-2.5 w-2.5" /> Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Select
                value={filters.status}
                onValueChange={(v) => setFilter({ status: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.type}
                onValueChange={(v) => setFilter({ type: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {typeOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.segment}
                onValueChange={(v) => setFilter({ segment: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  {segmentOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.contractStatus}
                onValueChange={(v) => setFilter({ contractStatus: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  {contractStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.tagId}
                onValueChange={(v) => setFilter({ tagId: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((t) => (
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

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="New tag name…"
                size="sm"
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleAddTag}
                disabled={!newTagInput.trim()}
              >
                <Plus className="h-2.5 w-2.5" /> Add Tag
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
