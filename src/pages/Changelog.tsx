import * as React from "react";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input/input";
import { Card, CardContent } from "@/components/ui/card/card";
import { ScrollText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button/button";

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  category: string;
  affected_areas: string[];
  created_at: string;
}

const CATEGORIES = ["All", "Feature", "Fix", "Refactor", "Data"];

const categoryColors: Record<string, string> = {
  Feature: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Fix: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  Refactor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Data: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

const ENTRIES: ChangelogEntry[] = [
  {
    id: "c1",
    version: "v2.4.0",
    title: "Customer Satisfaction analytics overhaul",
    description:
      "Rebuilt the Surveys page with CSAT/NPS trends, per-channel breakdowns, agent leaderboards and a feedback stream with action-needed flags.",
    category: "Feature",
    affected_areas: ["Surveys", "Dashboard", "Reporting"],
    created_at: "2026-02-12T10:30:00Z",
  },
  {
    id: "c2",
    version: "v2.3.5",
    title: "Baseline snapshots for demo data",
    description:
      "Demo Data now supports saving a customised baseline so future restores use your data instead of factory defaults. Added per-group restore selection.",
    category: "Feature",
    affected_areas: ["Demo Data", "Settings"],
    created_at: "2026-02-08T14:05:00Z",
  },
  {
    id: "c3",
    version: "v2.3.4",
    title: "Fixed messenger unread badge race condition",
    description:
      "Resolved a race where the unread count could remain stale after rapidly switching conversations.",
    category: "Fix",
    affected_areas: ["Messenger"],
    created_at: "2026-02-03T09:15:00Z",
  },
  {
    id: "c4",
    version: "v2.3.0",
    title: "Data integrity checker",
    description:
      "Added an on-demand integrity scan that detects orphaned references and empty tables, auto-fixing orphans to keep the dataset consistent.",
    category: "Data",
    affected_areas: ["Demo Data", "Database"],
    created_at: "2026-01-27T16:40:00Z",
  },
  {
    id: "c5",
    version: "v2.2.1",
    title: "Unified theme tokens across light and dark",
    description:
      "Refactored colour tokens so every surface, badge and chart uses a single source of truth, fixing several contrast inconsistencies in dark mode.",
    category: "Refactor",
    affected_areas: ["Theming", "UI Components"],
    created_at: "2026-01-19T11:00:00Z",
  },
  {
    id: "c6",
    version: "v2.2.0",
    title: "Sidebar with collapsible groups",
    description:
      "Reworked the navigation sidebar into collapsible groups and persisted the expanded state per user.",
    category: "Feature",
    affected_areas: ["Navigation", "Layout"],
    created_at: "2026-01-10T08:25:00Z",
  },
  {
    id: "c7",
    version: "v2.1.3",
    title: "Fixed misaligned table headers on small screens",
    description:
      "Table headers no longer drift out of alignment with body cells when horizontal scrolling on narrow viewports.",
    category: "Fix",
    affected_areas: ["Tables", "Responsive"],
    created_at: "2025-12-22T13:50:00Z",
  },
  {
    id: "c8",
    version: "v2.1.0",
    title: "Pipeline kanban board",
    description:
      "Introduced a drag-and-drop sales pipeline board with stage totals and weighted forecast.",
    category: "Feature",
    affected_areas: ["Pipeline", "Sales"],
    created_at: "2025-12-15T10:10:00Z",
  },
  {
    id: "c9",
    version: "v2.0.0",
    title: "Initial customer search prototype",
    description:
      "First end-to-end customer search experience with filters and saved views.",
    category: "Feature",
    affected_areas: ["Customers", "Search"],
    created_at: "2025-12-01T09:00:00Z",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Changelog() {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");

  const entries = React.useMemo(
    () =>
      [...ENTRIES].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    []
  );

  const filtered = entries.filter((e) => {
    if (activeCategory !== "All" && e.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.version.toLowerCase().includes(q) ||
        (e.affected_areas || []).some((a) => a.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Changelog</h1>
          <p className="text-sm text-muted-foreground">
            Application change history — auto-populated with each update
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search changes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries found.</p>
      ) : (
        <div className="relative pl-6 border-l-2 border-border space-y-6">
          {filtered.map((entry) => (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[calc(1.5rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />

              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {entry.version && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {entry.version}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-foreground text-sm">
                        {entry.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] border ${
                          categoryColors[entry.category] || ""
                        }`}
                        variant="outline"
                      >
                        {entry.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.description}
                  </p>
                  {entry.affected_areas && entry.affected_areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.affected_areas.map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="text-[10px] h-5"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
