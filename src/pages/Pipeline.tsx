import * as React from "react";
import {
  Building,
  User,
  Calendar,
  Plus,
  GripVertical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
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
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";
import { deals as seedDeals, type Deal } from "@/data/mock";

interface StageDef {
  id: Deal["stage"];
  label: string;
  color: string;
  textColor: string;
}

const stages: StageDef[] = [
  { id: "Lead", label: "Lead", color: "bg-muted-foreground/20", textColor: "text-muted-foreground" },
  { id: "Qualified", label: "Qualified", color: "bg-info/20", textColor: "text-info" },
  { id: "Proposal", label: "Proposal", color: "bg-warning/20", textColor: "text-warning" },
  { id: "Negotiation", label: "Negotiation", color: "bg-primary/20", textColor: "text-primary" },
  { id: "Won", label: "Won", color: "bg-success/20", textColor: "text-success" },
  { id: "Lost", label: "Lost", color: "bg-destructive/20", textColor: "text-destructive" },
];

const stageProbability = (stage: Deal["stage"]) =>
  stage === "Won" ? 100 : stage === "Lost" ? 0 : stage === "Negotiation" ? 75 : stage === "Proposal" ? 50 : stage === "Qualified" ? 40 : 20;

export default function Pipeline() {
  const [deals, setDeals] = React.useState<Deal[]>(seedDeals);
  const [draggedDeal, setDraggedDeal] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<{ name: string; company: string; value: string; stage: Deal["stage"] }>({
    name: "",
    company: "",
    value: "",
    stage: "Lead",
  });

  const moveDeal = (dealId: string, newStage: Deal["stage"]) => {
    const stage = stages.find((s) => s.id === newStage);
    const prob = stageProbability(newStage);
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage, probability: prob, updated: "just now" } : d
      )
    );
    toast({ title: "Deal Moved", description: `Moved to ${stage?.label}` });
  };

  const handleAdd = () => {
    if (!draft.name.trim() || !draft.company.trim() || !draft.value) return;
    const deal: Deal = {
      id: `D-${Date.now().toString().slice(-4)}`,
      name: draft.name.trim(),
      company: draft.company.trim(),
      value: parseFloat(draft.value) || 0,
      stage: draft.stage,
      probability: stageProbability(draft.stage),
      owner: "John Davies",
      expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      updated: "just now",
      contactType: "B2B",
    };
    setDeals((prev) => [...prev, deal]);
    setAddOpen(false);
    setDraft({ name: "", company: "", value: "", stage: "Lead" });
    toast({ title: "Deal Created", description: deal.name ?? deal.company });
  };

  const activeStages = stages.filter((s) => s.id !== "Lost");
  const closed = (stage: Deal["stage"]) => stage === "Won" || stage === "Lost";
  const totalPipeline = deals.filter((d) => !closed(d.stage)).reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = deals
    .filter((d) => !closed(d.stage))
    .reduce((sum, d) => sum + (d.value * (d.probability ?? stageProbability(d.stage))) / 100, 0);
  const wonTotal = deals.filter((d) => d.stage === "Won").reduce((sum, d) => sum + d.value, 0);
  const activeCount = deals.filter((d) => !closed(d.stage)).length;
  const lostDeals = deals.filter((d) => d.stage === "Lost");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track and manage deals across stages</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Deal
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Pipeline Value
            </p>
            <p className="text-xl font-bold mt-1">£{totalPipeline.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Weighted Value
            </p>
            <p className="text-xl font-bold mt-1">£{Math.round(weightedPipeline).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Won This Month
            </p>
            <p className="text-xl font-bold mt-1 text-success">£{wonTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Active Deals
            </p>
            <p className="text-xl font-bold mt-1">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {activeStages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div
              key={stage.id}
              className="min-w-[260px] flex-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedDeal) moveDeal(draggedDeal, stage.id);
                setDraggedDeal(null);
              }}
            >
              <div className={cn("rounded-t-lg px-3 py-2 flex items-center justify-between", stage.color)}>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs font-semibold", stage.textColor)}>{stage.label}</span>
                  <Badge variant="secondary" className="h-4 text-[9px] px-1">
                    {stageDeals.length}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  £{stageTotal.toLocaleString()}
                </span>
              </div>
              <div className="border border-t-0 rounded-b-lg bg-muted/30 min-h-[300px] p-2 space-y-2">
                {stageDeals.map((deal) => {
                  const prob = deal.probability ?? stageProbability(deal.stage);
                  const contactType = deal.contactType ?? "B2B";
                  return (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggedDeal(deal.id)}
                      onDragEnd={() => setDraggedDeal(null)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
                        draggedDeal === deal.id && "opacity-50"
                      )}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold leading-tight">
                            {deal.name ?? deal.company}
                          </p>
                          <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {contactType === "B2B" ? (
                            <Building className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                          <span className="truncate">{deal.company}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            £{deal.value.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{prob}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {deal.expectedClose ?? "—"}
                          </span>
                          <span>{deal.owner.split(" ")[0]}</span>
                        </div>
                        {stage.id !== "Won" && (
                          <div className="flex gap-1 pt-1 border-t">
                            {stage.id !== "Lead" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[9px] px-1 flex-1"
                                onClick={() => {
                                  const idx = stages.findIndex((s) => s.id === stage.id);
                                  if (idx > 0) moveDeal(deal.id, stages[idx - 1].id);
                                }}
                              >
                                ← Back
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[9px] px-1 flex-1 text-primary"
                              onClick={() => {
                                const idx = stages.findIndex((s) => s.id === stage.id);
                                if (idx < stages.length - 2) moveDeal(deal.id, stages[idx + 1].id);
                              }}
                            >
                              Advance →
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[10px] text-muted-foreground/50 border border-dashed rounded-md">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lostDeals.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium text-destructive mb-2">
              Lost Deals ({lostDeals.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              {lostDeals.map((d) => (
                <Badge
                  key={d.id}
                  variant="outline"
                  className="text-[10px] border-destructive/30 text-destructive gap-1"
                >
                  {d.name ?? d.company} — £{d.value.toLocaleString()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Deal name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="h-9"
              autoFocus
            />
            <Input
              placeholder="Company / Contact"
              value={draft.company}
              onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
              className="h-9"
            />
            <Input
              placeholder="Value (£)"
              type="number"
              value={draft.value}
              onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
              className="h-9"
            />
            <Select
              value={draft.stage}
              onValueChange={(v) => setDraft((d) => ({ ...d, stage: v as Deal["stage"] }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages
                  .filter((s) => s.id !== "Won" && s.id !== "Lost")
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!draft.name.trim() || !draft.company.trim() || !draft.value}
            >
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}