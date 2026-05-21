import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Badge } from "@/components/ui/badge/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { Popover } from "@/components/ui/popover/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker/calendar-picker";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";
import {
  Plus, Trash2, Pencil, Info, AlertTriangle, AlertCircle,
  ChevronDown, ExternalLink, Megaphone, Clock,
  Bell, Shield, Zap, Server, Wifi, Globe, Lock, Settings,
  Mail, MessageSquare, Star, Heart, Flag, Bookmark,
  Calendar as CalendarIcon,
  type LucideIcon,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  details: string;
  url?: string;
  type: "info" | "warning" | "critical";
  icon?: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Inline mock data (replaces useAnnouncements hook)
const initialAnnouncements: Announcement[] = [
  {
    id: "AN-001",
    title: "Scheduled maintenance — Sunday 03:00",
    details:
      "Brief failover testing across the EU-west region. Expect a sub-30s blip on the API. No action required from agents.",
    url: "https://status.pulse.example/incidents/maint-eu-west",
    type: "info",
    icon: "Server",
    createdBy: "Admin",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "AN-002",
    title: "New escalation policy live",
    details:
      "Critical network tickets now bypass L1 and route straight to the NOC queue. Review the runbook before your next shift.",
    type: "warning",
    icon: "AlertTriangle",
    createdBy: "Nihala Nazar",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: "AN-003",
    title: "Security: rotate API credentials",
    details:
      "All integration API keys must be rotated before the end of the month. Legacy keys will be revoked automatically.",
    url: "https://docs.pulse.example/security/key-rotation",
    type: "critical",
    icon: "Shield",
    createdBy: "Admin",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: "AN-004",
    title: "Legacy SLA policy retiring",
    details:
      "The B2C legacy SLA policy has been disabled. Migrate any custom rules that still reference it.",
    type: "info",
    icon: "Clock",
    createdBy: "Admin",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString(),
  },
];

const iconOptions: { name: string; icon: LucideIcon }[] = [
  { name: "Info", icon: Info },
  { name: "Alert Triangle", icon: AlertTriangle },
  { name: "Alert Circle", icon: AlertCircle },
  { name: "Bell", icon: Bell },
  { name: "Megaphone", icon: Megaphone },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Server", icon: Server },
  { name: "Wifi", icon: Wifi },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "Settings", icon: Settings },
  { name: "Mail", icon: Mail },
  { name: "Message", icon: MessageSquare },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Flag", icon: Flag },
  { name: "Bookmark", icon: Bookmark },
  { name: "Clock", icon: Clock },
];

function getIconByName(name?: string): LucideIcon {
  if (!name) return Info;
  const found = iconOptions.find((o) => o.name === name);
  return found?.icon || Info;
}

const typeConfig: Record<
  Announcement["type"],
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  info: {
    label: "Info",
    icon: Info,
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  critical: {
    label: "Critical",
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

function getStatus(a: Announcement): { label: string; class: string } {
  const now = new Date();
  const start = new Date(a.startDate);
  const end = new Date(a.endDate);
  if (now < start) return { label: "Scheduled", class: "bg-muted text-muted-foreground" };
  if (now > end)
    return { label: "Expired", class: "bg-muted text-muted-foreground line-through" };
  return {
    label: "Live",
    class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
}

function fmt(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function ymdOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover
            open={open}
            onOpenChange={setOpen}
            align="start"
            trigger={
              <Button
                variant="outline"
                className="w-full justify-start text-left text-sm h-9 font-normal"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                {dayLabel(value)}
              </Button>
            }
          >
            <CalendarPicker
              value={ymdOf(value)}
              onChange={(iso) => {
                const [y, m, d] = iso.split("-").map(Number);
                const updated = new Date(value);
                updated.setFullYear(y, m - 1, d);
                onChange(updated);
                setOpen(false);
              }}
            />
          </Popover>
        </div>
        <Input
          type="time"
          value={`${pad2(value.getHours())}:${pad2(value.getMinutes())}`}
          onChange={(e) => {
            const [h, m] = e.target.value.split(":").map(Number);
            if (Number.isNaN(h) || Number.isNaN(m)) return;
            const updated = new Date(value);
            updated.setHours(h, m);
            onChange(updated);
          }}
          className="w-28 h-9 text-sm"
        />
      </div>
    </div>
  );
}

export default function Announcements() {
  const [announcements, setAnnouncements] =
    React.useState<Announcement[]>(initialAnnouncements);
  const isAdmin = true;
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [formTitle, setFormTitle] = React.useState("");
  const [formDetails, setFormDetails] = React.useState("");
  const [formUrl, setFormUrl] = React.useState("");
  const [formType, setFormType] = React.useState<Announcement["type"]>("info");
  const [formIcon, setFormIcon] = React.useState<string>("Info");
  const [formStart, setFormStart] = React.useState(new Date());
  const [formEnd, setFormEnd] = React.useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  );
  const [formCreatedBy, setFormCreatedBy] = React.useState("Admin");

  const openCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDetails("");
    setFormUrl("");
    setFormType("info");
    setFormIcon("Info");
    setFormStart(new Date());
    setFormEnd(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));
    setFormCreatedBy("Admin");
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormTitle(a.title);
    setFormDetails(a.details);
    setFormUrl(a.url || "");
    setFormType(a.type);
    setFormIcon(a.icon || "Info");
    setFormStart(new Date(a.startDate));
    setFormEnd(new Date(a.endDate));
    setFormCreatedBy(a.createdBy);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Announcement title is required.",
        variant: "destructive",
      });
      return;
    }
    if (formEnd <= formStart) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      title: formTitle.trim(),
      details: formDetails.trim(),
      url: formUrl.trim() || undefined,
      type: formType,
      icon: formIcon,
      createdBy: formCreatedBy,
      startDate: formStart.toISOString(),
      endDate: formEnd.toISOString(),
    };

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...data } : a))
      );
      toast({ title: "Updated", description: "Announcement updated successfully." });
    } else {
      const newItem: Announcement = {
        id: `AN-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        ...data,
      };
      setAnnouncements((prev) => [newItem, ...prev]);
      toast({ title: "Created", description: "Announcement created successfully." });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Deleted", description: "Announcement removed." });
  };

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="Announcements"
        description="Workspace-wide messages from administrators."
        action={
          isAdmin ? (
            <Button onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["Live", "Scheduled", "Expired"] as const).map((status) => {
          const count = sorted.filter((a) => getStatus(a).label === status).length;
          return (
            <Card key={status}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{status}</span>
                <span className="text-xl font-bold">{count}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Announcement List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No announcements yet. Create one to get started.
            </p>
          )}
          {sorted.map((a) => {
            const status = getStatus(a);
            const conf = typeConfig[a.type];
            const Icon = a.icon ? getIconByName(a.icon) : conf.icon;
            const isOpen = expanded.has(a.id);
            return (
              <div key={a.id}>
                <div className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(a.id)) next.delete(a.id);
                        else next.add(a.id);
                        return next;
                      })
                    }
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium truncate">
                      {a.title}
                    </span>
                    {a.url && (
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] shrink-0", conf.badgeClass)}
                    >
                      {conf.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] shrink-0", status.class)}
                    >
                      {status.label}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 border-t space-y-3 animate-fade-in">
                      {a.details && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {a.details}
                        </p>
                      )}
                      {a.url && (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> {a.url}
                        </a>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fmt(a.startDate)} → {fmt(a.endDate)}
                        </span>
                        <span>Created by {a.createdBy}</span>
                        <span>Created {fmt(a.createdAt)}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1.5 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(a.id)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Title *
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Announcement headline shown to all users"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Details
              </label>
              <Textarea
                value={formDetails}
                onChange={(e) => setFormDetails(e.target.value)}
                placeholder="Additional details visible when the announcement is expanded…"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                URL (optional)
              </label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as Announcement["type"])}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Posted By
                </label>
                <Input
                  value={formCreatedBy}
                  onChange={(e) => setFormCreatedBy(e.target.value)}
                  placeholder="Admin"
                  className="h-9"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Icon
              </label>
              <div className="grid grid-cols-9 gap-1.5 p-2 border rounded-lg bg-muted/30">
                {iconOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = formIcon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormIcon(opt.name)}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                      title={opt.name}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Selected: {formIcon}
              </p>
            </div>

            <DateTimeField
              label="Start Date & Time"
              value={formStart}
              onChange={setFormStart}
            />
            <DateTimeField
              label="End Date & Time"
              value={formEnd}
              onChange={setFormEnd}
            />
            <Button className="w-full" onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Announcement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
