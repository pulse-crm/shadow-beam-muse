import * as React from "react";
import { Wifi, ChevronDown, ChevronRight, Tag, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table/table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Popover } from "@/components/ui/popover/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker/calendar-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Subscription } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";

interface ServiceDiscount {
  id: string;
  label: string;
  /** "global" → spans all services; "local" → scoped to this service. */
  scope: "global" | "local";
  /** "Percentage" or fixed-currency reduction. */
  kind: "Percentage" | "Fixed";
  amount: number;
  period: string;
  status: "Active" | "Expired";
}

/** Each subscription in the mock data lacks discount rows, so we synthesize a
 *  consistent set per service id for the expanded view. */
function discountsFor(sub: Subscription): ServiceDiscount[] {
  const tail = sub.id.slice(-1);
  const offset = parseInt(tail, 10) || 0;
  const list: ServiceDiscount[] = [];
  if (offset % 2 === 0) {
    list.push({
      id: `${sub.id}-DG1`,
      label: "Loyalty Discount",
      scope: "global",
      kind: "Percentage",
      amount: 10,
      period: "Recurring · 12 months",
      status: "Active",
    });
  }
  if (offset % 3 === 0) {
    list.push({
      id: `${sub.id}-DL1`,
      label: "Speed Tier Promo",
      scope: "local",
      kind: "Fixed",
      amount: 5,
      period: `Linked to ${sub.product}`,
      status: "Active",
    });
  }
  if (sub.status !== "Active") {
    list.push({
      id: `${sub.id}-DE1`,
      label: "Welcome Bonus",
      scope: "local",
      kind: "Fixed",
      amount: 20,
      period: "Ended · 2025-12-31",
      status: "Expired",
    });
  }
  return list;
}

function discountLabel(d: ServiceDiscount): string {
  return d.kind === "Percentage" ? `−${d.amount}%` : `−${formatCurrency(d.amount)}`;
}

/** Pulse Subscription has no explicit service "type"; derive one from the
 *  product name so the Type column mirrors project-files. */
function serviceType(product: string): string {
  const p = product.toLowerCase();
  if (p.includes("voice") || p.includes("sip") || p.includes("phone")) return "Voice";
  if (p.includes("tv")) return "TV";
  if (p.includes("ip") || p.includes("static")) return "Add-on";
  if (p.includes("leased") || p.includes("ethernet")) return "Leased Line";
  return "Broadband";
}

/** Pulse has no commitment term on subscriptions; approximate from the
 *  start → renewal span so the Commitment column shows a sensible value. */
function commitmentTerm(s: Subscription): string {
  const start = new Date(s.startDate).getTime();
  const renew = new Date(s.renewalDate).getTime();
  if (isNaN(start) || isNaN(renew) || renew <= start) return "—";
  const months = Math.round((renew - start) / (1000 * 60 * 60 * 24 * 30));
  return `${months} months`;
}

function ymdOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface LocalDiscount {
  name: string;
  amount: number;
  type: "amount" | "percentage";
  linkedToService: boolean;
  endDate: Date | undefined;
  status?: "Active" | "Ended";
}

export function SubscriptionsPanel({ data }: { data: Subscription[] }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [localDiscounts, setLocalDiscounts] = React.useState<Record<string, LocalDiscount[]>>({});
  const [endedSynthetic, setEndedSynthetic] = React.useState<Set<string>>(new Set());

  const [addingFor, setAddingFor] = React.useState<string | null>(null);
  const [discountName, setDiscountName] = React.useState("");
  const [discountAmount, setDiscountAmount] = React.useState("");
  const [discountPercent, setDiscountPercent] = React.useState("");
  const [discountLinked, setDiscountLinked] = React.useState(false);
  const [discountEndDate, setDiscountEndDate] = React.useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);

  const [deleteConfirm, setDeleteConfirm] = React.useState<
    | { serviceId: string; key: string; name: string; source: "local" | "synthetic"; index: number }
    | null
  >(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const resetForm = () => {
    setAddingFor(null);
    setDiscountName("");
    setDiscountAmount("");
    setDiscountPercent("");
    setDiscountLinked(false);
    setDiscountEndDate(undefined);
    setDatePopoverOpen(false);
  };

  const handleSave = (s: Subscription) => {
    const hasAmount = discountAmount && parseFloat(discountAmount) > 0;
    const hasPercent = discountPercent && parseFloat(discountPercent) > 0;
    if (!discountName || (!hasAmount && !hasPercent)) {
      toast({
        title: "Validation",
        description: "Please fill in discount name and either an amount or percentage.",
        variant: "destructive",
      });
      return;
    }
    const discountType: "amount" | "percentage" = hasAmount ? "amount" : "percentage";
    const parsedVal = hasAmount ? parseFloat(discountAmount) : parseFloat(discountPercent);
    if (discountType === "amount" && parsedVal > s.monthly) {
      toast({
        title: "Validation",
        description: `Discount cannot exceed the service charge of ${formatCurrency(s.monthly)}.`,
        variant: "destructive",
      });
      return;
    }
    if (discountType === "percentage" && parsedVal > 100) {
      toast({
        title: "Validation",
        description: "Percentage discount cannot exceed 100%.",
        variant: "destructive",
      });
      return;
    }
    if (!discountLinked && !discountEndDate) {
      toast({
        title: "Validation",
        description: "Please select an end date or link to service.",
        variant: "destructive",
      });
      return;
    }
    setLocalDiscounts((prev) => ({
      ...prev,
      [s.id]: [
        ...(prev[s.id] || []),
        {
          name: discountName,
          amount: parsedVal,
          type: discountType,
          linkedToService: discountLinked,
          endDate: discountEndDate,
          status: "Active",
        },
      ],
    }));
    toast({
      title: "Discount Added",
      description: `${discountName} (${
        discountType === "percentage" ? `${parsedVal}%` : formatCurrency(parsedVal)
      }) applied to ${s.product}.`,
    });
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.source === "local") {
      setLocalDiscounts((prev) => ({
        ...prev,
        [deleteConfirm.serviceId]: (prev[deleteConfirm.serviceId] || []).map((ld, i) =>
          i === deleteConfirm.index ? { ...ld, status: "Ended" } : ld
        ),
      }));
    } else {
      setEndedSynthetic((prev) => new Set(prev).add(deleteConfirm.key));
    }
    toast({
      title: "Discount ended",
      description: `"${deleteConfirm.name}" status changed to Ended.`,
    });
    setDeleteConfirm(null);
  };

  return (
    <CollapsiblePanel title="Active Services" icon={Wifi} count={data.length}>
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-xs w-8" />
            <TableHead className="text-xs">Service</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Commitment</TableHead>
            <TableHead className="text-xs">Renewal</TableHead>
            <TableHead className="text-xs text-right">Monthly</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <tr>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4 text-xs">
                No services
              </TableCell>
            </tr>
          )}
          {data.map((s) => {
            const isOpen = expanded.has(s.id);
            const synthetic = discountsFor(s);
            const svcLocal = localDiscounts[s.id] || [];
            return (
              <React.Fragment key={s.id}>
                <TableRow
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => toggle(s.id)}
                >
                  <TableCell className="py-2 w-8">
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs py-2 font-medium">{s.product}</TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={serviceType(s.product)} />
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-xs py-2">{commitmentTerm(s)}</TableCell>
                  <TableCell className="text-xs py-2">{formatDate(s.renewalDate)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">
                    £{s.monthly.toFixed(2)}
                  </TableCell>
                </TableRow>

                {isOpen && (
                  <>
                    {synthetic.map((d, di) => {
                      const ended = d.status === "Expired" || endedSynthetic.has(d.id);
                      return (
                        <TableRow key={d.id} className="bg-muted/30">
                          <TableCell className="py-1.5" />
                          <TableCell colSpan={3} className="text-xs py-1.5 text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Tag
                                className={cn(
                                  "h-3 w-3",
                                  d.scope === "global" ? "text-primary" : "text-success"
                                )}
                              />
                              {d.label} — {discountLabel(d)} off
                            </span>
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-muted-foreground">
                            {ended ? <StatusBadge status="Ended" /> : d.period}
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-muted-foreground">
                            <StatusBadge status={ended ? "Ended" : d.status} />
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-right font-mono text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              {discountLabel(d)}
                              {!ended && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({
                                      serviceId: s.id,
                                      key: d.id,
                                      name: d.label,
                                      source: "synthetic",
                                      index: di,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {svcLocal.map((ld, idx) => {
                      const ended = ld.status === "Ended";
                      return (
                        <TableRow key={`local-${s.id}-${idx}`} className="bg-muted/30">
                          <TableCell className="py-1.5" />
                          <TableCell colSpan={3} className="text-xs py-1.5 text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Tag className="h-3 w-3 text-success" />
                              {ld.name} —{" "}
                              {ld.type === "percentage"
                                ? `${ld.amount}%`
                                : `${formatCurrency(ld.amount)}`}{" "}
                              off
                            </span>
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-muted-foreground">
                            {ended ? (
                              <StatusBadge status="Ended" />
                            ) : ld.linkedToService ? (
                              "Linked to service"
                            ) : ld.endDate ? (
                              `Until ${dateLabel(ld.endDate)}`
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-muted-foreground">
                            {ended ? <StatusBadge status="Ended" /> : null}
                          </TableCell>
                          <TableCell className="text-xs py-1.5 text-right font-mono text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              {ld.type === "percentage"
                                ? `-${ld.amount}%`
                                : `-${formatCurrency(ld.amount)}`}
                              {!ended && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({
                                      serviceId: s.id,
                                      key: `local-${idx}`,
                                      name: ld.name,
                                      source: "local",
                                      index: idx,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {addingFor === s.id ? (
                      <TableRow className="bg-accent/20">
                        <TableCell colSpan={7} className="py-3">
                          <div className="space-y-3 px-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Plus className="h-3.5 w-3.5 text-primary" /> Add Discount for{" "}
                              {s.product}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Discount Name
                                </label>
                                <Input
                                  placeholder="e.g. Loyalty discount"
                                  value={discountName}
                                  onChange={(e) => setDiscountName(e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">
                                    Discount Amount (£)
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={discountAmount}
                                    onChange={(e) => {
                                      setDiscountAmount(e.target.value);
                                      setDiscountPercent("");
                                    }}
                                    className="h-8 text-xs"
                                    min="0"
                                    max={String(s.monthly)}
                                    step="0.01"
                                  />
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Max: {formatCurrency(s.monthly)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">
                                    Discount %
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={discountPercent}
                                    onChange={(e) => {
                                      setDiscountPercent(e.target.value);
                                      setDiscountAmount("");
                                    }}
                                    className="h-8 text-xs"
                                    min="0"
                                    max="100"
                                    step="1"
                                  />
                                  <p className="text-[10px] text-muted-foreground mt-1">Max: 100%</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                  Duration
                                </label>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={discountLinked}
                                      onCheckedChange={(v) => {
                                        setDiscountLinked(!!v);
                                        if (v) setDiscountEndDate(undefined);
                                      }}
                                    />
                                    <label
                                      className="text-xs text-muted-foreground cursor-pointer"
                                      onClick={() => {
                                        const v = !discountLinked;
                                        setDiscountLinked(v);
                                        if (v) setDiscountEndDate(undefined);
                                      }}
                                    >
                                      Linked to service
                                    </label>
                                  </div>
                                  {!discountLinked && (
                                    <Popover
                                      open={datePopoverOpen}
                                      onOpenChange={setDatePopoverOpen}
                                      align="start"
                                      trigger={
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "h-8 w-full justify-start text-left text-xs font-normal",
                                            !discountEndDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                                          {discountEndDate
                                            ? dateLabel(discountEndDate)
                                            : "Pick end date"}
                                        </Button>
                                      }
                                    >
                                      <CalendarPicker
                                        value={discountEndDate ? ymdOf(discountEndDate) : ""}
                                        onChange={(iso) => {
                                          const [y, m, d] = iso.split("-").map(Number);
                                          setDiscountEndDate(new Date(y, m - 1, d));
                                          setDatePopoverOpen(false);
                                        }}
                                      />
                                    </Popover>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave(s);
                                }}
                              >
                                Save Discount
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetForm();
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow className="bg-accent/10">
                        <TableCell colSpan={7} className="py-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingFor(s.id);
                            }}
                          >
                            <Plus className="h-3 w-3" /> Add Discount
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete / End Discount Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End Discount</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to end the discount "{deleteConfirm?.name}"? The status will be
            changed to Ended.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              End Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CollapsiblePanel>
  );
}
