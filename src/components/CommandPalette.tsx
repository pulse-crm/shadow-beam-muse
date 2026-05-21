import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User as UserIcon,
  Building,
  Ticket as TicketIcon,
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings as SettingsIcon,
  Receipt,
  MessageSquare,
  TrendingUp,
  Calendar as CalendarIcon,
  BookOpen,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog";
import { customers, tickets } from "@/data/mock";
import { cn } from "@/lib/cn";

interface PageEntry {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const pages: PageEntry[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customer Management", path: "/", icon: Search },
  { name: "Tickets", path: "/tickets", icon: TicketIcon },
  { name: "Messages", path: "/messages", icon: MessageSquare },
  { name: "Pipeline", path: "/pipeline", icon: TrendingUp },
  { name: "Calendar", path: "/calendar", icon: CalendarIcon },
  { name: "Billing", path: "/billing", icon: Receipt },
  { name: "Product Catalogue", path: "/products", icon: Package },
  { name: "Knowledge Base", path: "/knowledge-base", icon: BookOpen },
  { name: "Audit Log", path: "/audit", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

interface Item {
  key: string;
  group: "Pages" | "Customers" | "Tickets";
  label: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  searchText: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K + "G then <key>" navigation shortcuts
  React.useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout>;

    const down = (e: KeyboardEvent) => {
      const inField =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // Sequence shortcuts must not fire while typing or with modifiers held.
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "g" || e.key === "G") {
        if (!gPressed) {
          gPressed = true;
          clearTimeout(gTimer);
          gTimer = setTimeout(() => {
            gPressed = false;
          }, 500);
          return;
        }
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimer);
        const goMap: Record<string, string> = {
          d: "/dashboard",
          c: "/",
          t: "/tickets",
          s: "/settings",
        };
        const path = goMap[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          navigate(path);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
      clearTimeout(gTimer);
    };
  }, [navigate]);

  // Reset on close + focus on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // input is rendered after dialog mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const go = React.useCallback(
    (path: string) => {
      navigate(path);
      setOpen(false);
    },
    [navigate]
  );

  const items: Item[] = React.useMemo(() => {
    const all: Item[] = [
      ...pages.map((p) => ({
        key: `page:${p.path}`,
        group: "Pages" as const,
        label: p.name,
        icon: p.icon,
        onSelect: () => go(p.path),
        searchText: p.name.toLowerCase(),
      })),
      ...customers.map((c) => ({
        key: `customer:${c.id}`,
        group: "Customers" as const,
        label: (
          <>
            <span>{c.name}</span>
            <span className="ml-2 text-xs text-muted-foreground font-mono">{c.accountNumber}</span>
          </>
        ),
        icon: c.type === "B2B" ? Building : UserIcon,
        onSelect: () => go(`/customer/${c.id}`),
        searchText: `${c.name} ${c.accountNumber} ${c.email}`.toLowerCase(),
      })),
      ...tickets.map((t) => ({
        key: `ticket:${t.id}`,
        group: "Tickets" as const,
        label: (
          <>
            <span className="font-mono text-xs mr-2">{t.id}</span>
            <span>{t.subject}</span>
          </>
        ),
        icon: TicketIcon,
        onSelect: () => go(`/customer/${t.customerId}`),
        searchText: `${t.id} ${t.subject} ${t.category} ${t.assignee}`.toLowerCase(),
      })),
    ];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => i.searchText.includes(q));
  }, [query, go]);

  // Group items in display order
  const grouped = React.useMemo(() => {
    const order: Item["group"][] = ["Pages", "Customers", "Tickets"];
    return order
      .map((g) => ({ group: g, items: items.filter((i) => i.group === g) }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  // Keep activeIndex in range when items change
  React.useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [items.length, activeIndex]);

  // Scroll active item into view
  React.useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (items.length === 0 ? 0 : (i + 1) % items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (items.length === 0 ? 0 : (i - 1 + items.length) % items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[activeIndex]?.onSelect();
    }
  };

  // Render: compute global indices per item so keyboard nav lines up with grouped layout.
  let runningIndex = 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl" showClose={false}>
        <div className="flex items-center border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search customers, tickets, pages…"
            className="flex h-11 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto scrollbar-thin p-1">
          {items.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
          )}

          {grouped.map(({ group, items: groupItems }) => (
            <div key={group} className="overflow-hidden p-1 text-foreground">
              <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">{group}</div>
              {groupItems.map((item) => {
                const index = runningIndex++;
                const Icon = item.icon;
                const active = index === activeIndex;
                return (
                  <button
                    key={item.key}
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => item.onSelect()}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-left",
                      active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex items-center min-w-0 truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
