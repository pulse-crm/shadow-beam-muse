import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog/dialog";
import { Popover } from "@/components/ui/popover/popover";
import {
  Mail, Search, Plus, Copy, Eye, Edit2, Trash2,
  Clock, Star, CheckCircle2, X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "@/components/ui/toast/toaster";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  status: string;
  last_edited: string;
  // client-only helpers (not persisted)
  starred?: boolean;
}

const defaultCategories = ["Onboarding", "Billing", "Support", "Retention", "Sales", "General"];

const seedTemplates: Omit<EmailTemplate, "starred">[] = [
  {
    id: "et1", name: "Welcome Email — New Customer", subject: "Welcome to PulseGS — Getting Started",
    body: `Dear {{customer_name}},\n\nWelcome to PulseGS! We're thrilled to have you on board.\n\nYour account number is {{account_number}} and your service is now active.\n\nHere's what you can do next:\n• Log in to your customer portal at portal.pulseg.com\n• Download our mobile app for on-the-go account management\n• Contact our support team 24/7 at 0800 123 456\n\nIf you have any questions, don't hesitate to reach out.\n\nBest regards,\n{{agent_name}}\nPulseGS Customer Success Team`,
    category: "Onboarding", status: "Active", last_edited: "2025-02-12",
  },
  {
    id: "et2", name: "Invoice Overdue Reminder", subject: "Payment Reminder — Invoice {{invoice_number}}",
    body: `Dear {{customer_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for £{{amount}} was due on {{due_date}}.\n\nPlease arrange payment at your earliest convenience to avoid any service disruption.\n\nPayment methods:\n• Online: portal.pulseg.com/billing\n• Phone: 0800 123 456\n• Bank Transfer: Sort 12-34-56, Acc 12345678\n\nIf you've already made this payment, please disregard this email.\n\nKind regards,\n{{agent_name}}\nPulseGS Billing Team`,
    category: "Billing", status: "Active", last_edited: "2025-02-11",
  },
  {
    id: "et3", name: "Ticket Resolution Confirmation", subject: "Ticket {{ticket_id}} — Resolved",
    body: `Dear {{customer_name}},\n\nGreat news! Your support ticket {{ticket_id}} regarding "{{ticket_subject}}" has been resolved.\n\nResolution summary:\n{{resolution_notes}}\n\nIf you're still experiencing issues, simply reply to this email and we'll reopen your ticket immediately.\n\nWe'd love to hear your feedback — please take 30 seconds to rate your experience:\n[Rate Your Experience]\n\nThank you for choosing PulseGS.\n\n{{agent_name}}\nPulseGS Support Team`,
    category: "Support", status: "Active", last_edited: "2025-02-12",
  },
  {
    id: "et4", name: "Contract Renewal Offer", subject: "Your PulseGS Contract — Special Renewal Offer",
    body: `Dear {{customer_name}},\n\nYour current contract ({{contract_id}}) is due for renewal on {{renewal_date}}.\n\nAs a valued customer, we'd like to offer you an exclusive renewal deal:\n\n📦 {{offer_name}}\n💰 {{offer_price}} per month (save {{discount}}%)\n📅 {{contract_term}} month contract\n\nThis offer includes:\n• Upgraded speeds at no extra cost\n• Priority support access\n• Price lock guarantee\n\nTo accept this offer, reply to this email or call us on 0800 123 456.\n\nBest regards,\n{{agent_name}}\nPulseGS Retention Team`,
    category: "Retention", status: "Active", last_edited: "2025-02-09",
  },
  {
    id: "et5", name: "Service Outage Notification", subject: "Service Update — {{area}} Maintenance",
    body: `Dear {{customer_name}},\n\nWe're writing to let you know about planned maintenance in your area:\n\n🔧 What: {{maintenance_type}}\n📍 Area: {{area}}\n📅 When: {{start_time}} to {{end_time}}\n⏱️ Expected duration: {{duration}}\n\nDuring this time, you may experience intermittent connectivity.\n\nWe apologise for any inconvenience and are working to minimise disruption.\n\nFor live updates, visit: status.pulseg.com\n\nPulseGS Network Operations`,
    category: "General", status: "Active", last_edited: "2025-02-08",
  },
  {
    id: "et6", name: "New Product Launch — Upsell", subject: "Introducing {{product_name}} — Upgrade Today",
    body: `Hi {{customer_name}},\n\nExciting news! We've just launched {{product_name}}, and based on your current plan, we think you'd love it.\n\n✨ Key benefits:\n• {{benefit_1}}\n• {{benefit_2}}\n• {{benefit_3}}\n\n🎁 As an existing customer, enjoy {{discount}}% off for the first 3 months.\n\nInterested? Reply to this email or speak to your account manager.\n\nCheers,\n{{agent_name}}`,
    category: "Sales", status: "Active", last_edited: "2025-02-06",
  },
];

// Extract {{variables}} from body text
function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -2)))];
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(seedTemplates);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [removedDefaults, setRemovedDefaults] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(["et1", "et3"]));

  const categories = useMemo(() => ["All", ...defaultCategories.filter(c => !removedDefaults.includes(c)), ...customCategories], [customCategories, removedDefaults]);

  const handleAddGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Group already exists" });
      return;
    }
    setCustomCategories(prev => [...prev, trimmed]);
    setNewGroupName("");
    setAddGroupOpen(false);
    toast({ title: "Group added", description: `"${trimmed}" is now available.` });
  };

  const handleRemoveGroup = (group: string) => {
    const hasTemplates = templates.some(t => t.category === group);
    if (hasTemplates) {
      toast({ title: "Cannot remove", description: "Group still has templates assigned." });
      return;
    }
    if (customCategories.includes(group)) {
      setCustomCategories(prev => prev.filter(c => c !== group));
    } else {
      setRemovedDefaults(prev => [...prev, group]);
    }
    if (category === group) setCategory("All");
    toast({ title: "Group removed" });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return templates.filter(t => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    });
  }, [query, category, templates]);

  const copyToClipboard = (t: EmailTemplate) => {
    navigator.clipboard.writeText(t.body);
    toast({ title: "Copied!", description: `${t.name} body copied to clipboard.` });
  };

  const toggleStar = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template Deleted" });
  };

  const handleEdit = () => {
    if (!editTemplate) return;
    const { id, name, subject, body, category: cat, status } = editTemplate;
    const last_edited = new Date().toISOString().slice(0, 10);
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, name, subject, body, category: cat, status, last_edited } : t));
    setEditOpen(false);
    setEditTemplate(null);
    toast({ title: "Template Updated" });
  };

  const startEdit = (t: EmailTemplate) => {
    setEditTemplate({ ...t });
    setEditOpen(true);
  };

  const startNew = () => {
    setEditTemplate({
      id: `et${Date.now()}`, name: "", subject: "", body: "", category: "General",
      status: "Active", last_edited: new Date().toISOString().slice(0, 10),
    });
    setEditOpen(true);
  };

  const handleSaveNew = () => {
    if (!editTemplate || !editTemplate.name || !editTemplate.subject) return;
    const { starred, ...row } = editTemplate;
    void starred;
    setTemplates(prev => [...prev, row]);
    setEditOpen(false);
    setEditTemplate(null);
    toast({ title: "Template Created" });
  };

  const isNew = editTemplate && !templates.some(t => t.id === editTemplate.id);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-sm text-muted-foreground">Manage reusable email templates for customer communications</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={startNew}>
          <Plus className="h-3.5 w-3.5" /> New Template
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates…" value={query} onChange={e => setQuery(e.target.value)} className="pl-10 h-9" />
        </div>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <div className="flex items-center gap-1">
          <TabsList>
            {categories.map(c => (
              <TabsTrigger key={c} value={c} className="text-xs gap-1">
                {c}
                {c !== "All" && (
                  <button
                    onClick={e => { e.stopPropagation(); handleRemoveGroup(c); }}
                    className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
                  >
                    <X className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Popover
            open={addGroupOpen}
            onOpenChange={setAddGroupOpen}
            align="start"
            width={224}
            trigger={
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            }
          >
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium">New Group</p>
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={e => { if (e.key === "Enter") handleAddGroup(); }}
              />
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                Add Group
              </Button>
            </div>
          </Popover>
        </div>
      </Tabs>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{filtered.length} template{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(template => {
          const variables = extractVariables(template.body);
          return (
            <Card key={template.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleStar(template.id)}>
                        <Star className={cn("h-3.5 w-3.5", starredIds.has(template.id) ? "fill-warning text-warning" : "text-muted-foreground/30")} />
                      </button>
                      <p className="text-sm font-semibold truncate">{template.name}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">Subject: {template.subject}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] capitalize shrink-0 ml-2">{template.category}</Badge>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2">{template.body.slice(0, 120)}…</p>

                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {variables.slice(0, 4).map(v => (
                      <Badge key={v} variant="outline" className="text-[8px] font-mono">{`{{${v}}}`}</Badge>
                    ))}
                    {variables.length > 4 && (
                      <Badge variant="outline" className="text-[8px]">+{variables.length - 4} more</Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{template.last_edited}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => copyToClipboard(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => startEdit(template)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No templates found</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={v => { if (!v) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="h-4 w-4" /> Template Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="text-[10px] text-muted-foreground">Subject:</p>
                <p className="text-sm font-medium">{previewTemplate.subject}</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="p-3 bg-card border rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{previewTemplate.body}</pre>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button size="sm" className="gap-1" onClick={() => { if (previewTemplate) copyToClipboard(previewTemplate); }}>
              <Copy className="h-3 w-3" /> Copy Body
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={v => { if (!v) { setEditOpen(false); setEditTemplate(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNew ? "New Template" : "Edit Template"}</DialogTitle>
          </DialogHeader>
          {editTemplate && (
            <div className="space-y-3">
              <Input placeholder="Template name" value={editTemplate.name} onChange={e => setEditTemplate(t => t ? { ...t, name: e.target.value } : t)} className="h-9" />
              <Input placeholder="Email subject" value={editTemplate.subject} onChange={e => setEditTemplate(t => t ? { ...t, subject: e.target.value } : t)} className="h-9" />
              <Select value={editTemplate.category} onValueChange={v => setEditTemplate(t => t ? { ...t, category: v } : t)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Email body (use {{variable_name}} for dynamic content)"
                value={editTemplate.body}
                onChange={e => setEditTemplate(t => t ? { ...t, body: e.target.value } : t)}
                className="min-h-[200px] text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Use {"{{variable_name}}"} syntax for dynamic content like {"{{customer_name}}"}, {"{{account_number}}"}, etc.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditTemplate(null); }}>Cancel</Button>
            <Button size="sm" onClick={isNew ? handleSaveNew : handleEdit} disabled={!editTemplate?.name || !editTemplate?.subject}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> {isNew ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
