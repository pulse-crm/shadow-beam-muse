import * as React from "react";
import { History, Mail, ArrowUpCircle } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { DataTable, type Column } from "@/components/ui/table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { cn } from "@/lib/cn";
import type { Interaction } from "@/data/mock";
import { formatDate } from "@/lib/format";

/**
 * `channel` doubles as the "type" badge so the colour matches the rest of the
 * status system (Phone/Email/Chat/Portal/SMS/In-Store are all in statusToneMap).
 */
const channelDirection: Record<Interaction["channel"], "↓ In" | "↑ Out"> = {
  Phone: "↓ In",
  Email: "↑ Out",
  Chat: "↓ In",
  Portal: "↓ In",
  SMS: "↑ Out",
  "In-Store": "↓ In",
};

const outcomeOf = (i: Interaction) => (i.agent === "System" ? "Logged" : "Completed");

export function InteractionHistoryPanel({ data }: { data: Interaction[] }) {
  const [selected, setSelected] = React.useState<Interaction | null>(null);

  const columns: Column<Interaction>[] = [
    {
      key: "date",
      header: "Date",
      render: (i) => <span className="text-xs">{formatDate(i.when)}</span>,
    },
    { key: "channel", header: "Type", render: (i) => <StatusBadge status={i.channel} /> },
    {
      key: "direction",
      header: "Dir",
      render: (i) => <span className="text-xs">{channelDirection[i.channel]}</span>,
    },
    {
      key: "summary",
      header: "Subject",
      render: (i) => (
        <button
          type="button"
          onClick={() => setSelected(i)}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline text-left"
        >
          {i.summary}
        </button>
      ),
    },
    {
      key: "agent",
      header: "Agent",
      render: (i) => <span className="text-xs">{i.agent}</span>,
    },
    {
      key: "outcome",
      header: "Outcome",
      // Pulse interactions have no outcome field — approximate from agent.
      render: (i) => (
        <span className="text-xs text-muted-foreground">{outcomeOf(i)}</span>
      ),
    },
  ];

  return (
    <CollapsiblePanel title="Interaction History" icon={History} count={data.length} defaultOpen={false}>
      <DataTable columns={columns} data={data} getRowKey={(i) => i.id} emptyMessage="No interactions logged." />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Interaction Detail
            </DialogTitle>
          </DialogHeader>
          {selected &&
            (() => {
              const inbound = channelDirection[selected.channel] === "↓ In";
              return (
                <div
                  className={cn(
                    "rounded-lg border p-3 border-l-4 space-y-2",
                    inbound
                      ? "bg-muted/30 border-l-primary"
                      : "bg-background border-l-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selected.channel} />
                      <Badge
                        variant={inbound ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {inbound ? "↓ Received" : "↑ Sent"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selected.when).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{selected.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Agent: {selected.agent}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.summary}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-[10px]">
                      {outcomeOf(selected)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                        <Mail className="h-3 w-3 mr-1" /> Reply
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                        <ArrowUpCircle className="h-3 w-3 mr-1" /> Forward
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </CollapsiblePanel>
  );
}
