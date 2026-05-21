import * as React from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  SearchX,
  User as UserIcon,
  Ticket as TicketIcon,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import { NewCustomerWizard } from "@/components/NewCustomerWizard";

import { CustomerMergeDialog } from "@/components/customer-search/CustomerMergeDialog";
import { QuickActionsGrid } from "@/components/customer-search/QuickActionsGrid";
import { RecentCustomersList } from "@/components/customer-search/RecentCustomersList";
import {
  CustomerFilterBar,
  emptyFilters,
  type CustomerFilters,
} from "@/components/customer-search/CustomerFilterBar";
import { BulkActionsBar } from "@/components/customer-search/BulkActionsBar";
import { CustomerCard } from "@/components/customer-search/CustomerCard";
import { TicketResultCard } from "@/components/customer-search/TicketResultCard";
import { OrderResultCard } from "@/components/customer-search/OrderResultCard";

import { customers, tickets, orders, type Customer } from "@/data/mock";
import { useCustomerTags } from "@/lib/tags";
import { getRecentCustomerIds } from "@/lib/recent";
import { toast } from "@/components/ui/toast/toaster";

type SearchTab = "customers" | "tickets" | "orders";

export default function CustomerSearch() {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<SearchTab>("customers");
  const [filters, setFilters] = React.useState<CustomerFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [mergeOpen, setMergeOpen] = React.useState(false);
  const newCustomerBtnRef = React.useRef<HTMLButtonElement>(null);

  const { tags, getTagsForCustomer, addTag, unassignTag, bulkAssignTag } = useCustomerTags();

  // Recent customer IDs from localStorage, with a sensible fallback so the
  // section is populated on first run.
  const [recentIds, setRecentIds] = React.useState<string[]>(() => getRecentCustomerIds());
  React.useEffect(() => {
    const onUpdate = () => setRecentIds(getRecentCustomerIds());
    window.addEventListener("pulse-recent-customers-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("pulse-recent-customers-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);
  const stored = recentIds
    .map((id) => customers.find((c) => c.id === id))
    .filter((c): c is Customer => Boolean(c));
  const recentCustomers = (stored.length > 0 ? stored : customers).slice(0, 4);

  const q = query.trim().toLowerCase();
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const activeFilterCount = Object.values(filters).filter((v) => v).length;
  const shouldShowResults = q.length > 0 || hasActiveFilters;

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      if (q) {
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.accountNumber.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
          c.postcode.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.status && c.status !== filters.status) return false;
      if (filters.type && c.type !== filters.type) return false;
      if (filters.segment && c.segment !== filters.segment) return false;
      if (filters.contractStatus && c.contractStatus !== filters.contractStatus) return false;
      if (filters.tagId) {
        const tagsFor = getTagsForCustomer(c.id);
        if (!tagsFor.some((t) => t.id === filters.tagId)) return false;
      }
      return true;
    });
  }, [q, filters, getTagsForCustomer]);

  // Duplicate detection — same email or phone across different accounts
  const duplicateIds = React.useMemo(() => {
    const emailMap = new Map<string, Customer[]>();
    const phoneMap = new Map<string, Customer[]>();
    for (const c of filteredCustomers) {
      const email = c.email.toLowerCase();
      if (!emailMap.has(email)) emailMap.set(email, []);
      emailMap.get(email)!.push(c);
      const phone = c.phone.replace(/\s/g, "");
      if (!phoneMap.has(phone)) phoneMap.set(phone, []);
      phoneMap.get(phone)!.push(c);
    }
    const dupes = new Set<string>();
    for (const group of emailMap.values()) if (group.length > 1) group.forEach((c) => dupes.add(c.id));
    for (const group of phoneMap.values()) if (group.length > 1) group.forEach((c) => dupes.add(c.id));
    return dupes;
  }, [filteredCustomers]);

  const filteredTickets = q
    ? tickets.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      )
    : [];

  const filteredOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((item) => item.toLowerCase().includes(q)) ||
          o.status.toLowerCase().includes(q)
      )
    : [];

  const counts = {
    customers: filteredCustomers.length,
    tickets: filteredTickets.length,
    orders: filteredOrders.length,
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredCustomers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const handleExport = () => {
    const rows = customers.filter((c) => selected.has(c.id));
    const csv = [
      "Name,Account,Type,Status,Email,Phone",
      ...rows.map(
        (c) =>
          `"${c.name}","${c.accountNumber}","${c.type}","${c.status}","${c.email}","${c.phone}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${rows.length} customers exported to CSV.`,
      variant: "success",
    });
  };

  const handleBulkTag = (tagId: string) => {
    bulkAssignTag(Array.from(selected), tagId);
    const label = tags.find((t) => t.id === tagId)?.label ?? "tag";
    toast({ title: "Tag applied", description: `${label} added to ${selected.size} customers.` });
  };

  const handleMerge = () => {
    if (selected.size < 2) return;
    setMergeOpen(true);
  };

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div className="max-w-4xl mx-auto page-stack">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="text-sm text-muted-foreground">Search customers, tickets, or orders</p>
        </div>
        <Button ref={newCustomerBtnRef} size="sm" onClick={() => setWizardOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Customer
        </Button>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers, tickets, orders…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
            autoFocus
          />
        </div>
        <Button
          variant={filtersOpen ? "default" : "outline"}
          className="h-11"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1 justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <CustomerFilterBar
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        tags={tags}
        onAddTag={(t) => {
          addTag(t);
          toast({ title: "Tag Created", description: `"${t.label}" is now available.` });
        }}
      />

      <BulkActionsBar
        selectedCount={selected.size}
        onClearSelection={() => setSelected(new Set())}
        onExport={handleExport}
        onBulkTag={handleBulkTag}
        onMerge={handleMerge}
        availableTags={tags}
      />

      {/* Duplicate detection banner */}
      {duplicateIds.size > 0 && tab === "customers" && shouldShowResults && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-warning/10 border border-warning/30 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
          <span className="text-warning font-medium">
            {duplicateIds.size} potential duplicate{duplicateIds.size === 1 ? "" : "s"} detected
          </span>
          <span className="text-muted-foreground">
            — customers sharing email or phone number are highlighted
          </span>
        </div>
      )}

      {/* Default state: quick actions + recently viewed */}
      {!shouldShowResults && (
        <div className="section-stack">
          <QuickActionsGrid />
          <RecentCustomersList customers={recentCustomers} />
        </div>
      )}

      {/* Results state: tabs + cards */}
      {shouldShowResults && (
        <>
          <Tabs value={tab} onValueChange={(v) => setTab(v as SearchTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="customers" className="flex-1 gap-1.5">
                <UserIcon className="h-3.5 w-3.5" /> Customers ({counts.customers})
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex-1 gap-1.5">
                <TicketIcon className="h-3.5 w-3.5" /> Tickets ({counts.tickets})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex-1 gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" /> Orders ({counts.orders})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "customers" && filteredCustomers.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={selected.size === filteredCustomers.length && filteredCustomers.length > 0}
                onCheckedChange={toggleSelectAll}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">
                Select all ({filteredCustomers.length})
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {tab === "customers" &&
              filteredCustomers.map((c) => (
                <CustomerCard
                  key={c.id}
                  customer={c}
                  selected={selected.has(c.id)}
                  isDuplicate={duplicateIds.has(c.id)}
                  tags={getTagsForCustomer(c.id)}
                  onToggleSelect={() => toggleSelect(c.id)}
                  onRemoveTag={(tagId) => unassignTag(c.id, tagId)}
                />
              ))}

            {tab === "tickets" &&
              filteredTickets.map((t) => <TicketResultCard key={t.id} ticket={t} />)}

            {tab === "orders" &&
              filteredOrders.map((o) => <OrderResultCard key={o.id} order={o} />)}
          </div>

          {counts[tab] === 0 && (
            <EmptyState
              icon={SearchX}
              title={`No ${tab} found`}
              description={`No ${tab} matched your search${hasActiveFilters ? " and filters" : ""}. Try different criteria.`}
              actionLabel="Clear All"
              onAction={() => {
                setQuery("");
                clearFilters();
              }}
            />
          )}
        </>
      )}

      <NewCustomerWizard open={wizardOpen} onOpenChange={setWizardOpen} anchorRef={newCustomerBtnRef} />
      <CustomerMergeDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        duplicates={customers.filter((c) => selected.has(c.id))}
      />
    </div>
  );
}
