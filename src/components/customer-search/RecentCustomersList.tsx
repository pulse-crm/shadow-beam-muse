import { useNavigate } from "react-router-dom";
import { Clock, Building, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import type { Customer } from "@/data/mock";

interface RecentCustomersListProps {
  customers: Customer[];
}

export function RecentCustomersList({ customers }: RecentCustomersListProps) {
  const navigate = useNavigate();
  if (customers.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Recently Viewed
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {customers.map((c) => (
          <Card
            key={c.id}
            className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => navigate(`/customer/${c.id}`)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {c.type === "B2B" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {c.accountNumber} · {c.type}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
