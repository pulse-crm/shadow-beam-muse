import { useState, useMemo, useCallback } from "react";
import {
  Download,
  Trash2,
  MessageSquareText,
  Image as ImageIcon,
  ClipboardEdit,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { toast } from "@/components/ui/toast/toaster";

type FeedbackCategory = "Bug" | "Suggestion" | "Question" | "General";
type FeedbackStatus = "pending" | "implemented" | "rejected";

interface FeedbackEntry {
  id: string;
  page: string;
  pageName: string;
  category: FeedbackCategory;
  rating: number | null;
  comment: string;
  timestamp: string;
  role: string;
  userName?: string;
  screenshot?: string;
  status: FeedbackStatus;
}

const categoryColors: Record<FeedbackCategory, string> = {
  Bug: "bg-destructive/10 text-destructive border-destructive/20",
  Suggestion: "bg-primary/10 text-primary border-primary/20",
  Question: "bg-accent text-accent-foreground border-accent",
  General: "bg-muted text-muted-foreground border-muted",
};

const statusLabels: Record<FeedbackStatus, string> = {
  pending: "Pending",
  implemented: "Implemented",
  rejected: "Rejected",
};

const statusColors: Record<FeedbackStatus, string> = {
  pending: "bg-muted text-muted-foreground border-muted",
  implemented: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const sampleScreenshot = (label: string, accent: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600" font-family="system-ui,sans-serif">` +
      `<rect width="960" height="600" fill="#f1f5f9"/>` +
      `<rect width="960" height="56" fill="#0f172a"/>` +
      `<circle cx="28" cy="28" r="8" fill="${accent}"/>` +
      `<text x="52" y="34" fill="#e2e8f0" font-size="18" font-weight="600">PulseGS — ${label}</text>` +
      `<rect x="24" y="84" width="280" height="160" rx="10" fill="#ffffff" stroke="#e2e8f0"/>` +
      `<rect x="328" y="84" width="280" height="160" rx="10" fill="#ffffff" stroke="#e2e8f0"/>` +
      `<rect x="632" y="84" width="304" height="160" rx="10" fill="#ffffff" stroke="#e2e8f0"/>` +
      `<rect x="24" y="268" width="912" height="308" rx="10" fill="#ffffff" stroke="#e2e8f0"/>` +
      `<rect x="48" y="300" width="864" height="40" rx="6" fill="${accent}" opacity="0.15"/>` +
      `<rect x="48" y="356" width="864" height="28" rx="6" fill="#e2e8f0"/>` +
      `<rect x="48" y="400" width="864" height="28" rx="6" fill="#e2e8f0"/>` +
      `<rect x="48" y="444" width="864" height="28" rx="6" fill="#e2e8f0"/>` +
      `<rect x="640" y="492" width="120" height="36" rx="8" fill="${accent}"/>` +
      `<text x="700" y="515" fill="#ffffff" font-size="14" font-weight="600" text-anchor="middle">Action</text>` +
    `</svg>`
  );

const seedEntries: FeedbackEntry[] = [
  { id: "1", page: "/dashboard", pageName: "Dashboard", category: "Suggestion", rating: 4, comment: "Love the churn breakdown — could we add a 90-day trend toggle?", timestamp: "2026-05-17T09:14:00Z", role: "Ops", userName: "Sarah Chen", status: "pending", screenshot: sampleScreenshot("Dashboard", "#2563eb") },
  { id: "2", page: "/tickets", pageName: "Tickets", category: "Bug", rating: 2, comment: "Bulk-assign dialog closes before the toast confirms.", timestamp: "2026-05-17T11:02:00Z", role: "Support", userName: "Marcus Lee", status: "pending", screenshot: sampleScreenshot("Tickets", "#dc2626") },
  { id: "3", page: "/billing", pageName: "Billing", category: "Question", rating: null, comment: "How are pro-rata refunds calculated for mid-cycle downgrades?", timestamp: "2026-05-16T15:48:00Z", role: "Finance", userName: "Priya Patel", status: "pending" },
  { id: "4", page: "/platform/observability", pageName: "Observability", category: "General", rating: 5, comment: "The new latency chart is exactly what we needed.", timestamp: "2026-05-15T08:30:00Z", role: "Admin", userName: "David Park", status: "implemented" },
  { id: "5", page: "/pipeline", pageName: "Pipeline", category: "Bug", rating: 1, comment: "Cards lose their column order after a page refresh.", timestamp: "2026-05-14T13:20:00Z", role: "Sales", userName: "Emma Wilson", status: "rejected" },
];

export default function FeedbackLog() {
  const [entries, setEntries] = useState<FeedbackEntry[]>(seedEntries);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planText, setPlanText] = useState("");
  const [activeEntry, setActiveEntry] = useState<FeedbackEntry | null>(null);

  const pending = useMemo(
    () => [...entries].filter((e) => !e.status || e.status === "pending").reverse(),
    [entries]
  );
  const actioned = useMemo(
    () =>
      [...entries].filter((e) => e.status === "implemented" || e.status === "rejected").reverse(),
    [entries]
  );

  const setEntryStatus = useCallback((id: string, status: FeedbackStatus) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    toast({ title: "Status updated", description: `Feedback marked as ${statusLabels[status]}.` });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    toast({ title: "Feedback cleared", description: "All entries removed.", variant: "destructive" });
  }, []);

  const generateChangePlan = useCallback(
    (ids: string[]) => {
      const selected = entries.filter((e) => ids.includes(e.id));
      if (selected.length === 0) return "No entries selected.";
      const items = selected.map((item) => {
        const page = item.pageName || item.page;
        const type = item.category === "Bug" ? "Fix" : "Change";
        let text = `${type} required on the "${page}" page: ${item.comment}`;
        if (item.screenshot) {
          text += `\n\nA screenshot has been captured for reference.`;
        }
        return text;
      });
      return items.join("\n\n---\n\n");
    },
    [entries]
  );

  const handleGenerateForEntry = (entry: FeedbackEntry) => {
    const plan = generateChangePlan([entry.id]);
    setPlanText(plan);
    setActiveEntry(entry);
    setPlanOpen(true);
  };

  const handleCopyPlan = useCallback(() => {
    const handler = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", planText);
      if (activeEntry?.screenshot) {
        const html = `<p>${planText.replace(/\n/g, "<br>")}</p><img src="${activeEntry.screenshot}" />`;
        e.clipboardData?.setData("text/html", html);
      }
      document.removeEventListener("copy", handler, true);
      toast({
        title: "Copied",
        description: activeEntry?.screenshot
          ? "Change request + screenshot copied to clipboard"
          : "Change request copied to clipboard",
        variant: "success",
      });
    };
    document.addEventListener("copy", handler, true);
    document.execCommand("copy");
  }, [planText, activeEntry]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulse-feedback.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${entries.length} entries → JSON.`, variant: "success" });
  };

  const renderTable = (items: FeedbackEntry[], showActions: boolean) => {
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <MessageSquareText className="h-8 w-8" />
            <p className="text-sm">
              {showActions ? "No pending feedback." : "No actioned feedback yet."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Page</TableHead>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead className="w-[90px]">Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="w-[100px]">User</TableHead>
                <TableHead className="w-[100px]">Role</TableHead>
                <TableHead className="w-[60px]">Img</TableHead>
                <TableHead className="w-[150px]">Timestamp</TableHead>
                {!showActions && <TableHead className="w-[100px]">Status</TableHead>}
                <TableHead className="w-[90px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium text-xs">
                    {entry.pageName || entry.page}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColors[entry.category]}>
                      {entry.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {entry.rating ? (
                      "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{entry.comment}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {entry.userName || <span className="italic">—</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{entry.role}</TableCell>
                  <TableCell>
                    {entry.screenshot ? (
                      <button
                        onClick={() => setScreenshotSrc(entry.screenshot!)}
                        className="text-primary hover:text-primary/80"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  {!showActions && (
                    <TableCell>
                      <Badge variant="outline" className={statusColors[entry.status]}>
                        {statusLabels[entry.status]}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {showActions && (
                        <>
                          <button
                            onClick={() => setEntryStatus(entry.id, "implemented")}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Mark as implemented"
                            title="Implemented"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEntryStatus(entry.id, "rejected")}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Reject"
                            title="Rejected"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {!showActions && (
                        <button
                          onClick={() => setEntryStatus(entry.id, "pending")}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Move back to pending"
                          title="Move to pending"
                        >
                          <MessageSquareText className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateForEntry(entry)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Generate change request"
                        title="Generate change request"
                      >
                        <ClipboardEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="page-stack">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Feedback Log</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} entries captured across the prototype
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJson} disabled={!entries.length}>
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAll}
            disabled={!entries.length}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending{" "}
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actioned">
            Actioned{" "}
            {actioned.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {actioned.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {renderTable(pending, true)}
        </TabsContent>
        <TabsContent value="actioned" className="mt-4">
          {renderTable(actioned, false)}
        </TabsContent>
      </Tabs>

      {/* Screenshot preview dialog */}
      <Dialog open={!!screenshotSrc} onOpenChange={(o) => !o && setScreenshotSrc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {screenshotSrc && (
            <img
              src={screenshotSrc}
              alt="Feedback screenshot"
              className="w-full rounded-md border border-border"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Change request dialog */}
      <Dialog
        open={planOpen}
        onOpenChange={(o) => {
          setPlanOpen(o);
          if (!o) setActiveEntry(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Change Request</DialogTitle>
          </DialogHeader>
          <Textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            className="flex-1 min-h-[120px] font-mono text-xs"
          />
          {activeEntry?.screenshot && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                Screenshot (will be copied with text)
              </p>
              <img
                src={activeEntry.screenshot}
                alt="Feedback screenshot"
                className="w-full rounded-md border border-border max-h-[300px] object-contain"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCopyPlan}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
