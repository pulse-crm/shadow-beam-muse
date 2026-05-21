import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquarePlus, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Textarea } from "@/components/ui/textarea/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Input } from "@/components/ui/input/input";
import { Popover } from "@/components/ui/popover/popover";
import { StarRating } from "@/components/ui/star-rating/star-rating";
import { CountBadge } from "@/components/ui/count-badge/count-badge";
import { Field } from "@/components/ui/field/field";
import { toast } from "@/components/ui/toast/toaster";

type FeedbackCategory = "Bug" | "Suggestion" | "Question" | "General";
const CATEGORIES: FeedbackCategory[] = ["Bug", "Suggestion", "Question", "General"];

const PAGE_NAMES: Record<string, string> = {
  "/": "Customer Management",
  "/dashboard": "Dashboard",
  "/tickets": "Tickets",
  "/messages": "Messages",
  "/pipeline": "Pipeline",
  "/calendar": "Calendar",
  "/products": "Product Catalogue",
  "/billing": "Billing",
  "/knowledge-base": "Knowledge Base",
  "/email-templates": "Email Templates",
  "/surveys": "Surveys & CSAT",
  "/demo-data": "Demo Data",
  "/changelog": "Changelog",
  "/docs": "Documentation",
  "/architecture": "Architecture",
  "/platform": "Platform",
  "/platform/iam": "Platform IAM",
  "/platform/audit": "Platform Audit",
  "/platform/observability": "Platform Observability",
  "/feedback-log": "Feedback Log",
  "/user-management": "User Management",
  "/escalation-workflows": "Escalation Workflows",
  "/sla-policies": "SLA Policies",
  "/announcements": "Announcements",
  "/approvals": "Approvals",
  "/performance": "Performance",
  "/audit": "Audit Log",
  "/settings": "My Profile",
};

const FEEDBACK_STORE_KEY = "pulse-feedback-entries";

interface StoredEntry {
  id: string;
  page: string;
  pageName: string;
  category: FeedbackCategory;
  rating: number | null;
  comment: string;
  userName?: string;
  createdAt: string;
  status: "pending" | "resolved";
}

const SEED_ENTRIES: StoredEntry[] = [
  { id: "F-seed-1", page: "/dashboard", pageName: "Dashboard", category: "Suggestion", rating: 4, comment: "Add a 90-day trend toggle to the churn breakdown.", userName: "Sarah Chen", createdAt: "2026-05-17T09:14:00Z", status: "pending" },
  { id: "F-seed-2", page: "/tickets", pageName: "Tickets", category: "Bug", rating: 2, comment: "Bulk-assign dialog closes before the toast confirms.", userName: "Marcus Lee", createdAt: "2026-05-17T11:02:00Z", status: "pending" },
  { id: "F-seed-3", page: "/billing", pageName: "Billing", category: "Question", rating: null, comment: "How are pro-rata refunds calculated for mid-cycle downgrades?", userName: "Priya Patel", createdAt: "2026-05-16T15:48:00Z", status: "pending" },
];

function loadEntries(): StoredEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORE_KEY);
    if (raw === null) return SEED_ENTRIES;
    return JSON.parse(raw);
  } catch {
    return SEED_ENTRIES;
  }
}

function saveEntries(entries: StoredEntry[]) {
  try {
    localStorage.setItem(FEEDBACK_STORE_KEY, JSON.stringify(entries));
  } catch {
    /* storage may be full or unavailable */
  }
}

interface FeedbackButtonProps {
  className?: string;
  variant?: "ghost" | "outline";
  side?: "bottom" | "top";
  align?: "start" | "center" | "end";
}

export function FeedbackButton({
  className,
  variant = "ghost",
  side = "bottom",
  align = "start",
}: FeedbackButtonProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState<FeedbackCategory>("General");
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [entries, setEntries] = React.useState<StoredEntry[]>(() => loadEntries());

  React.useEffect(() => {
    if (open) setEntries(loadEntries());
  }, [open]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FEEDBACK_STORE_KEY) setEntries(loadEntries());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const pageName = PAGE_NAMES[pathname] || pathname;
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  const handleSubmit = () => {
    if (!comment.trim()) return;
    const newEntry: StoredEntry = {
      id: `F-${Date.now()}`,
      page: pathname,
      pageName,
      category,
      rating: rating || null,
      comment: comment.trim(),
      userName: userName.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    toast({
      title: "Feedback saved",
      description: `Captured for "${pageName}"`,
      variant: "success",
    });
    setComment("");
    setRating(0);
    setCategory("General");
    setOpen(false);
  };

  const trigger = (
    <Button
      size="icon-sm"
      variant={variant}
      className={`relative ${className ?? ""}`}
      aria-label="Send feedback"
      aria-expanded={open}
    >
      <MessageSquarePlus className="h-4 w-4" />
      <CountBadge count={pendingCount} tone="destructive" size="sm" placement="topRight" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} trigger={trigger} side={side} align={align}>
      <div className="p-4 relative">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-2 top-2"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-3">
          <div className="pr-6">
            <h4 className="font-semibold text-sm text-foreground">Prototype Feedback</h4>
            <p className="text-xs text-muted-foreground">Page: {pageName}</p>
          </div>

          <Field>
            <Input
              placeholder="Your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              size="sm"
            />
          </Field>

          <Field>
            <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <StarRating label="Rating:" value={rating} onChange={setRating} />

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() =>
              toast({ title: "Screenshot capture is unavailable in this prototype" })
            }
          >
            <Crosshair className="h-3.5 w-3.5" />
            Capture Area
          </Button>

          <Textarea
            placeholder="What's on your mind?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-sm min-h-[80px]"
          />

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="link"
              size="sm"
              className="px-0 text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/feedback-log");
              }}
            >
              View all ({entries.length})
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!comment.trim()}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Popover>
  );
}
