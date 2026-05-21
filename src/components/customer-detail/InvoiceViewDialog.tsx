import * as React from "react";
import { Download, Mail, FileText, Printer, Send, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Separator } from "@/components/ui/separator/separator";
import { Badge } from "@/components/ui/badge/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table/table";
import { toast } from "@/components/ui/toast/toaster";
import type { Invoice } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/format";

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** Pulse Invoice has no line items — synthesize from the net amount so the
 *  document mirrors project-files. `amount` is treated as the net total. */
function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.amount;
  const vat = invoice.amount * 0.2;

  return (
    <div
      className="bg-card border rounded-lg p-6 space-y-6"
      id="invoice-content"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary">PulseGS</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Telecommunications Services</p>
          <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5">
            <p>PulseGS Ltd</p>
            <p>100 Broadband Way</p>
            <p>London, EC2R 8AH</p>
            <p>VAT: GB 123 4567 89</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold">INVOICE</h3>
          <p className="font-mono text-sm text-muted-foreground">{invoice.id}</p>
          <div className="mt-2">
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Billing Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
            Bill To
          </p>
          <p className="text-sm font-semibold">{invoice.customer}</p>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-0.5">
            <p>Account billing address on file</p>
            <p>United Kingdom</p>
          </div>
        </div>
        <div className="text-right">
          <div className="space-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Issue Date</p>
              <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Due Date</p>
              <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Payment Terms</p>
              <p className="text-sm font-medium">Net 30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Description</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-sm">Recurring services for billing period</TableCell>
            <TableCell className="text-right font-mono text-sm">
              {formatCurrency(invoice.amount)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net Total</span>
            <span className="font-mono">{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (20%)</span>
            <span className="font-mono">{formatCurrency(vat)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total Due</span>
            <span className="font-mono">{formatCurrency(invoice.amount + vat)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Separator />
      <div className="text-[10px] text-muted-foreground text-center space-y-0.5">
        <p>Payment by Direct Debit. If you have any queries, please contact billing@pulsegs.com</p>
        <p>PulseGS Ltd · Registered in England & Wales · Company No. 12345678</p>
      </div>
    </div>
  );
}

export function InvoiceViewDialog({ invoice, open, onOpenChange }: InvoiceViewDialogProps) {
  const [showEmail, setShowEmail] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState("");
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);

  if (!invoice) return null;

  const resetEmail = () => {
    setEmailTo("billing@pulsegs.com");
    setEmailSubject(`Invoice ${invoice.id} — PulseGS`);
    setEmailBody(
      `Dear ${invoice.customer},\n\nPlease find attached your invoice ${invoice.id} dated ${formatDate(
        invoice.issueDate
      )} for the amount of ${formatCurrency(invoice.amount)}.\n\nPayment is due by ${formatDate(
        invoice.dueDate
      )}.\n\nIf you have any questions regarding this invoice, please don't hesitate to contact us.\n\nKind regards,\nPulseGS Billing Team`
    );
    setEmailSent(false);
  };

  const handleOpenEmail = () => {
    resetEmail();
    setShowEmail(true);
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => {
      toast({ title: "Email Sent", description: `Invoice ${invoice.id} sent to ${emailTo}` });
      setShowEmail(false);
      setEmailSent(false);
    }, 1500);
  };

  const handleDownloadPdf = () => {
    toast({ title: "PDF Ready", description: `${invoice.id}.pdf — use the print dialog to save as PDF.` });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice {invoice.id}
            </DialogTitle>
          </DialogHeader>

          <InvoiceDocument invoice={invoice} />

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPdf}>
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPdf}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" onClick={handleOpenEmail}>
              <Mail className="h-3.5 w-3.5" /> Email Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Compose Dialog */}
      <Dialog open={showEmail} onOpenChange={setShowEmail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Invoice
            </DialogTitle>
          </DialogHeader>

          {emailSent ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <p className="text-sm font-medium">Sending…</p>
              <p className="text-xs text-muted-foreground">
                Invoice {invoice.id} is being sent to {emailTo}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 text-xs">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground">Attachment:</span>
                <span className="font-medium">{invoice.id}.pdf</span>
                <Badge variant="outline" className="text-[9px] ml-auto">PDF</Badge>
              </div>
            </div>
          )}

          {!emailSent && (
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEmail(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={handleSendEmail}
                disabled={!emailTo.trim() || !isValidEmail(emailTo)}
              >
                <Send className="h-3.5 w-3.5" /> Send Email
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
