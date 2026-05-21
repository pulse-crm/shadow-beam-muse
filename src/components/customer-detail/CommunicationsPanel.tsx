import * as React from "react";
import { MessageSquare, Mail, Send, Eye, CheckCircle2 } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Field } from "@/components/ui/field/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { toast } from "@/components/ui/toast/toaster";
import type { Customer } from "@/data/mock";

type Channel = "Email" | "SMS";

interface CommTemplate {
  id: string;
  name: string;
  channel: Channel;
  category: string;
  body: string;
}

const commTemplates: CommTemplate[] = [
  {
    id: "CT01",
    name: "Outage Notification",
    channel: "SMS",
    category: "Network",
    body: "Dear {{name}}, we're aware of a service disruption in your area. Our engineers are working to restore service. We apologise for the inconvenience. Ref: {{accountNumber}}",
  },
  {
    id: "CT02",
    name: "Payment Reminder",
    channel: "Email",
    category: "Billing",
    body: "Dear {{name}},\n\nThis is a friendly reminder that your account {{accountNumber}} has an outstanding balance. Please arrange payment at your earliest convenience to avoid service interruption.\n\nKind regards,\nPulseGS Billing Team",
  },
  {
    id: "CT03",
    name: "Contract Renewal",
    channel: "Email",
    category: "Retention",
    body: "Dear {{name}},\n\nYour contract is approaching its end date. We'd love to keep you as a valued customer. Please contact us to discuss renewal options.\n\nBest regards,\nPulseGS Customer Retention",
  },
  {
    id: "CT04",
    name: "Service Activation",
    channel: "Email",
    category: "Provisioning",
    body: "Dear {{name}},\n\nYour new service has been activated on account {{accountNumber}}. If you have any questions, please contact us.\n\nWelcome aboard!\nPulseGS Service Team",
  },
  {
    id: "CT05",
    name: "Engineer Visit Scheduled",
    channel: "SMS",
    category: "Field Ops",
    body: "Hi {{name}}, your engineer visit has been scheduled. Please ensure someone is available. Ref: {{accountNumber}}",
  },
];

interface SentMessage {
  template: string;
  channel: Channel;
  time: string;
}

interface CommunicationsPanelProps {
  customer: Customer;
}

export function CommunicationsPanel({ customer }: CommunicationsPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [preview, setPreview] = React.useState("");
  const [channel, setChannel] = React.useState<Channel>("Email");
  const [sent, setSent] = React.useState<SentMessage[]>([]);

  const template = commTemplates.find((t) => t.id === selectedTemplate);

  const interpolate = (body: string) =>
    body
      .replace(/\{\{name\}\}/g, customer.name)
      .replace(/\{\{accountNumber\}\}/g, customer.accountNumber)
      .replace(/\{\{email\}\}/g, customer.email)
      .replace(/\{\{phone\}\}/g, customer.phone);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const tpl = commTemplates.find((t) => t.id === id);
    if (tpl) {
      setChannel(tpl.channel);
      setPreview(interpolate(tpl.body));
    }
  };

  const handleSend = () => {
    if (!preview.trim()) return;
    setSent((prev) => [
      { template: template?.name ?? "Custom", channel, time: new Date().toLocaleString() },
      ...prev,
    ]);
    toast({
      title: `${channel} sent`,
      description: `${template?.name ?? "Message"} sent to ${customer.name}.`,
      variant: "success",
    });
    setSelectedTemplate("");
    setPreview("");
  };

  return (
    <CollapsiblePanel title="Communications" icon={MessageSquare} count={sent.length} defaultOpen={false}>
      <div className="p-3 space-y-3">
        <Field label="Template">
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select a template…" />
            </SelectTrigger>
            <SelectContent>
              {commTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    {t.channel === "Email" ? (
                      <Mail className="h-3 w-3" />
                    ) : (
                      <MessageSquare className="h-3 w-3" />
                    )}
                    {t.name}
                    <Badge variant="outline" className="text-[9px] ml-1">{t.category}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={channel === "Email" ? "default" : "outline"}
            className="h-7 text-xs flex-1"
            onClick={() => setChannel("Email")}
          >
            <Mail className="h-3 w-3" /> Email
          </Button>
          <Button
            size="sm"
            variant={channel === "SMS" ? "default" : "outline"}
            className="h-7 text-xs flex-1"
            onClick={() => setChannel("SMS")}
          >
            <MessageSquare className="h-3 w-3" /> SMS
          </Button>
        </div>

        <Field
          label={
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> Preview & Edit
            </span>
          }
        >
          <Textarea
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            rows={4}
            className="text-xs"
            placeholder="Write or select a template…"
          />
        </Field>

        <Button size="sm" className="w-full h-8 text-xs" disabled={!preview.trim()} onClick={handleSend}>
          <Send className="h-3 w-3" /> Send {channel}
        </Button>

        {sent.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Sent Communications</p>
            {sent.map((msg, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-accent/30">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="font-medium">{msg.template}</span>
                  <Badge variant="outline" className="text-[9px]">{msg.channel}</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
