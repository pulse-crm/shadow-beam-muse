import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Order } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/format";

export function OrderResultCard({ order: o }: { order: Order }) {
  const navigate = useNavigate();
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
      onClick={() => navigate(`/customer/${o.customerId}`)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <ShoppingCart className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{o.items.join(", ")}</span>
            <StatusBadge status={o.status} />
            <StatusBadge status={o.type} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="font-mono">{o.id}</span>
            <span>{o.customer}</span>
            <span>{formatCurrency(o.totalValue)}</span>
            <span>{formatDate(o.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
