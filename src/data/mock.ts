export type CustomerStatus = "Active" | "Suspended" | "Pending" | "Closed";
export type CustomerType = "B2B" | "B2C";
export type CustomerSegment = "Consumer" | "SMB" | "Enterprise" | "Government";
export type ContractStatus = "Active" | "Expiring Soon" | "Expired" | "Renewed" | "Pending";

export interface Customer {
  id: string;
  name: string;
  accountNumber: string;
  type: CustomerType;
  status: CustomerStatus;
  email: string;
  phone: string;
  postcode: string;
  segment: CustomerSegment;
  contractStatus: ContractStatus;
  creditScore: number;
  arr: number;
  joinedAt: string;
  health: number;
}

export const customers: Customer[] = [
  { id: "C001", name: "Acme Corp", accountNumber: "ACC-100234", type: "B2B", status: "Active", email: "ops@acme.example", phone: "+44 20 1234 5678", postcode: "EC2A 4NE", segment: "Enterprise", contractStatus: "Active", creditScore: 820, arr: 184000, joinedAt: "2024-01-12", health: 88 },
  { id: "C002", name: "Globex Industries", accountNumber: "ACC-100891", type: "B2B", status: "Active", email: "info@globex.example", phone: "+44 20 2345 6789", postcode: "E14 5AB", segment: "Enterprise", contractStatus: "Renewed", creditScore: 905, arr: 245000, joinedAt: "2023-09-05", health: 92 },
  { id: "C003", name: "Initech LLC", accountNumber: "ACC-100456", type: "B2B", status: "Active", email: "support@initech.example", phone: "+44 161 333 4444", postcode: "M14 5TP", segment: "SMB", contractStatus: "Active", creditScore: 660, arr: 42000, joinedAt: "2024-04-20", health: 71 },
  { id: "C004", name: "Umbrella Co", accountNumber: "ACC-100112", type: "B2B", status: "Suspended", email: "billing@umbrella.example", phone: "+44 121 555 1212", postcode: "B1 1BB", segment: "SMB", contractStatus: "Expired", creditScore: 480, arr: 18000, joinedAt: "2023-11-30", health: 54 },
  { id: "C005", name: "Hooli", accountNumber: "ACC-100567", type: "B2B", status: "Active", email: "hello@hooli.example", phone: "+44 207 999 0001", postcode: "SW1A 2AA", segment: "Enterprise", contractStatus: "Expiring Soon", creditScore: 740, arr: 312000, joinedAt: "2022-06-14", health: 78 },
  { id: "C006", name: "Stark Industries", accountNumber: "ACC-100789", type: "B2B", status: "Active", email: "team@stark.example", phone: "+44 207 444 8888", postcode: "W1A 1AA", segment: "Enterprise", contractStatus: "Active", creditScore: 950, arr: 528000, joinedAt: "2021-02-02", health: 95 },
  { id: "C007", name: "Sarah Henderson", accountNumber: "ACC-100892", type: "B2C", status: "Active", email: "sarah.h@example.com", phone: "+44 7700 900123", postcode: "BS8 2BN", segment: "Consumer", contractStatus: "Active", creditScore: 790, arr: 720, joinedAt: "2024-08-11", health: 82 },
  { id: "C008", name: "Marcus Singh", accountNumber: "ACC-100345", type: "B2C", status: "Active", email: "msingh@example.com", phone: "+44 7700 900345", postcode: "LS6 3HN", segment: "Consumer", contractStatus: "Pending", creditScore: 615, arr: 540, joinedAt: "2025-01-04", health: 67 },
  { id: "C009", name: "Priya Patel", accountNumber: "ACC-100923", type: "B2C", status: "Closed", email: "p.patel@example.com", phone: "+44 7700 900567", postcode: "GL56 0QW", segment: "Consumer", contractStatus: "Expired", creditScore: 410, arr: 0, joinedAt: "2023-05-23", health: 30 },
];

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  customerId: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Pending" | "Escalated" | "Resolved" | "Closed";
  category: string;
  assignee: string;
  createdAt: string;
  slaDeadline: string;
}

export const tickets: Ticket[] = [
  { id: "T-1024", subject: "Cannot access invoices", customer: "Acme Corp", customerId: "C001", priority: "High", status: "Open", category: "Billing", assignee: "Sarah Chen", createdAt: "2026-05-13T09:12:00Z", slaDeadline: "2026-05-15T09:12:00Z" },
  { id: "T-1025", subject: "Network outage in NW3", customer: "Globex Industries", customerId: "C002", priority: "Critical", status: "Escalated", category: "Network", assignee: "Marcus Lee", createdAt: "2026-05-14T07:42:00Z", slaDeadline: "2026-05-14T11:42:00Z" },
  { id: "T-1026", subject: "Provisioning delay — fibre install", customer: "Initech LLC", customerId: "C003", priority: "Medium", status: "In Progress", category: "Provisioning", assignee: "Priya Patel", createdAt: "2026-05-12T15:01:00Z", slaDeadline: "2026-05-16T15:01:00Z" },
  { id: "T-1027", subject: "Slow speeds reported", customer: "Hooli", customerId: "C005", priority: "Medium", status: "Pending", category: "Performance", assignee: "Diego Alvarez", createdAt: "2026-05-11T11:22:00Z", slaDeadline: "2026-05-15T11:22:00Z" },
  { id: "T-1028", subject: "DNS misconfig", customer: "Stark Industries", customerId: "C006", priority: "Low", status: "Resolved", category: "Network", assignee: "Sarah Chen", createdAt: "2026-05-09T16:33:00Z", slaDeadline: "2026-05-13T16:33:00Z" },
  { id: "T-1029", subject: "Refund request — duplicate charge", customer: "Sarah Henderson", customerId: "C007", priority: "High", status: "Open", category: "Billing", assignee: "Marcus Lee", createdAt: "2026-05-14T06:01:00Z", slaDeadline: "2026-05-15T06:01:00Z" },
];

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  issueDate: string;
  dueDate: string;
}

export const invoices: Invoice[] = [
  { id: "INV-2026-001", customer: "Acme Corp", amount: 12400, status: "Paid", issueDate: "2026-04-01", dueDate: "2026-04-15" },
  { id: "INV-2026-002", customer: "Globex Industries", amount: 24800, status: "Pending", issueDate: "2026-05-01", dueDate: "2026-05-20" },
  { id: "INV-2026-003", customer: "Initech LLC", amount: 4200, status: "Overdue", issueDate: "2026-04-10", dueDate: "2026-04-25" },
  { id: "INV-2026-004", customer: "Hooli", amount: 18900, status: "Pending", issueDate: "2026-05-02", dueDate: "2026-05-22" },
  { id: "INV-2026-005", customer: "Stark Industries", amount: 52000, status: "Paid", issueDate: "2026-04-15", dueDate: "2026-04-30" },
  { id: "INV-2026-006", customer: "Umbrella Co", amount: 2100, status: "Overdue", issueDate: "2026-03-30", dueDate: "2026-04-14" },
];

export interface Discount {
  id: string;
  code: string;
  description: string;
  type: "Percentage" | "Fixed";
  value: number;
  status: "Active" | "Expired";
  usedCount: number;
  expiresAt: string;
}

export const discounts: Discount[] = [
  { id: "D1", code: "WELCOME10", description: "10% off first 3 months", type: "Percentage", value: 10, status: "Active", usedCount: 184, expiresAt: "2026-12-31" },
  { id: "D2", code: "ENTERPRISE25", description: "£25 / mo off Enterprise plans", type: "Fixed", value: 25, status: "Active", usedCount: 22, expiresAt: "2026-09-30" },
  { id: "D3", code: "SUMMER20", description: "20% off all plans", type: "Percentage", value: 20, status: "Expired", usedCount: 412, expiresAt: "2025-08-31" },
  { id: "D4", code: "REFER50", description: "£50 referral credit", type: "Fixed", value: 50, status: "Active", usedCount: 56, expiresAt: "2026-12-31" },
];

export interface BillingAdjustment {
  id: string;
  customer: string;
  invoiceId: string;
  type: "Credit" | "Debit";
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const billingAdjustments: BillingAdjustment[] = [
  { id: "ADJ-1042", customer: "Globex Industries", invoiceId: "INV-2026-002", type: "Credit", amount: -480, reason: "SLA credit for outage on 2026-05-02", status: "Approved", requestedBy: "Marcus Lee", submittedAt: "2026-05-04 09:15", approvedBy: "Nihala Nazar", approvedAt: "2026-05-04 14:30" },
  { id: "ADJ-1043", customer: "Initech LLC", invoiceId: "INV-2026-003", type: "Credit", amount: -120, reason: "Pro-rata for downgrade", status: "Approved", requestedBy: "Sarah Chen", submittedAt: "2026-05-05 14:22", approvedBy: "Nihala Nazar", approvedAt: "2026-05-05 17:10" },
  { id: "ADJ-1044", customer: "Hooli", invoiceId: "INV-2026-004", type: "Credit", amount: -250, reason: "Goodwill credit", status: "Pending", requestedBy: "Priya Patel", submittedAt: "2026-05-12 11:01" },
  { id: "ADJ-1045", customer: "Acme Corp", invoiceId: "INV-2026-001", type: "Credit", amount: -1500, reason: "Late delivery on leased line", status: "Pending", requestedBy: "Diego Alvarez", submittedAt: "2026-05-13 16:48" },
  { id: "ADJ-1041", customer: "Umbrella Co", invoiceId: "INV-2026-006", type: "Debit", amount: 75, reason: "Duplicate charge reversal", status: "Rejected", requestedBy: "Marcus Lee", submittedAt: "2026-05-01 10:30" },
];

export const revenueTrend = [
  { label: "Sep", revenue: 4200000 },
  { label: "Oct", revenue: 4450000 },
  { label: "Nov", revenue: 4380000 },
  { label: "Dec", revenue: 4780000 },
  { label: "Jan", revenue: 5100000 },
  { label: "Feb", revenue: 4920000 },
  { label: "Mar", revenue: 5280000 },
  { label: "Apr", revenue: 5410000 },
];

export const ticketVolume = [
  { label: "Mon", count: 187 }, { label: "Tue", count: 214 }, { label: "Wed", count: 156 },
  { label: "Thu", count: 198 }, { label: "Fri", count: 223 }, { label: "Sat", count: 89 }, { label: "Sun", count: 62 },
];

export const pipelineStages = [
  { label: "Lead", value: 124 },
  { label: "Qualified", value: 86 },
  { label: "Proposal", value: 52 },
  { label: "Negotiation", value: 34 },
  { label: "Closed", value: 21 },
];

export interface Deal {
  id: string;
  company: string;
  owner: string;
  value: number;
  stage: "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  updated: string;
  name?: string;
  probability?: number;
  expectedClose?: string;
  contactType?: "B2B" | "B2C";
}

export const deals: Deal[] = [
  { id: "D-001", name: "Enterprise VoIP Migration", company: "Acme Corp", owner: "Sarah Chen", value: 42000, stage: "Negotiation", updated: "2h ago", probability: 75, expectedClose: "2026-06-15", contactType: "B2B" },
  { id: "D-002", name: "SD-WAN Deployment", company: "Globex Industries", owner: "Marcus Lee", value: 78500, stage: "Won", updated: "5h ago", probability: 100, expectedClose: "2026-05-10", contactType: "B2B" },
  { id: "D-003", name: "Metro Ethernet 100Mbps", company: "Initech LLC", owner: "Priya Patel", value: 12300, stage: "Proposal", updated: "1d ago", probability: 50, expectedClose: "2026-07-01", contactType: "B2B" },
  { id: "D-004", name: "Hosted PBX 30 Seats", company: "Umbrella Co", owner: "Diego Alvarez", value: 31750, stage: "Qualified", updated: "1d ago", probability: 40, expectedClose: "2026-07-20", contactType: "B2B" },
  { id: "D-005", name: "Fibre 1Gbps Upgrade", company: "Hooli", owner: "Sarah Chen", value: 9400, stage: "Lost", updated: "2d ago", probability: 0, expectedClose: "2026-04-30", contactType: "B2B" },
  { id: "D-006", name: "Leased Line + Backup", company: "Stark Industries", owner: "Marcus Lee", value: 120000, stage: "Negotiation", updated: "3d ago", probability: 80, expectedClose: "2026-06-30", contactType: "B2B" },
  { id: "D-007", name: "Broadband Bundle", company: "Wayne Enterprises", owner: "Priya Patel", value: 64500, stage: "Lead", updated: "4d ago", probability: 20, expectedClose: "2026-08-15", contactType: "B2B" },
  { id: "D-008", name: "SIP Trunking 50 Channels", company: "Massive Dynamic", owner: "Diego Alvarez", value: 28100, stage: "Proposal", updated: "1w ago", probability: 55, expectedClose: "2026-07-05", contactType: "B2B" },
];

export interface Subscription {
  id: string;
  customerId: string;
  product: string;
  startDate: string;
  renewalDate: string;
  monthly: number;
  status: "Active" | "Paused" | "Cancelled";
}

export const subscriptions: Subscription[] = [
  { id: "SUB-9001", customerId: "C001", product: "Pulse Fibre 2Gbps", startDate: "2024-01-12", renewalDate: "2027-01-12", monthly: 79.99, status: "Active" },
  { id: "SUB-9002", customerId: "C001", product: "SIP Trunk Voice", startDate: "2024-01-12", renewalDate: "2027-01-12", monthly: 12.50, status: "Active" },
  { id: "SUB-9010", customerId: "C002", product: "Dedicated Leased Line 10Gbps", startDate: "2023-09-05", renewalDate: "2026-09-05", monthly: 1450, status: "Active" },
  { id: "SUB-9011", customerId: "C002", product: "Static IPv4 /29", startDate: "2023-09-05", renewalDate: "2026-09-05", monthly: 8.00, status: "Active" },
  { id: "SUB-9020", customerId: "C003", product: "Pulse Fibre 1Gbps", startDate: "2024-04-20", renewalDate: "2026-04-20", monthly: 49.99, status: "Active" },
  { id: "SUB-9030", customerId: "C004", product: "Pulse Fibre 1Gbps", startDate: "2023-11-30", renewalDate: "2025-11-30", monthly: 49.99, status: "Paused" },
  { id: "SUB-9040", customerId: "C005", product: "Pulse Fibre 2Gbps", startDate: "2022-06-14", renewalDate: "2026-06-14", monthly: 79.99, status: "Active" },
  { id: "SUB-9041", customerId: "C005", product: "Static IPv4 /29", startDate: "2022-06-14", renewalDate: "2026-06-14", monthly: 8.00, status: "Active" },
  { id: "SUB-9050", customerId: "C006", product: "Dedicated Leased Line 10Gbps", startDate: "2021-02-02", renewalDate: "2027-02-02", monthly: 1450, status: "Active" },
  { id: "SUB-9060", customerId: "C007", product: "Pulse TV Bundle", startDate: "2024-08-11", renewalDate: "2026-08-11", monthly: 19.99, status: "Active" },
  { id: "SUB-9070", customerId: "C008", product: "Pulse Fibre 1Gbps", startDate: "2025-01-04", renewalDate: "2027-01-04", monthly: 49.99, status: "Active" },
];

export interface Device {
  id: string;
  customerId: string;
  name: string;
  type: "Router" | "Modem" | "Set-top Box" | "Handset";
  serialNumber: string;
  ipAddress?: string;
  firmware: string;
  status: "Online" | "Offline" | "Provisioning";
  lastSeen: string;
}

export const devices: Device[] = [
  { id: "DEV-1001", customerId: "C001", name: "Pulse XG-5 Router", type: "Router", serialNumber: "PXG5-AA01-882C", ipAddress: "10.42.5.1", firmware: "v3.4.2", status: "Online", lastSeen: "now" },
  { id: "DEV-1002", customerId: "C002", name: "Pulse Edge Gateway", type: "Router", serialNumber: "PEG-BB44-1029", ipAddress: "10.50.0.1", firmware: "v4.1.0", status: "Online", lastSeen: "now" },
  { id: "DEV-1003", customerId: "C003", name: "Pulse XG-3 Router", type: "Router", serialNumber: "PXG3-FF02-7710", ipAddress: "10.42.3.5", firmware: "v3.2.0", status: "Provisioning", lastSeen: "12m ago" },
  { id: "DEV-1004", customerId: "C005", name: "Pulse XG-5 Router", type: "Router", serialNumber: "PXG5-CC11-4488", ipAddress: "10.42.7.2", firmware: "v3.4.2", status: "Online", lastSeen: "now" },
  { id: "DEV-1005", customerId: "C006", name: "Pulse Enterprise Switch", type: "Router", serialNumber: "PES-DD33-9911", ipAddress: "10.60.1.1", firmware: "v5.0.1", status: "Online", lastSeen: "now" },
  { id: "DEV-1006", customerId: "C007", name: "Pulse TV Box", type: "Set-top Box", serialNumber: "PTV-EE55-6677", firmware: "v2.1.0", status: "Online", lastSeen: "2h ago" },
];

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  method: "Direct Debit" | "Card" | "Bank Transfer";
  paidAt: string;
  invoiceId?: string;
}

export const payments: Payment[] = [
  { id: "PAY-5001", customerId: "C001", amount: 12400, method: "Bank Transfer", paidAt: "2026-04-14", invoiceId: "INV-2026-001" },
  { id: "PAY-5002", customerId: "C002", amount: 24800, method: "Direct Debit", paidAt: "2026-05-01", invoiceId: "INV-2026-002" },
  { id: "PAY-5003", customerId: "C005", amount: 18900, method: "Direct Debit", paidAt: "2026-05-02", invoiceId: "INV-2026-004" },
  { id: "PAY-5004", customerId: "C006", amount: 52000, method: "Bank Transfer", paidAt: "2026-04-30", invoiceId: "INV-2026-005" },
  { id: "PAY-5005", customerId: "C001", amount: 92.49, method: "Direct Debit", paidAt: "2026-03-30" },
  { id: "PAY-5006", customerId: "C007", amount: 19.99, method: "Card", paidAt: "2026-05-01" },
];

export interface Interaction {
  id: string;
  customerId: string;
  channel: "Phone" | "Email" | "Chat" | "Portal" | "SMS" | "In-Store";
  agent: string;
  summary: string;
  when: string;
}

export const interactions: Interaction[] = [
  { id: "INT-1", customerId: "C001", channel: "Phone", agent: "Sarah Chen", summary: "Onboarding follow-up call", when: "2026-05-08 14:02" },
  { id: "INT-2", customerId: "C001", channel: "Email", agent: "Marcus Lee", summary: "Sent renewal terms PDF", when: "2026-05-05 09:30" },
  { id: "INT-3", customerId: "C001", channel: "Portal", agent: "System", summary: "Customer downloaded invoice INV-2026-001", when: "2026-04-15 17:11" },
  { id: "INT-4", customerId: "C002", channel: "Chat", agent: "Diego Alvarez", summary: "Discussed bandwidth upgrade", when: "2026-05-11 11:24" },
  { id: "INT-5", customerId: "C002", channel: "Phone", agent: "Sarah Chen", summary: "Outage resolved, callback complete", when: "2026-05-14 09:48" },
  { id: "INT-6", customerId: "C003", channel: "Email", agent: "Priya Patel", summary: "Provisioning ETA shared", when: "2026-05-12 16:00" },
  { id: "INT-7", customerId: "C005", channel: "Portal", agent: "System", summary: "Customer updated billing email", when: "2026-04-30 10:01" },
  { id: "INT-8", customerId: "C006", channel: "In-Store", agent: "Nina Sokolova", summary: "On-site review with account exec", when: "2026-04-22 13:30" },
  { id: "INT-9", customerId: "C007", channel: "SMS", agent: "System", summary: "Reminded customer to verify email", when: "2026-04-29 08:14" },
];

export interface Note {
  id: string;
  customerId: string;
  author: string;
  body: string;
  when: string;
  pinned?: boolean;
}

export const notes: Note[] = [
  { id: "N-1", customerId: "C001", author: "Sarah Chen", body: "VIP account — escalate any tickets immediately.", when: "2026-04-01", pinned: true },
  { id: "N-2", customerId: "C001", author: "Marcus Lee", body: "Renewal scheduled for Jan 2027 — discuss multi-year discount.", when: "2026-04-21" },
  { id: "N-3", customerId: "C002", author: "Diego Alvarez", body: "NOC handover doc updated to include their backup peer info.", when: "2026-05-14" },
  { id: "N-4", customerId: "C005", author: "Priya Patel", body: "Health score dipped — book a QBR.", when: "2026-04-29" },
];

export interface Order {
  id: string;
  customerId: string;
  customer: string;
  items: string[];
  totalValue: number;
  status: "Active" | "Pending" | "Completed" | "Cancelled";
  type: "Subscription" | "One-off";
  createdAt: string;
}

export const orders: Order[] = [
  { id: "ORD-7820", customerId: "C001", customer: "Acme Corp", items: ["Pulse Fibre 2Gbps", "SIP Trunk Voice"], totalValue: 92.49, status: "Active", type: "Subscription", createdAt: "2026-04-12" },
  { id: "ORD-7821", customerId: "C002", customer: "Globex Industries", items: ["Dedicated Leased Line 10Gbps"], totalValue: 1450, status: "Active", type: "Subscription", createdAt: "2026-03-29" },
  { id: "ORD-7822", customerId: "C003", customer: "Initech LLC", items: ["Pulse Fibre 1Gbps"], totalValue: 49.99, status: "Pending", type: "Subscription", createdAt: "2026-05-10" },
  { id: "ORD-7823", customerId: "C005", customer: "Hooli", items: ["Static IPv4 /29", "Pulse Fibre 2Gbps"], totalValue: 87.99, status: "Active", type: "Subscription", createdAt: "2026-04-22" },
  { id: "ORD-7824", customerId: "C007", customer: "Sarah Henderson", items: ["Pulse TV Bundle"], totalValue: 19.99, status: "Completed", type: "One-off", createdAt: "2026-05-01" },
  { id: "ORD-7825", customerId: "C006", customer: "Stark Industries", items: ["Pulse Fibre 2Gbps", "Static IPv4 /29"], totalValue: 87.99, status: "Active", type: "Subscription", createdAt: "2026-02-18" },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Archived";
  description?: string;
  features?: string[];
}

export const products: Product[] = [
  { id: "PRD001", name: "Home Phone Unlimited", category: "Voice", price: 18.00, stock: 999, status: "Active", description: "Unlimited UK landline calls", features: ["Unlimited UK calls", "Caller ID", "Voicemail", "Call divert"] },
  { id: "PRD002", name: "Fibre Broadband 80Mbps", category: "Broadband", price: 32.00, stock: 999, status: "Active", description: "FTTC fibre broadband", features: ["80Mbps download", "20Mbps upload", "Unlimited data", "Free router"] },
  { id: "PRD003", name: "Home Complete Bundle", category: "Bundle", price: 45.00, stock: 999, status: "Active", description: "Phone and broadband bundle", features: ["80Mbps fibre", "Unlimited calls", "Free installation", "12-month price guarantee"] },
  { id: "PRD004", name: "Enterprise SIP Trunking", category: "Enterprise", price: 1800.00, stock: 36, status: "Active", description: "Multi-channel SIP trunk solution", features: ["50 concurrent channels", "Number porting", "99.99% SLA", "24/7 NOC support"] },
  { id: "PRD005", name: "Dedicated Leased Line 1Gbps", category: "Broadband", price: 1200.00, stock: 18, status: "Active", description: "Symmetric dedicated fibre connection", features: ["1Gbps symmetric", "Static IPs", "4hr fix SLA", "Managed CPE"] },
  { id: "PRD006", name: "International Calling Add-on", category: "Add-on", price: 8.00, stock: 999, status: "Active", description: "International call bundle", features: ["100 international minutes", "60+ countries", "No setup fee"] },
  { id: "PRD007", name: "Managed WAN", category: "Enterprise", price: 600.00, stock: 24, status: "Active", description: "Managed wide-area network service", features: ["Multi-site connectivity", "QoS prioritisation", "Real-time monitoring", "Dedicated PM"] },
  { id: "PRD008", name: "Openreach FTTP 900Mbps", category: "Broadband", price: 55.00, stock: 999, status: "Active", description: "Full fibre to the premises", features: ["900Mbps download", "110Mbps upload", "Ultra-low latency", "Free WiFi 6 router"] },
  { id: "PRD009", name: "Pay-As-You-Go Line Rental", category: "Voice", price: 12.00, stock: 999, status: "Active", description: "Basic fixed line rental", features: ["Standard line rental", "Caller display", "No tie-in"] },
  { id: "PRD010", name: "Standard Broadband 17Mbps", category: "Broadband", price: 22.00, stock: 999, status: "Active", description: "Entry-level ADSL broadband", features: ["17Mbps download", "Unlimited data", "Free router"] },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Supervisor" | "Agent" | "Read-only";
  status: "Online" | "Offline" | "Away";
  lastSeen: string;
}

export interface AssignmentTeam {
  id: string;
  name: string;
  description: string;
  members: string[];
}

export const assignmentTeams: AssignmentTeam[] = [
  { id: "TEAM-001", name: "Senior Tech Ops", description: "Complex network and infrastructure tickets", members: ["Sarah Chen", "Diego Alvarez"] },
  { id: "TEAM-002", name: "NOC Team", description: "24/7 network operations", members: ["Marcus Lee", "Diego Alvarez", "Nina Sokolova"] },
  { id: "TEAM-003", name: "Billing Team", description: "Invoices, refunds, and adjustments", members: ["Priya Patel"] },
  { id: "TEAM-004", name: "Enterprise Sales", description: "Strategic account handling", members: ["Sarah Chen", "Marcus Lee"] },
];

export const users: User[] = [
  { id: "U001", name: "Nihala Nazar", email: "nihala.nazar@pulse.example", role: "Supervisor", status: "Online", lastSeen: "now" },
  { id: "U002", name: "Sarah Chen", email: "sarah.chen@pulse.example", role: "Agent", status: "Online", lastSeen: "now" },
  { id: "U003", name: "Marcus Lee", email: "marcus.lee@pulse.example", role: "Agent", status: "Away", lastSeen: "12m ago" },
  { id: "U004", name: "Priya Patel", email: "priya.patel@pulse.example", role: "Agent", status: "Online", lastSeen: "now" },
  { id: "U005", name: "Diego Alvarez", email: "diego.alvarez@pulse.example", role: "Agent", status: "Offline", lastSeen: "2h ago" },
  { id: "U006", name: "Nina Sokolova", email: "nina.s@pulse.example", role: "Admin", status: "Online", lastSeen: "now" },
];
