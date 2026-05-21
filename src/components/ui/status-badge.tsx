import { Badge, type BadgeTone } from "@/components/ui/badge/badge";
import { cn } from "@/lib/cn";

/**
 * Centralised status -> tone mapping. Add new statuses here so every page
 * gets consistent colouring without redeclaring its own local map.
 */
export const statusToneMap: Record<string, BadgeTone> = {
  // Customer / account
  Active: "success",
  Online: "success",
  Suspended: "warning",
  Pending: "warning",
  Closed: "neutral",
  Offline: "neutral",
  Away: "warning",
  Available: "success",
  Busy: "warning",
  Provisioning: "info",

  // Tickets
  Open: "info",
  "In Progress": "info",
  Escalated: "destructive",
  Resolved: "success",

  // Priority
  Critical: "destructive",
  High: "warning",
  Medium: "info",
  Low: "neutral",

  // Contract
  Renewed: "success",
  "Expiring Soon": "warning",
  Expired: "destructive",

  // Pipeline / deals
  Won: "success",
  Lost: "destructive",
  Negotiation: "warning",
  Proposal: "info",
  Qualified: "info",
  Lead: "neutral",

  // Invoice / billing
  Paid: "success",
  Overdue: "destructive",

  // Generic actions / approvals / audit
  Approved: "success",
  Rejected: "destructive",
  Success: "success",
  Failed: "destructive",

  // Lifecycle / orders / catalog
  Completed: "neutral",
  Cancelled: "destructive",
  Paused: "warning",
  Draft: "warning",
  Archived: "neutral",

  // Customer types
  B2B: "info",
  B2C: "primary",

  // Profile types (mirrors project-files)
  Individual: "info",
  Business: "primary",
  SME: "warning",
  Enterprise: "primary",
  Government: "success",
  Consumer: "neutral",

  // Order types
  Subscription: "info",
  "One-off": "neutral",

  // Feedback / triage
  Bug: "destructive",
  Idea: "info",
  Praise: "success",
  Question: "warning",
  Triaged: "info",

  // Generic on/off
  Disabled: "neutral",
};

/**
 * Soft outlined style per tone — colored border + tinted bg + same-coloured
 * text. Matches the project-files look so every StatusBadge reads the same
 * regardless of where it's used.
 */
const toneSoftStyles: Record<BadgeTone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  info: "bg-info/15 text-info border-info/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  default: "bg-primary/15 text-primary border-primary/30",
  secondary: "bg-secondary text-secondary-foreground border-secondary",
  neutral: "bg-muted text-muted-foreground border-muted",
  outline: "bg-muted text-muted-foreground border-muted",
};

interface StatusBadgeProps {
  status: string;
  /** Override the inferred tone if you want a non-default colour. */
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ status, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? statusToneMap[status] ?? "neutral";
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", toneSoftStyles[resolved], className)}>
      {status}
    </Badge>
  );
}
