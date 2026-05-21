import { useNavigate } from "react-router-dom";
import { Ticket as TicketIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Ticket } from "@/data/mock";

export function TicketResultCard({ ticket: t }: { ticket: Ticket }) {
  const navigate = useNavigate();
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
      onClick={() => navigate(`/customer/${t.customerId}`)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <TicketIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{t.subject}</span>
            <StatusBadge status={t.status} />
            <StatusBadge status={t.priority} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
            <span className="font-mono">{t.id}</span>
            <span>{t.customer}</span>
            <span>{t.category}</span>
            <span>{t.assignee}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
