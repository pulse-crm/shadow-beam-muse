import { useNavigate } from "react-router-dom";
import { Building, User, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { HealthSparkline } from "./HealthSparkline";
import { TagBadge } from "./TagBadge";
import type { Customer } from "@/data/mock";
import type { CustomerTag } from "@/lib/tags";
import { cn } from "@/lib/cn";

interface CustomerCardProps {
  customer: Customer;
  selected: boolean;
  isDuplicate?: boolean;
  tags: CustomerTag[];
  onToggleSelect: () => void;
  onRemoveTag: (tagId: string) => void;
}

export function CustomerCard({
  customer: c,
  selected,
  isDuplicate,
  tags,
  onToggleSelect,
  onRemoveTag,
}: CustomerCardProps) {
  const navigate = useNavigate();
  const score = c.creditScore;
  const healthLabel = score >= 800 ? "Healthy" : score >= 600 ? "At Risk" : "Critical";
  const healthColor =
    score >= 800
      ? "border-success/50 text-success bg-success/10"
      : score >= 600
        ? "border-warning/50 text-warning bg-warning/10"
        : "border-destructive/50 text-destructive bg-destructive/10";

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md hover:border-primary/40 transition-all",
        selected && "border-primary/60 bg-primary/5",
        isDuplicate && "ring-1 ring-warning/40"
      )}
      onClick={() => navigate(`/customer/${c.id}`)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={onToggleSelect}
          className="h-3.5 w-3.5 shrink-0"
        />
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {c.type === "B2B" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm truncate">{c.name}</span>
            <StatusBadge status={c.status} />
            <Badge variant="outline" className={cn("text-[10px] px-1 gap-0.5", healthColor)}>
              <Heart className="h-2.5 w-2.5" /> {healthLabel}
            </Badge>
            {isDuplicate && (
              <Badge variant="outline" className="text-[10px] border-warning/40 text-warning px-1">
                Possible Dup
              </Badge>
            )}
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} onRemove={() => onRemoveTag(tag.id)} />
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="font-mono">{c.accountNumber}</span>
            <span>{c.phone}</span>
            <Badge variant="outline" className="text-[10px]">{c.type}</Badge>
            <StatusBadge status={c.contractStatus} />
          </div>
        </div>
        <HealthSparkline score={c.creditScore} id={c.id} />
      </CardContent>
    </Card>
  );
}
