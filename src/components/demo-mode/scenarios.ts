export interface DemoStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  navigateTo?: string; // route to navigate to before this step
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  steps: DemoStep[];
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "customer-enquiry",
    title: "Customer Enquiry",
    description: "Explore the dashboard to review KPIs, ticket trends, and revenue data",
    icon: "LayoutDashboard",
    steps: [
      { target: "dashboard-kpi-cards", title: "Key Metrics", description: "These cards show your key metrics at a glance: subscribers, tickets, revenue, and overdue invoices. Click any card to drill into that area.", navigateTo: "/dashboard" },
      { target: "dashboard-subscribers-card", title: "Active Subscribers", description: "This card shows total active subscribers with month-over-month trend. Click to navigate to the full customer list." },
      { target: "dashboard-tabs", title: "Operational Views", description: "Switch between Customer Base analytics, Agent Workload distribution, and Surveys & CSAT scores using these tabs." },
      { target: "dashboard-ticket-volume", title: "Ticket Volume", description: "Monitor ticket trends over different time periods using the weekly/monthly/yearly toggles." },
      { target: "dashboard-revenue-trend", title: "Revenue Trend", description: "Track revenue performance over time. Toggle between weekly, monthly, and yearly views." },
    ],
  },
  {
    id: "new-ticket",
    title: "New Ticket",
    description: "Walk through raising a new support ticket for a customer",
    icon: "TicketPlus",
    steps: [
      { target: "customer-header", title: "Customer 360 View", description: "This is the customer's full account view showing contact details, credit score, balance, and contract information.", navigateTo: "/customer/C001" },
      { target: "customer-tickets-panel", title: "Open Tickets & Cases", description: "All customer tickets are listed here with SLA timers, escalation levels, AI categorization, and approval status." },
      { target: "customer-new-ticket-btn", title: "Create New Ticket", description: "Click this button to raise a new ticket for the customer. It opens the ticket creation dialog with AI-powered categorization." },
      { target: "customer-new-ticket-channel", title: "Select Channel", description: "Choose the channel the customer contacted you through — Phone, Portal, Email, Chatbot, SMS, or In-Store." },
      { target: "customer-new-ticket-template", title: "Case Template", description: "Templates pre-fill the ticket with relevant steps, default priority, and auto-assign to agents with matching skills." },
      { target: "customer-new-ticket-subject", title: "Subject & AI Preview", description: "Enter the issue subject. After 5+ characters, the AI engine suggests category, confidence score, and priority." },
      { target: "customer-new-ticket-submit", title: "Submit Ticket", description: "Submit the ticket. It will be auto-assigned based on skills-based routing to the best available agent." },
    ],
  },
  {
    id: "view-invoice",
    title: "View Customer Invoice",
    description: "Navigate to a customer's invoices and view a detailed breakdown",
    icon: "Receipt",
    steps: [
      { target: "customer-header", title: "Customer Account", description: "Start from the customer's full account view to access all financial records.", navigateTo: "/customer/C001" },
      { target: "customer-invoices-panel", title: "Invoices & Payments", description: "This panel shows all invoices with paid, pending, and overdue totals at the top, plus detailed invoice and payment records." },
      { target: "customer-invoices-table", title: "Invoice List", description: "View all invoices with their status, amount, and due dates. Click any row to expand and see linked payments." },
      { target: "customer-invoice-view-btn", title: "View Invoice Detail", description: "Click the View button on any invoice to see the full breakdown including line items, taxes, and payment history." },
    ],
  },
  {
    id: "take-payment",
    title: "Take Payment",
    description: "Process a payment for a customer account",
    icon: "CreditCard",
    steps: [
      { target: "customer-header", title: "Customer Account", description: "Start from the customer's account to access payment functions.", navigateTo: "/customer/C001" },
      { target: "customer-take-payment-btn", title: "Take Payment", description: "Click this button to process a payment for the customer. This triggers the payment workflow." },
      { target: "customer-invoices-panel", title: "Invoices & Payments", description: "Review the billing summary showing paid, pending, and overdue amounts. Expand invoices to see linked payments." },
      { target: "customer-invoices-table", title: "Invoice & Payment Records", description: "View all invoices with their payment history. Click any row to expand and see individual payment transactions." },
    ],
  },
  {
    id: "send-message",
    title: "Send Customer Message",
    description: "Send a message using the internal messaging system",
    icon: "MessageSquare",
    steps: [
      { target: "messenger-header", title: "Messenger", description: "The internal messaging system for team communication with real-time typing indicators and read receipts.", navigateTo: "/messages" },
      { target: "messenger-conversation-list", title: "Conversations", description: "Browse existing conversations or search for a contact. Unread messages are highlighted with a badge count." },
      { target: "messenger-new-chat-btn", title: "New Conversation", description: "Start a new direct message or create a group chat with multiple team members." },
      { target: "messenger-compose-area", title: "Compose Message", description: "Type your message here. You can attach files, images, use quick reply templates (⚡), or paste canned responses." },
      { target: "messenger-send-btn", title: "Send Message", description: "Send the message. Recipients will see read receipts (✓✓) and can react with emoji." },
    ],
  },
];
