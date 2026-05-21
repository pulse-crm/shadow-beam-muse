import { PoundSterling } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { BarChart } from "@/components/charts/bar-chart";
import { invoices as invoicesData, customers as customersData } from "@/data/mock";
import { formatCurrency } from "@/lib/format";

interface RevenueDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TENURE_COLORS = [
  "hsl(215 90% 52%)",
  "hsl(142 72% 40%)",
  "hsl(45 90% 52%)",
  "hsl(25 90% 52%)",
  "hsl(280 70% 50%)",
];

const SEGMENT_COLORS = [
  "hsl(215 90% 52%)",
  "hsl(142 72% 40%)",
  "hsl(25 90% 52%)",
  "hsl(280 70% 50%)",
];

function monthsDiff(from: string, to: Date) {
  const d = new Date(from);
  return (to.getFullYear() - d.getFullYear()) * 12 + (to.getMonth() - d.getMonth());
}

export function RevenueDashboardDialog({ open, onOpenChange }: RevenueDashboardDialogProps) {
  const now = new Date();

  const totalRevenue = invoicesData.reduce((s, i) => s + i.amount, 0);
  const paidRevenue = invoicesData.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoicesData.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdueRevenue = invoicesData.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  // Revenue by billing cycle (issue date month)
  const cycleMap = new Map<string, number>();
  invoicesData.forEach((inv) => {
    const month = inv.issueDate.substring(0, 7); // YYYY-MM
    cycleMap.set(month, (cycleMap.get(month) ?? 0) + inv.amount);
  });
  const cycleData = Array.from(cycleMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      label: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      value: revenue,
    }));

  // Revenue by customer segment (pulse has segment on Customer)
  const segmentMap = new Map<string, number>();
  invoicesData.forEach((inv) => {
    const cust = customersData.find((c) => c.name === inv.customer);
    const seg = cust?.segment ?? "Unknown";
    segmentMap.set(seg, (segmentMap.get(seg) ?? 0) + inv.amount);
  });
  const segmentData = Array.from(segmentMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, revenue], i) => ({
      name,
      revenue,
      pct: totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : "0",
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }));

  // Revenue by customer tenure (using joinedAt)
  const tenureBuckets = [
    { label: "< 6 months", min: 0, max: 6 },
    { label: "6–12 months", min: 6, max: 12 },
    { label: "1–2 years", min: 12, max: 24 },
    { label: "2–5 years", min: 24, max: 60 },
    { label: "5+ years", min: 60, max: Infinity },
  ];

  const tenureData = tenureBuckets.map((bucket, i) => {
    let revenue = 0;
    const seen = new Set<string>();

    invoicesData.forEach((inv) => {
      const cust = customersData.find((c) => c.name === inv.customer);
      if (!cust) return;
      const months = monthsDiff(cust.joinedAt, now);
      if (months >= bucket.min && months < bucket.max) {
        revenue += inv.amount;
        seen.add(cust.id);
      }
    });

    return {
      name: bucket.label,
      revenue,
      customers: seen.size,
      pct: totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : "0",
      color: TENURE_COLORS[i],
    };
  });

  const maxSegment = Math.max(1, ...segmentData.map((s) => s.revenue));
  const maxTenure = Math.max(1, ...tenureData.map((t) => t.revenue));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PoundSterling className="h-5 w-5" />
            Revenue Dashboard
          </DialogTitle>
        </DialogHeader>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue, 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Billed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(paidRevenue, 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{formatCurrency(pendingRevenue, 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{formatCurrency(overdueRevenue, 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Billing Cycle */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Revenue by Billing Cycle</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={cycleData} height={200} />
          </CardContent>
        </Card>

        {/* Segment & Tenure side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Revenue by Segment</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {segmentData.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{formatCurrency(s.revenue, 0)}</span>
                        <span className="text-muted-foreground w-10 text-right">{s.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(s.revenue / maxSegment) * 100}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Revenue by Customer Tenure</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {tenureData.map((t) => (
                  <div key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        {t.name}
                      </span>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-muted-foreground hidden sm:inline">
                          {t.customers} customer{t.customers !== 1 ? "s" : ""}
                        </span>
                        <span className="font-mono">{formatCurrency(t.revenue, 0)}</span>
                        <span className="text-muted-foreground w-10 text-right">{t.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(t.revenue / maxTenure) * 100}%`,
                          backgroundColor: t.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
