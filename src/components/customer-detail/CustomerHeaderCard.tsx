import { Phone, Mail, MapPin, Calendar, FileSignature, CreditCard, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HealthScoreGauge } from "./HealthScoreGauge";
import type { Customer } from "@/data/mock";
import type { CustomerTag } from "@/lib/tags";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

interface CustomerHeaderCardProps {
  customer: Customer;
  /** Kept on the prop API for callers but not rendered in the top row. */
  tags?: CustomerTag[];
  /** 0–100 score. Falls back to `customer.health`. */
  healthScore?: number;
  /** 0–100 score. */
  customerValue?: number;
  customerValueLabel?: string;
  creditLimit?: number;
  outstandingBalance?: number;
}

function creditTone(score: number) {
  if (score >= 800) return "text-success";
  if (score >= 650) return "text-warning";
  return "text-destructive";
}

function valueTone(score: number) {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-muted-foreground";
  return "text-destructive";
}

function balanceTone(amount: number) {
  if (amount > 0) return "text-destructive";
  if (amount < 0) return "text-success";
  return "text-muted-foreground";
}

function formatBalance(amount: number): string {
  return `£${Math.abs(amount).toFixed(2)}`;
}

function Stat({
  label,
  value,
  hint,
  valueClass,
  hintClass,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  valueClass?: string;
  hintClass?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn("text-xl font-bold", valueClass)}>{value}</p>
      {hint && <p className={cn("text-[10px]", hintClass ?? "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

function InfoLine({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function CustomerHeaderCard({
  customer,
  healthScore,
  customerValue,
  customerValueLabel,
  creditLimit,
  outstandingBalance = 0,
}: CustomerHeaderCardProps) {
  const profileType = customer.type === "B2C" ? "Individual" : "Business";
  const health = healthScore ?? customer.health;
  const limit = creditLimit ?? customer.creditScore * 10;
  const initial = customer.name.charAt(0).toUpperCase();
  const contractStart = customer.joinedAt;
  // Pulse mock has no explicit contract end; derive 3-year window from join.
  const contractEnd = (() => {
    const d = new Date(contractStart);
    if (isNaN(d.getTime())) return "—";
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().slice(0, 10);
  })();
  const creditClass =
    customer.creditScore >= 900 ? "A+" : customer.creditScore >= 800 ? "A" : customer.creditScore >= 700 ? "B+" : customer.creditScore >= 600 ? "B" : "C";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold flex items-center gap-2 min-w-0">
                  <span className="truncate min-w-0">{customer.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={customer.status} />
                    <StatusBadge status={profileType} />
                    <StatusBadge status={customer.type} />
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground font-mono">{customer.accountNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs">
              <InfoLine icon={Phone}>{customer.phone}</InfoLine>
              <InfoLine icon={Mail}>{customer.email}</InfoLine>
              <InfoLine icon={MapPin} className="col-span-2">
                {customer.postcode}
              </InfoLine>
              <InfoLine icon={Building}>{customer.segment}</InfoLine>
              <InfoLine icon={Calendar}>
                Contract: {formatDate(contractStart)} → {formatDate(contractEnd)}
              </InfoLine>
              <div className="flex items-center gap-1">
                <FileSignature className="h-3 w-3 text-muted-foreground shrink-0" />
                <StatusBadge status={customer.contractStatus} />
              </div>
              <InfoLine icon={CreditCard}>Credit: {creditClass}</InfoLine>
            </div>
          </div>

          <div className="flex gap-6 shrink-0 items-start">
            <HealthScoreGauge score={health} />
            {customerValue !== undefined && (
              <Stat
                label="Customer Value"
                value={customerValue}
                hint={customerValueLabel}
                valueClass={valueTone(customerValue)}
                hintClass={cn("font-semibold", valueTone(customerValue))}
              />
            )}
            <Stat
              label="Credit Score"
              value={customer.creditScore}
              hint={`Limit: £${limit.toLocaleString()}`}
              valueClass={creditTone(customer.creditScore)}
            />
            <Stat
              label="Balance"
              value={formatBalance(outstandingBalance)}
              valueClass={balanceTone(outstandingBalance)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
