import * as React from "react";
import { Receipt, Eye, PoundSterling, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { DataTable, type Column } from "@/components/ui/table/data-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { InvoiceViewDialog } from "./InvoiceViewDialog";
import { BillingAdjustDialog } from "./BillingAdjustDialog";
import type { Invoice, Payment, BillingAdjustment } from "@/data/mock";
import { billingAdjustments, discounts as allDiscounts } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

interface InvoicesPanelProps {
  invoices: Invoice[];
  /** Customer name — used to look up billing adjustments which key by customer name. */
  customerName?: string;
  /** Kept on the prop API for callers but not rendered as a separate table to match project-files. */
  payments?: Payment[];
}

function daysOverdue(dueIso: string): number {
  const due = Date.parse(dueIso);
  if (!due) return 0;
  return Math.max(0, Math.floor((Date.now() - due) / (1000 * 60 * 60 * 24)));
}

function KpiTile({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: number;
  tone: "success" | "info" | "destructive";
}) {
  const bg = { success: "bg-success/10", info: "bg-info/10", destructive: "bg-destructive/10" }[tone];
  const text = { success: "text-success", info: "text-info", destructive: "text-destructive" }[tone];
  return (
    <div className={cn("p-3 rounded-lg text-center", bg)}>
      <p className="text-[10px] uppercase text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-lg font-bold", text)}>{formatCurrency(amount)}</p>
    </div>
  );
}

export function InvoicesPanel({ invoices, customerName, payments = [] }: InvoicesPanelProps) {
  const [tab, setTab] = React.useState("invoices");
  const [viewInvoice, setViewInvoice] = React.useState<Invoice | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [adjustInvoice, setAdjustInvoice] = React.useState<Invoice | null>(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const paidTotal = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingTotal = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdueTotal = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
  const bucket30 = overdueInvoices
    .filter((i) => daysOverdue(i.dueDate) <= 30)
    .reduce((s, i) => s + i.amount, 0);
  const bucket60 = overdueInvoices
    .filter((i) => {
      const d = daysOverdue(i.dueDate);
      return d > 30 && d <= 60;
    })
    .reduce((s, i) => s + i.amount, 0);
  const bucket90 = overdueInvoices
    .filter((i) => daysOverdue(i.dueDate) > 60)
    .reduce((s, i) => s + i.amount, 0);

  const custAdjustments = customerName
    ? billingAdjustments.filter((a) => a.customer === customerName)
    : [];

  const collectionsColumns: Column<Invoice>[] = [
    { key: "id", header: "Invoice", render: (i) => <span className="font-mono text-xs">{i.id}</span> },
    { key: "due", header: "Due Date", render: (i) => <span className="text-xs">{formatDate(i.dueDate)}</span> },
    {
      key: "days",
      header: "Days Overdue",
      render: (i) => <span className="text-xs text-destructive font-medium">{daysOverdue(i.dueDate)} days</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (i) => <span className="font-mono text-xs">{formatCurrency(i.amount)}</span>,
    },
  ];

  const adjustmentColumns: Column<BillingAdjustment>[] = [
    { key: "id", header: "ID", render: (a) => <span className="font-mono text-xs">{a.id}</span> },
    {
      key: "invoice",
      header: "Invoice",
      render: (a) => <span className="font-mono text-xs">{a.invoiceId}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (a) => (
        <Badge variant={a.type === "Credit" ? "default" : "secondary"} className="text-[10px]">
          {a.type}
        </Badge>
      ),
    },
    { key: "reason", header: "Reason", render: (a) => <span className="text-xs">{a.reason}</span> },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (a) => (
        <span className="font-mono text-xs">£{Math.abs(a.amount).toFixed(2)}</span>
      ),
    },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <>
      <CollapsiblePanel title="Invoices & Payments" icon={Receipt} count={invoices.length}>
        <div className="grid grid-cols-3 gap-3 p-3">
          <KpiTile label="Paid" amount={paidTotal} tone="success" />
          <KpiTile label="Pending" amount={pendingTotal} tone="info" />
          <KpiTile label="Overdue" amount={overdueTotal} tone="destructive" />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="px-3 pb-3">
          <TabsList className="h-8">
            <TabsTrigger value="invoices" className="text-xs h-7">Invoices</TabsTrigger>
            <TabsTrigger value="collections" className="text-xs h-7">Collections</TabsTrigger>
            <TabsTrigger value="adjustments" className="text-xs h-7">Adjustment Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-2 space-y-3">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="w-8" />
                  <TableHead>Invoice</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right" />
                </tr>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 && (
                  <tr>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No invoices
                    </TableCell>
                  </tr>
                )}
                {invoices.map((i) => {
                  const isOpen = expanded.has(i.id);
                  const invPayments = payments.filter((p) => p.invoiceId === i.id);
                  return (
                    <React.Fragment key={i.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => toggleExpand(i.id)}
                      >
                        <TableCell className="py-2 w-8">
                          {invPayments.length > 0 ? (
                            isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )
                          ) : null}
                        </TableCell>
                        <TableCell className="font-mono text-xs py-2">{i.id}</TableCell>
                        <TableCell className="text-xs py-2">{formatDate(i.issueDate)}</TableCell>
                        <TableCell className="py-2">
                          <StatusBadge status={i.status} />
                        </TableCell>
                        <TableCell className="py-2 text-right font-mono text-xs">
                          {formatCurrency(i.amount)}
                        </TableCell>
                        <TableCell className="py-2 text-xs">{formatDate(i.dueDate)}</TableCell>
                        <TableCell className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewInvoice(i);
                                setViewOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdjustInvoice(i);
                                setAdjustOpen(true);
                              }}
                            >
                              <PoundSterling className="h-3 w-3" /> Adjust
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isOpen &&
                        (invPayments.length === 0 ? (
                          <TableRow className="bg-muted/30">
                            <TableCell />
                            <TableCell colSpan={6} className="py-2 text-xs text-muted-foreground">
                              No payments recorded for this invoice yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          invPayments.map((p) => (
                            <TableRow key={p.id} className="bg-muted/30">
                              <TableCell className="py-1.5" />
                              <TableCell colSpan={2} className="text-xs py-1.5 text-muted-foreground">
                                {p.method} — <span className="font-mono">{p.id}</span>
                              </TableCell>
                              <TableCell className="py-1.5">
                                <StatusBadge status="Paid" />
                              </TableCell>
                              <TableCell className="text-xs py-1.5 text-right font-mono text-muted-foreground">
                                {formatCurrency(p.amount)}
                              </TableCell>
                              <TableCell className="text-xs py-1.5 text-muted-foreground">
                                {formatDate(p.paidAt)}
                              </TableCell>
                              <TableCell className="py-1.5" />
                            </TableRow>
                          ))
                        ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            {allDiscounts.length > 0 && (
              <div className="border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-success" /> Discounts & Promotions
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead className="text-xs">Discount</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Value</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Period</TableHead>
                      <TableHead className="text-xs">Applies To</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {allDiscounts.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-xs py-2">{d.code}</TableCell>
                        <TableCell className="text-xs py-2">{d.type}</TableCell>
                        <TableCell className="font-mono text-xs py-2">
                          {d.type === "Percentage" ? `${d.value}%` : formatCurrency(d.value)}
                        </TableCell>
                        <TableCell className="py-2">
                          <StatusBadge status={d.status === "Expired" ? "Ended" : d.status} />
                        </TableCell>
                        <TableCell className="text-xs py-2">→ {formatDate(d.expiresAt)}</TableCell>
                        <TableCell className="text-xs py-2">{d.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-2">
            {overdueInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No overdue invoices</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 text-center">
                    <p className="text-[10px] text-muted-foreground">30 Days</p>
                    <p className="text-sm font-bold text-warning">{formatCurrency(bucket30)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-destructive/10 text-center">
                    <p className="text-[10px] text-muted-foreground">60 Days</p>
                    <p className="text-sm font-bold text-destructive">{formatCurrency(bucket60)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-destructive/20 text-center">
                    <p className="text-[10px] text-muted-foreground">90+ Days</p>
                    <p className="text-sm font-bold text-destructive">{formatCurrency(bucket90)}</p>
                  </div>
                </div>
                <DataTable
                  columns={collectionsColumns}
                  data={overdueInvoices}
                  getRowKey={(i) => i.id}
                  emptyMessage="No overdue invoices"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="adjustments" className="mt-2">
            {custAdjustments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No adjustments</p>
            ) : (
              <DataTable
                columns={adjustmentColumns}
                data={custAdjustments}
                getRowKey={(a) => a.id}
                emptyMessage="No adjustments"
              />
            )}
          </TabsContent>
        </Tabs>
      </CollapsiblePanel>

      <InvoiceViewDialog invoice={viewInvoice} open={viewOpen} onOpenChange={setViewOpen} />
      <BillingAdjustDialog invoice={adjustInvoice} open={adjustOpen} onOpenChange={setAdjustOpen} />
    </>
  );
}
