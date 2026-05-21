import * as React from "react";
import {
  Gift,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Send,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Separator } from "@/components/ui/separator/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";
import type { Customer, Subscription } from "@/data/mock";
import { formatCurrency } from "@/lib/format";

type DeliveryChannel = "email" | "post" | "whatsapp";

interface QuoteProduct {
  name: string;
  desc: string;
  monthly: number;
}

interface RetentionOffer {
  id: string;
  name: string;
  description: string;
  duration: string;
}

const retentionOffers: RetentionOffer[] = [
  { id: "RET01", name: "Loyalty Discount 15%", description: "15% off current plan", duration: "12 months" },
  { id: "RET02", name: "Free Speed Upgrade", description: "Next tier broadband", duration: "6 months" },
  { id: "RET03", name: "£50 Retention Credit", description: "Applied to next invoice", duration: "One-time" },
  { id: "RET04", name: "Free Add-on Bundle", description: "International calling pack", duration: "3 months" },
];

const upgradeSuggestions = [
  { id: "UP1", name: "Pulse Fibre 5Gbps", desc: "Next-tier bandwidth · Pro support", monthly: 119.99 },
  { id: "UP2", name: "Pulse Business Bundle", desc: "Fibre + Voice + Static IP", monthly: 149.99 },
  { id: "UP3", name: "Pulse Connect Plus", desc: "Cloud PBX + Mobile add-on", monthly: 174.99 },
];

interface RetentionUpsellPanelProps {
  customer: Customer;
  subscriptions: Subscription[];
}

export function RetentionUpsellPanel({ customer, subscriptions }: RetentionUpsellPanelProps) {
  const [appliedOffer, setAppliedOffer] = React.useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [quoteProduct, setQuoteProduct] = React.useState<QuoteProduct | null>(null);
  const [deliveryChannel, setDeliveryChannel] = React.useState<DeliveryChannel>("email");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactAddress, setContactAddress] = React.useState("");
  const monthlySpend = subscriptions.reduce((sum, s) => sum + s.monthly, 0);

  const openQuoteDialog = (product: QuoteProduct) => {
    setQuoteProduct(product);
    setDeliveryChannel("email");
    setContactEmail(customer.email);
    setContactPhone(customer.phone);
    setContactAddress(customer.postcode);
    setQuoteOpen(true);
  };

  const handleSendQuote = () => {
    if (!quoteProduct) return;
    const channelLabel =
      deliveryChannel === "email" ? "Email" : deliveryChannel === "post" ? "Post" : "WhatsApp";
    const destination =
      deliveryChannel === "email"
        ? contactEmail
        : deliveryChannel === "post"
          ? contactAddress
          : contactPhone;
    toast({
      title: "Quote Sent",
      description: `${quoteProduct.name} quote sent to ${customer.name} via ${channelLabel} (${destination}).`,
    });
    setQuoteOpen(false);
    setQuoteProduct(null);
  };

  const channelCards: { value: DeliveryChannel; icon: React.ElementType; label: string; iconClass: string }[] = [
    { value: "email", icon: Mail, label: "Email", iconClass: "text-primary" },
    { value: "post", icon: MapPin, label: "Post", iconClass: "text-primary" },
    { value: "whatsapp", icon: MessageCircle, label: "WhatsApp", iconClass: "text-success" },
  ];
  const isExpiring = customer.contractStatus === "Expiring Soon" || customer.contractStatus === "Expired";
  const count = isExpiring ? 1 : 0;

  return (
    <CollapsiblePanel title="Retention & Upsell" icon={Gift} count={count} defaultOpen={isExpiring}>
      <div className="p-3 space-y-3">
        {isExpiring ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/30">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-warning">
                Contract {customer.contractStatus === "Expired" ? "has expired" : "is expiring soon"}
              </span>
              <span className="text-muted-foreground"> — retention action recommended</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground p-2">
            No renewal action needed — contract is {customer.contractStatus.toLowerCase()}.
          </div>
        )}

        <div className="p-2 rounded-lg bg-accent/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Monthly Spend</p>
          <p className="text-lg font-bold">{formatCurrency(monthlySpend)}/mo</p>
          <p className="text-[10px] text-muted-foreground">{subscriptions.length} active services</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Upgrade Paths
          </p>
          {upgradeSuggestions.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-2 rounded-md border border-border text-xs">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium">{formatCurrency(u.monthly)}/mo</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px]"
                  onClick={() => openQuoteDialog({ name: u.name, desc: u.desc, monthly: u.monthly })}
                >
                  Quote
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium flex items-center gap-1">
            <Gift className="h-3.5 w-3.5 text-primary" /> Retention Offers
          </p>
          {retentionOffers.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between p-2 rounded-md border border-border text-xs">
              <div>
                <p className="font-medium">{offer.name}</p>
                <p className="text-[10px] text-muted-foreground">{offer.description} · {offer.duration}</p>
              </div>
              {appliedOffer === offer.id ? (
                <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" /> Applied
                </Badge>
              ) : (
                <Button
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    setAppliedOffer(offer.id);
                    toast({ title: "Offer applied", description: `${offer.name} applied to ${customer.name}.` });
                  }}
                >
                  Apply
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          className="w-full h-8 text-xs"
          onClick={() => toast({ title: "Renewal initiated", description: `Contract renewal started for ${customer.name}.` })}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Initiate Contract Renewal
        </Button>
      </div>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-primary" /> Send Quote
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {quoteProduct && (
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">
                  Offer Details
                </p>
                <p className="text-sm font-semibold">{quoteProduct.name}</p>
                <p className="text-xs text-muted-foreground">{quoteProduct.desc}</p>
                <p className="text-base font-bold font-mono">
                  {formatCurrency(quoteProduct.monthly)}/mo
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Customer</p>
              <p className="text-sm font-semibold">{customer.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{customer.accountNumber}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-medium">Send via</Label>
              <div className="grid grid-cols-3 gap-2">
                {channelCards.map((c) => {
                  const Icon = c.icon;
                  const selected = deliveryChannel === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setDeliveryChannel(c.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", c.iconClass)} />
                      <span className="text-[10px] font-medium">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              {deliveryChannel === "email" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
              {deliveryChannel === "whatsapp" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
              {deliveryChannel === "post" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Postal Address</Label>
                  <Input
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuoteOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-xs gap-1.5" onClick={handleSendQuote}>
              <Send className="h-3.5 w-3.5" />
              Send Quote via{" "}
              {deliveryChannel === "email"
                ? "Email"
                : deliveryChannel === "post"
                  ? "Post"
                  : "WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CollapsiblePanel>
  );
}
