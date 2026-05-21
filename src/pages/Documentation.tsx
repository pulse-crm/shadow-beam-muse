import { useState } from "react";
import {
  Search,
  Ticket,
  Receipt,
  Package,
  MessageSquare,
  Kanban,
  CalendarDays,
  BookOpen,
  Mail,
  BarChart3,
  ShieldCheck,
  Keyboard,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  FileText,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Feature {
  title: string;
  description: string;
  details: string[];
  roles: ("Agent" | "Supervisor" | "Admin")[];
  route?: string;
}

interface Domain {
  name: string;
  icon: React.ElementType;
  description: string;
  features: Feature[];
}

const domains: Domain[] = [
  {
    name: "Customer Management",
    icon: Search,

    description:
      "Core CRM functionality for managing B2C and B2B telecom customer accounts with a unified Customer 360 view.",
    features: [
      {
        title: "Unified Search",
        description:
          "Search across customers, tickets, and orders from a single search bar with tabbed results.",
        details: [
          "Search by name, account number, email, phone, or postcode",
          "Results grouped into Customers, Tickets, and Orders tabs",
          "Filters for status, type, segment, contract status, and tags",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/",
      },
      {
        title: "Customer 360 View",
        description:
          "Consolidated single-screen view of all customer data using collapsible panels.",
        details: [
          "Account details, services, tickets, invoices, payments, orders, devices, contracts",
          "Activity timeline and customer notes",
          "Quick actions: create ticket, take payment, send email, suspend account",
          "Customer value scoring (Platinum / Gold / Silver / Bronze)",
          "Credit score display with class, score, and limit",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/customer/:id",
      },
      {
        title: "Customer Creation Wizard",
        description: "Step-by-step wizard to create new B2C or B2B customer accounts.",
        details: [
          "Guided multi-step form with validation",
          "Duplicate detection (matching email or phone across accounts)",
          "Account hierarchy support (parent / child accounts)",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/",
      },
      {
        title: "Tagging & Bulk Actions",
        description: "Organise and act on customers in bulk.",
        details: [
          "Create, assign, and filter by custom tags",
          "Bulk export to CSV",
          "Bulk tag assignment and customer merge",
          "Starred / favourite customers shown in sidebar",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/",
      },
    ],
  },
  {
    name: "Ticketing & Case Management",
    icon: Ticket,

    description:
      "Service desk with SLA tracking, AI-assisted categorisation, skills-based routing, and escalation management.",
    features: [
      {
        title: "Ticket Lifecycle",
        description:
          "Simplified three-status lifecycle: Open → Escalated → Closed.",
        details: [
          "Four priority levels: Low, Medium, High, Critical",
          "Five categories: Billing, Network, Service, Account, Technical",
          "Multi-channel intake: Phone, Portal, Email, Chatbot, SMS, In-Store",
          "Case templates with predefined steps and required skills",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/tickets",
      },
      {
        title: "SLA Management",
        description:
          "Response and resolution deadlines with visual timers and breach alerts.",
        details: [
          "Real-time SLA countdown timer per ticket",
          "SLA breach banner on the dashboard for at-risk tickets",
          "SLA compliance percentage tracked per customer",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/tickets",
      },
      {
        title: "AI-Assisted Ticket Creation",
        description:
          "AI predicts ticket category and suggests priority with confidence scores.",
        details: [
          "Automatic category prediction with confidence percentage",
          "Suggested priority level",
          "Agent can accept or override AI suggestions",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/tickets",
      },
      {
        title: "Escalation Engine",
        description:
          "Rule-based automatic escalation tied to SLA thresholds, priority, and repeated contacts.",
        details: [
          "SLA 75% elapsed → auto-escalate to L1 (Team Lead)",
          "SLA breach → escalate to L2 + notify manager",
          "Enterprise customer unresolved > 4h → escalate to enterprise lead",
          "Skills-based auto-assignment considering agent load and availability",
        ],
        roles: ["Supervisor", "Admin"],
        route: "/tickets",
      },
    ],
  },
  {
    name: "Billing & Invoicing",
    icon: Receipt,

    description:
      "Invoice management, collections tracking, and billing adjustment workflows with supervisor approval.",
    features: [
      {
        title: "Billing Dashboard",
        description:
          "KPI overview with paid, pending, and overdue totals plus invoice status breakdown.",
        details: [
          "Invoice summary with visual progress bars",
          "Revenue breakdown by product",
          "Expandable invoice line-item detail",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/billing",
      },
      {
        title: "Collections",
        description: "Track overdue accounts and aging receivables.",
        details: [
          "Top 10 accounts by outstanding balance",
          "Aging buckets: 30 / 60 / 90+ days overdue",
          "Revenue by customer tenure analysis",
        ],
        roles: ["Supervisor", "Admin"],
        route: "/billing",
      },
      {
        title: "Billing Adjustments",
        description:
          "Submit credit notes and adjustments requiring supervisor approval.",
        details: [
          "Agent submits adjustment with type, amount, and notes",
          "Supervisor reviews in the Approvals queue",
          "Full audit trail of all adjustments sortable by date and amount",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/billing",
      },
    ],
  },
  {
    name: "Product Catalogue",
    icon: Package,
    description:
      "Searchable catalogue of telecom products across Voice, Broadband, Bundle, Equipment, Add-on, and Enterprise categories.",
    features: [
      {
        title: "Product Search & Filtering",
        description: "Browse and search the full product catalogue with category filters.",
        details: [
          "Categories: Voice, Broadband, Bundle, Equipment, Add-on, Enterprise",
          "Monthly price display and feature list per product",
          "Coverage checker for broadband technology availability by postcode",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/products",
      },
    ],
  },
  {
    name: "Orders & Provisioning",
    icon: Package,
    description: "Order lifecycle management for service changes from draft to completion.",
    features: [
      {
        title: "Order Tracking",
        description:
          "Visual order tracker showing status progression with order types and line items.",
        details: [
          "Order types: New, Modify, Disconnect, Transfer",
          "Statuses: Draft → Submitted → In Progress → Complete (or Cancelled)",
          "Per-customer order panel within Customer 360",
          "Searchable via global search",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
      },
    ],
  },
  {
    name: "Sales Pipeline",
    icon: Kanban,

    description: "Kanban-style deal tracking across the full sales cycle.",
    features: [
      {
        title: "Pipeline Board",
        description:
          "Drag-and-drop deal cards across stages: Lead, Qualified, Proposal, Negotiation, Won, Lost.",
        details: [
          "Deal cards showing company, value, probability, expected close, and owner",
          "Stage advance / back buttons per deal",
          "Pipeline KPIs: total value, weighted value, won this month, active deals",
          "New deal creation dialog",
          "Lost deals summary section",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/pipeline",
      },
    ],
  },
  {
    name: "Communications",
    icon: MessageSquare,

    description:
      "Internal team messaging (Slack-like) and customer interaction history.",
    features: [
      {
        title: "Internal Messenger",
        description:
          "Direct and group messaging between agents with reactions, forwarding, and file attachments.",
        details: [
          "Direct messages and group conversations",
          "Message reactions (emoji), forwarding, and file attachments",
          "Typing indicators and read receipts",
          "Canned responses (pre-built reply templates)",
          "User presence: online / away / offline",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/messages",
      },
      {
        title: "Customer Interaction History",
        description:
          "Chronological log of all customer touchpoints across channels.",
        details: [
          "Channels: calls, emails, chats, SMS, in-store, portal",
          "Direction (inbound / outbound), duration, and outcome tracking",
          "Accessible within Customer 360 view",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
      },
    ],
  },
  {
    name: "Analytics & Reporting",
    icon: BarChart3,

    description:
      "Dashboards and reporting across operational, revenue, and customer satisfaction metrics.",
    features: [
      {
        title: "Main Dashboard",
        description:
          "KPI cards, trend charts, and drill-down dialogs for tickets and revenue.",
        details: [
          "KPIs: Active Subscribers, Open Tickets, Revenue MTD, Overdue Invoices",
          "Ticket volume trend (weekly / monthly / yearly)",
          "Revenue trend and churn breakdown by reason",
          "Net subscriber growth and segment distribution",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/dashboard",
      },
      {
        title: "Agent Performance",
        description:
          "Leaderboard and skill radar charts for agent productivity tracking.",
        details: [
          "Tickets resolved, avg response time, CSAT, FCR, escalation rate",
          "Top performer banner and streak tracking",
          "Skill radar chart for top agents",
          "Export to CSV / JSON",
        ],
        roles: ["Supervisor", "Admin"],
        route: "/performance",
      },
      {
        title: "Surveys & CSAT",
        description: "CSAT and NPS analytics with channel and agent breakdowns.",
        details: [
          "CSAT and NPS trend lines over 6 months",
          "NPS distribution: promoters / passives / detractors",
          "CSAT by channel and by agent",
          "Recent feedback with star ratings and action-needed flags",
        ],
        roles: ["Supervisor", "Admin"],
        route: "/surveys",
      },
    ],
  },
  {
    name: "Knowledge Base",
    icon: BookOpen,

    description: "Internal knowledge management for agent self-service and training.",
    features: [
      {
        title: "Article Library",
        description:
          "Searchable article collection with categories, types, and helpful voting.",
        details: [
          "Categories: Billing, Technical, Onboarding, Policies",
          "Article types: Article, Video, FAQ",
          "Featured articles section and helpful / not helpful voting",
          "View count, read time, and tag-based filtering",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/knowledge-base",
      },
    ],
  },
  {
    name: "Email Templates",
    icon: Mail,
    description:
      "Reusable email template management with variable placeholders and usage tracking.",
    features: [
      {
        title: "Template Manager",
        description:
          "Create, edit, preview, and favourite email templates with variable substitution.",
        details: [
          "Categories: Onboarding, Billing, Support, Retention, Sales, General",
          "Variable syntax: {{customer_name}}, {{account_number}}, etc.",
          "Copy-to-clipboard and template preview",
          "Star / favourite templates and usage tracking",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/email-templates",
      },
    ],
  },
  {
    name: "Task Calendar",
    icon: CalendarDays,

    description:
      "Personal task and activity management with a monthly calendar view.",
    features: [
      {
        title: "Calendar & Tasks",
        description:
          "Monthly grid with colour-coded task indicators and day detail panels.",
        details: [
          "Task types: Follow-up, Meeting, Call, Email, Deadline",
          "Priorities: High, Medium, Low (colour-coded)",
          "Task creation with date, time, type, priority, and customer link",
          "KPIs: Today's tasks, Overdue, This Week, Completed",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/calendar",
      },
    ],
  },
  {
    name: "Administration",
    icon: ShieldCheck,
    description:
      "User management, approvals, audit logging, permissions, and system configuration.",
    features: [
      {
        title: "Approvals Queue",
        description:
          "Supervisor / admin approval workflow for billing adjustments.",
        details: [
          "Pending adjustments with full context (customer, invoice, amount)",
          "Approve or reject with reason",
          "KPIs: Pending count, Pending total value, Approved today",
        ],
        roles: ["Supervisor", "Admin"],
        route: "/approvals",
      },
      {
        title: "Audit Log",
        description:
          "Chronological system-wide audit trail of all actions.",
        details: [
          "Timestamp, user, role, action, entity, entity ID, and details",
          "Export to CSV / JSON",
        ],
        roles: ["Admin"],
        route: "/audit",
      },
      {
        title: "User Management",
        description:
          "Dedicated page for managing system users with full CRUD, role breakdown, and profile pictures.",
        details: [
          "Add, edit, suspend, and delete users",
          "Roles: Agent, Supervisor, Admin with visual role breakdown cards",
          "User attributes: name, email, role, department, status, last login",
          "Profile picture upload, change, and delete per user",
          "Avatar column in user list for quick visual identification",
          "Filter users by role",
          "Force password reset on next login option",
        ],
        roles: ["Admin"],
        route: "/user-management",
      },
      {
        title: "Permissions Editor",
        description:
          "Granular feature-level permission management per role.",
        details: [
          "Toggle access for each feature per role (Admin, Supervisor, Agent)",
          "Managed features include: Dashboard, Tickets, Billing, Pipeline, Calendar, Products, Knowledge Base, Email Templates, Surveys, Approvals, Performance, Audit Log, User Management",
        ],
        roles: ["Admin"],
        route: "/user-management",
      },
      {
        title: "My Profile",
        description: "Personal profile management and appearance customisation.",
        details: [
          "View and edit your name, email, and profile information",
          "Profile picture with role-based defaults",
          "Dark / light mode toggle",
          "Five colour themes: Default Blue, Ocean Teal, Forest Green, Sunset Orange, Slate Indigo",
          "Theme persists across sessions via localStorage",
        ],
        roles: ["Agent", "Supervisor", "Admin"],
        route: "/settings",
      },
    ],
  },
];

const navigationGuide = [
  {
    label: "Customer Management",
    shortcut: "G then C",
    path: "/",
    description: "Landing page — search, filter, and create customers",
  },
  {
    label: "Dashboard",
    shortcut: "G then D",
    path: "/dashboard",
    description: "KPI overview, ticket and revenue trends, churn analysis",
  },
  {
    label: "Tickets",
    shortcut: "G then T",
    path: "/tickets",
    description: "Ticket list with filtering, saved views, and bulk actions",
  },
  {
    label: "Messages",
    shortcut: "",
    path: "/messages",
    description: "Internal messenger for agent-to-agent communication",
  },
  {
    label: "Pipeline",
    shortcut: "",
    path: "/pipeline",
    description: "Kanban sales pipeline with deal tracking",
  },
  {
    label: "Calendar",
    shortcut: "",
    path: "/calendar",
    description: "Personal task calendar with follow-ups and deadlines",
  },
  {
    label: "Products",
    shortcut: "",
    path: "/products",
    description: "Telecom product catalogue with coverage checker",
  },
  {
    label: "Billing",
    shortcut: "",
    path: "/billing",
    description: "Invoice management, collections, and adjustments",
  },
  {
    label: "Knowledge Base",
    shortcut: "",
    path: "/knowledge-base",
    description: "Internal articles, FAQs, and training resources",
  },
  {
    label: "Email Templates",
    shortcut: "",
    path: "/email-templates",
    description: "Reusable email templates with variables",
  },
  {
    label: "Surveys & CSAT",
    shortcut: "",
    path: "/surveys",
    description: "CSAT / NPS analytics and recent feedback",
  },
  {
    label: "Approvals",
    shortcut: "",
    path: "/approvals",
    description: "Billing adjustment approval queue (Supervisor / Admin)",
  },
  {
    label: "Performance",
    shortcut: "",
    path: "/performance",
    description: "Agent leaderboard and skill analysis (Supervisor / Admin)",
  },
  {
    label: "Audit Log",
    shortcut: "",
    path: "/audit",
    description: "System-wide action audit trail (Admin)",
  },
  {
    label: "User Management",
    shortcut: "",
    path: "/user-management",
    description: "User CRUD, role breakdown, profile pictures, and permissions (Admin)",
  },
  {
    label: "My Profile",
    shortcut: "G then S",
    path: "/settings",
    description: "Personal profile, appearance, and theme configuration",
  },
  {
    label: "Command Palette",
    shortcut: "⌘ K",
    path: "",
    description: "Quick search and navigate to any page or customer",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "What are the three user roles?",
    a: "Agent (front-line support), Supervisor (team lead with approval authority), and Admin (full system access including user management and audit).",
  },
  {
    q: "How does the ticket lifecycle work?",
    a: "Tickets use a simplified three-status flow: Open → Escalated → Closed. There is no separate 'In Progress' or 'Resolved' status — this keeps agent workflows streamlined.",
  },
  {
    q: "What does the AI do when creating a ticket?",
    a: "The AI predicts the ticket category (e.g. Billing, Network) with a confidence score and suggests a priority level. Agents can accept or override these suggestions.",
  },
  {
    q: "How are SLA breaches handled?",
    a: "At 75% of the SLA window, the ticket auto-escalates to L1 (Team Lead). At 100%, it escalates to L2 and the manager is notified. Critical P1 tickets with no response in 15 minutes escalate immediately to L2.",
  },
  {
    q: "How do billing adjustments get approved?",
    a: "An agent submits an adjustment from the Billing page or Customer 360. It appears in the Approvals queue where a Supervisor or Admin can approve or reject it with a reason.",
  },
  {
    q: "Can I customise the appearance?",
    a: "Yes. Go to My Profile and choose from five colour themes (Default Blue, Ocean Teal, Forest Green, Sunset Orange, Slate Indigo) and toggle dark / light mode.",
  },
  {
    q: "What keyboard shortcuts are available?",
    a: "Press G then D for Dashboard, G then C for Customers, G then T for Tickets, G then S for My Profile. Press ⌘K (or Ctrl+K) to open the Command Palette for quick navigation.",
  },
  {
    q: "How does customer value scoring work?",
    a: "A composite score based on spend, payment history, credit score, and ticket volume. Customers are tiered as Platinum, Gold, Silver, or Bronze to help prioritise retention and service efforts.",
  },
  {
    q: "What is the coverage checker?",
    a: "Enter a postcode in the Product Catalogue to see available broadband technologies (FTTP, FTTC, ADSL, G.fast), exchange information, and any active outages for that area.",
  },
  {
    q: "How does the shift handover work?",
    a: "An agent ending their shift completes a handover form listing open items, escalations, and notes. The incoming agent reviews and acknowledges the handover from the sidebar panel.",
  },
  {
    q: "Where do I manage users now?",
    a: "User Management has its own dedicated page accessible from the sidebar under Admin. It includes user CRUD, role breakdown cards, profile picture management, and a permissions editor.",
  },
  {
    q: "Can I upload a profile picture for a user?",
    a: "Yes. Open the Add or Edit User dialog on the User Management page. You can upload, change, or delete a profile picture. The avatar appears in the user list table for quick identification.",
  },
  {
    q: "What is the Permissions Editor?",
    a: "The Permissions Editor lets Admins toggle feature-level access for each role (Admin, Supervisor, Agent). It covers all major features including the new User Management page.",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DomainSection({ domain }: { domain: Domain }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const Icon = domain.icon;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{domain.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {domain.features.map((f) => {
          const isOpen = expanded === f.title;
          return (
            <div
              key={f.title}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : f.title)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium flex-1">{f.title}</span>
                <div className="flex gap-1">
                  {f.roles.map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">{f.description}</p>
                  <ul className="space-y-1">
                    {f.details.map((d, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  {f.route && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Navigate to:{" "}
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">{f.route}</code>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Documentation() {
  const [search, setSearch] = useState("");

  const filteredDomains = domains
    .map((d) => ({
      ...d,
      features: d.features.filter(
        (f) =>
          !search ||
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.description.toLowerCase().includes(search.toLowerCase()) ||
          d.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((d) => d.features.length > 0);

  const filteredFaqs = faqs.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack max-w-5xl mx-auto">
      <PageHeader
        title="Documentation"
        description="Complete feature reference, navigation guide, and frequently asked questions for PulseGS."
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features, pages, or FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Features
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-1.5">
            <Navigation className="h-3.5 w-3.5" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          {filteredDomains.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No features match your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredDomains.map((d) => <DomainSection key={d.name} domain={d} />)
          )}
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Page Directory</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All pages and keyboard shortcuts available in PulseGS.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_1fr] gap-x-4 px-3 py-2 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
                  <span>Page</span>
                  <span>Shortcut</span>
                  <span>Description</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
                  {navigationGuide
                    .filter(
                      (n) =>
                        !search ||
                        n.label.toLowerCase().includes(search.toLowerCase()) ||
                        n.description.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((n, i) => (
                      <div
                        key={n.label}
                        className={cn(
                          "grid grid-cols-[1fr_100px_1fr] gap-x-4 px-3 py-2.5 text-sm items-center",
                          i % 2 === 0 ? "bg-background" : "bg-muted/20"
                        )}
                      >
                        <span className="font-medium text-foreground">{n.label}</span>
                        <span>
                          {n.shortcut ? (
                            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono">
                              {n.shortcut}
                            </kbd>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">{n.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Keyboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Use these shortcuts for faster navigation.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { keys: "⌘ K", desc: "Open Command Palette" },
                  { keys: "G → D", desc: "Go to Dashboard" },
                  { keys: "G → C", desc: "Go to Customers" },
                  { keys: "G → T", desc: "Go to Tickets" },
                  { keys: "G → S", desc: "Go to Settings" },
                ].map((s) => (
                  <div
                    key={s.keys}
                    className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-foreground">{s.desc}</span>
                    <kbd className="text-xs bg-muted px-2 py-1 rounded border border-border font-mono">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No FAQs match your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((f, i) => (
              <Card key={i} className="border border-border">
                <CardContent className="py-4 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-foreground">{f.q}</p>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{f.a}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
