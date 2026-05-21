import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { toast } from "@/components/ui/toast/toaster";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import type { BillingAdjustment } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table/table";
import { Badge } from "@/components/ui/badge/badge";
import { invoices, customers, billingAdjustments } from "@/data/mock";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function Billing() {
  const [adjSort, setAdjSort] = React.useState<{
    key: "submittedAt" | "amount";
    dir: "asc" | "desc";
  } | null>(null);

  const paidTotal = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingTotal = invoices
    .filter((i) => i.status === "Pending")
    .reduce((s, i) => s + i.amount, 0);
  const overdueTotal = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((s, i) => s + i.amount, 0);
  const totalRevenue = paidTotal + pendingTotal + overdueTotal;

  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const uniqueCustomerNames = Array.from(new Set(invoices.map((i) => i.customer)));
  const collectionRate =
    totalRevenue > 0 ? ((paidTotal / totalRevenue) * 100).toFixed(1) : "0";

  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");

  // Top 10 customers by outstanding balance
  const topOutstanding = uniqueCustomerNames
    .map((name) => {
      const custInvoices = invoices.filter((i) => i.customer === name);
      const cp = custInvoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
      const cpe = custInvoices
        .filter((i) => i.status === "Pending")
        .reduce((s, i) => s + i.amount, 0);
      const co = custInvoices
        .filter((i) => i.status === "Overdue")
        .reduce((s, i) => s + i.amount, 0);
      return { name, paid: cp, pending: cpe, overdue: co, total: cp + cpe + co };
    })
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, 10);

  // Aging buckets
  const now = new Date();
  let d30 = 0,
    d60 = 0,
    d90 = 0;
  overdueInvoices.forEach((i) => {
    const days = Math.floor(
      (now.getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 30) d30 += i.amount;
    else if (days <= 60) d60 += i.amount;
    else d90 += i.amount;
  });

  // Revenue by customer tenure (using joinedAt as contract start)
  const ageBuckets: Record<string, { total: number; customerIds: Set<string> }> = {
    "0–3 months": { total: 0, customerIds: new Set() },
    "3–6 months": { total: 0, customerIds: new Set() },
    "6–12 months": { total: 0, customerIds: new Set() },
    "1–3 years": { total: 0, customerIds: new Set() },
    "3+ years": { total: 0, customerIds: new Set() },
  };
  invoices.forEach((inv) => {
    const cust = customers.find((c) => c.name === inv.customer);
    if (!cust) return;
    const months = Math.floor(
      (now.getTime() - new Date(cust.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );
    let bucket = "3+ years";
    if (months < 3) bucket = "0–3 months";
    else if (months < 6) bucket = "3–6 months";
    else if (months < 12) bucket = "6–12 months";
    else if (months < 36) bucket = "1–3 years";
    ageBuckets[bucket].total += inv.amount;
    ageBuckets[bucket].customerIds.add(cust.id);
  });
  const bucketOrder = ["0–3 months", "3–6 months", "6–12 months", "1–3 years", "3+ years"];
  const grandTotal = Object.values(ageBuckets).reduce((s, v) => s + v.total, 0);

  const sortedAdjustments = [...billingAdjustments].sort((a, b) => {
    if (!adjSort) return 0;
    const mul = adjSort.dir === "asc" ? 1 : -1;
    if (adjSort.key === "amount") return (a.amount - b.amount) * mul;
    return (
      (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) * mul
    );
  });

  const toggleSort = (key: "submittedAt" | "amount") =>
    setAdjSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(paidTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Pending</p>
              <p className="text-2xl font-bold">{formatCurrency(pendingTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(overdueTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoice Summary</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="adjustments" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Adjustment Audit
          </TabsTrigger>
        </TabsList>

        {/* Invoice Summary */}
        <TabsContent value="invoices">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Invoicing Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Invoices</span>
                  <span className="font-bold text-lg">{invoices.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-lg">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Collection Rate</span>
                  <span className="font-bold text-lg text-success">{collectionRate}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Active Customers</span>
                  <span className="font-bold text-lg">{uniqueCustomerNames.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Paid
                    </span>
                    <span className="font-medium">
                      {paidCount} invoices — {formatCurrency(paidTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{
                        width: `${totalRevenue > 0 ? (paidTotal / totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-info" /> Pending
                    </span>
                    <span className="font-medium">
                      {pendingCount} invoices — {formatCurrency(pendingTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-info h-2 rounded-full"
                      style={{
                        width: `${totalRevenue > 0 ? (pendingTotal / totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Overdue
                    </span>
                    <span className="font-medium">
                      {overdueCount} invoices — {formatCurrency(overdueTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full"
                      style={{
                        width: `${totalRevenue > 0 ? (overdueTotal / totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collections */}
        <TabsContent value="collections">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Accounts by Outstanding Balance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Overdue</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topOutstanding.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-success">
                          {formatCurrency(row.paid)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(row.pending)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-destructive">
                          {formatCurrency(row.overdue)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold">
                          {formatCurrency(row.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overdue Accounts — Aging Buckets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-warning/10 text-center">
                    <p className="text-xs text-muted-foreground">30 Days</p>
                    <p className="text-xl font-bold text-warning">{formatCurrency(d30)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 text-center">
                    <p className="text-xs text-muted-foreground">60 Days</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(d60)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/20 text-center">
                    <p className="text-xs text-muted-foreground">90+ Days</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(d90)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Invoice Revenue by Customer Tenure</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenure</TableHead>
                      <TableHead className="text-center">Customers</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bucketOrder.map((bucket) => {
                      const data = ageBuckets[bucket];
                      return (
                        <TableRow key={bucket}>
                          <TableCell className="font-medium">{bucket}</TableCell>
                          <TableCell className="text-center">{data.customerIds.size}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(data.total)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {grandTotal > 0
                              ? ((data.total / grandTotal) * 100).toFixed(1)
                              : "0"}
                            %
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center">
                        {uniqueCustomerNames.length}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(grandTotal)}
                      </TableCell>
                      <TableCell className="text-right font-mono">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Adjustment Audit */}
        <TabsContent value="adjustments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">Billing Adjustment Audit Trail</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cols: CsvColumn<BillingAdjustment>[] = [
                      { key: "id", header: "ID", accessor: (a) => a.id },
                      { key: "invoiceId", header: "Invoice", accessor: (a) => a.invoiceId },
                      { key: "customer", header: "Customer", accessor: (a) => a.customer },
                      { key: "type", header: "Type", accessor: (a) => a.type },
                      { key: "reason", header: "Reason", accessor: (a) => a.reason },
                      { key: "amount", header: "Amount", accessor: (a) => a.amount },
                      { key: "requestedBy", header: "Submitted By", accessor: (a) => a.requestedBy },
                      { key: "submittedAt", header: "Submitted At", accessor: (a) => a.submittedAt },
                      { key: "approvedBy", header: "Approved By", accessor: (a) => a.approvedBy ?? "" },
                      { key: "approvedAt", header: "Approved At", accessor: (a) => a.approvedAt ?? "" },
                      { key: "status", header: "Status", accessor: (a) => a.status },
                    ];
                    downloadCsv("billing-adjustments", sortedAdjustments, cols);
                    toast({
                      title: "Exported",
                      description: `${sortedAdjustments.length} adjustments → CSV.`,
                      variant: "success",
                    });
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort("amount")}
                    >
                      <span className="inline-flex items-center gap-1 justify-end w-full">
                        Amount
                        {adjSort?.key === "amount" ? (
                          adjSort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort("submittedAt")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Submitted At
                        {adjSort?.key === "submittedAt" ? (
                          adjSort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Approved At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAdjustments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="font-mono text-xs">{a.invoiceId}</TableCell>
                      <TableCell className="font-medium text-sm">{a.customer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={a.type === "Credit" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {a.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.reason}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono",
                          a.amount < 0 ? "text-destructive" : "text-success"
                        )}
                      >
                        {formatCurrency(a.amount)}
                      </TableCell>
                      <TableCell className="text-sm">{a.requestedBy}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(a.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.approvedBy ?? (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {a.approvedAt ? (
                          new Date(a.approvedAt).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            a.status === "Approved"
                              ? "border-success/50 text-success bg-success/10"
                              : a.status === "Pending"
                                ? "border-warning/50 text-warning bg-warning/10"
                                : "border-destructive/50 text-destructive bg-destructive/10"
                          )}
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
