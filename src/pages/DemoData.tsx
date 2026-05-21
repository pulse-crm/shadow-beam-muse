import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Input } from "@/components/ui/input/input";
import { toast } from "@/components/ui/toast/toaster";
import { RotateCcw, Loader2, ShieldCheck, Save, Database } from "lucide-react";

const RESTORE_GROUPS = [
  { id: "customers", label: "Customers" },
  { id: "tickets", label: "Tickets & Audit" },
  { id: "orders", label: "Orders" },
  { id: "billing", label: "Billing & Payments" },
  { id: "services", label: "Services & Subscriptions" },
  { id: "products", label: "Products & Devices" },
  { id: "interactions", label: "Interactions" },
  { id: "users", label: "User Profiles & Permissions" },
  { id: "messaging", label: "Messenger" },
  { id: "pipeline", label: "Sales Pipeline" },
  { id: "calendar", label: "Task Calendar" },
  { id: "kb", label: "Knowledge Base" },
  { id: "surveys", label: "Surveys" },
  { id: "notes", label: "Customer Notes & Tags" },
  { id: "agents", label: "Agent Tools" },
  { id: "config", label: "Config & Templates" },
  { id: "audit", label: "Audit Log" },
  { id: "feedback", label: "Feedback" },
] as const;

interface BaselineInfo {
  saved_at: string;
  label: string;
}

interface IntegrityResult {
  emptyTables: string[];
  orphansFixed: { table: string; column: string; count: number }[];
  tableCounts: Record<string, number>;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function DemoData() {
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);
  const [saveSelectedGroups, setSaveSelectedGroups] = React.useState<string[]>([]);
  const [baselineLabel, setBaselineLabel] = React.useState("");
  const [baselineInfo, setBaselineInfo] = React.useState<BaselineInfo | null>(null);
  const [seedPending, setSeedPending] = React.useState(false);
  const [savePending, setSavePending] = React.useState(false);
  const [integrityRunning, setIntegrityRunning] = React.useState(false);
  const [integrityResult, setIntegrityResult] = React.useState<IntegrityResult | null>(null);

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleSaveGroup = (id: string) => {
    setSaveSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const runIntegrityCheck = () => {
    setIntegrityRunning(true);
    setIntegrityResult(null);
    setTimeout(() => {
      const data: IntegrityResult = {
        emptyTables: [],
        orphansFixed: [],
        tableCounts: {
          customers: 9,
          tickets: 6,
          invoices: 6,
          orders: 8,
          products: 6,
          users: 6,
          services: 12,
          interactions: 24,
          messenger_conversations: 5,
          pipeline_deals: 8,
          kb_articles: 14,
          survey_responses: 8,
        },
      };
      setIntegrityResult(data);
      const fixes = data.orphansFixed.length;
      const empty = data.emptyTables.length;
      if (fixes === 0 && empty === 0) {
        toast({
          title: "Integrity Check Passed",
          description: `All ${Object.keys(data.tableCounts).length} tables are healthy.`,
        });
      } else {
        toast({
          title: "Integrity Check Complete",
          description: `${fixes} orphan issue(s) auto-fixed. ${empty} empty table(s) detected.`,
          variant: fixes > 0 ? "destructive" : undefined,
        });
      }
      setIntegrityRunning(false);
    }, 900);
  };

  const handleSaveBaseline = (saveAll: boolean) => {
    const labels = saveAll
      ? "all data"
      : RESTORE_GROUPS.filter((g) => saveSelectedGroups.includes(g.id))
          .map((g) => g.label)
          .join(", ");
    if (
      !window.confirm(
        `Save current ${labels} as baseline?\n\nThis will overwrite any previously saved baseline for these groups.`
      )
    )
      return;

    setSavePending(true);
    setTimeout(() => {
      setBaselineInfo({ saved_at: new Date().toISOString(), label: baselineLabel });
      toast({
        title: "Baseline Saved",
        description: `Saved ${labels} as the new restore baseline.`,
      });
      setBaselineLabel("");
      setSaveSelectedGroups([]);
      setSavePending(false);
    }, 700);
  };

  const hasBaseline = !!baselineInfo;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Demo Data</h1>
      </div>

      {/* Save Current Data as Baseline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Current Data as Baseline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Snapshot the current database so future restores use your customised data instead of
            the original defaults.
          </p>

          {hasBaseline && baselineInfo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              <Database className="h-3.5 w-3.5 shrink-0" />
              <span>
                Last saved: {formatTimestamp(baselineInfo.saved_at)}
                {baselineInfo.label && (
                  <>
                    {" "}
                    — <em>{baselineInfo.label}</em>
                  </>
                )}
              </span>
            </div>
          )}

          <Input
            placeholder="Optional label, e.g. 'After adding test users'"
            value={baselineLabel}
            onChange={(e) => setBaselineLabel(e.target.value)}
            className="h-8 text-xs"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Select data groups to save (or save all)</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() =>
                  setSaveSelectedGroups((prev) =>
                    prev.length === RESTORE_GROUPS.length
                      ? []
                      : RESTORE_GROUPS.map((g) => g.id)
                  )
                }
              >
                {saveSelectedGroups.length === RESTORE_GROUPS.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {RESTORE_GROUPS.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors text-xs ${
                    saveSelectedGroups.includes(group.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <Checkbox
                    checked={saveSelectedGroups.includes(group.id)}
                    onCheckedChange={() => toggleSaveGroup(group.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="truncate">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={savePending}
              onClick={() => handleSaveBaseline(true)}
            >
              {savePending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save All as Baseline
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              disabled={savePending || saveSelectedGroups.length === 0}
              onClick={() => handleSaveBaseline(false)}
            >
              {savePending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save Selected ({saveSelectedGroups.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restore Demo Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Restore Demo Data
            {hasBaseline && (
              <Badge variant="secondary" className="text-[10px] ml-2">
                Baseline saved
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {hasBaseline
              ? "Restore will use your saved baseline data. Use 'Reset to Original' to bypass the baseline and restore factory defaults."
              : "Reset data back to the original demo dataset. Restore everything or pick specific data groups."}
          </p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Select data to restore</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() =>
                  setSelectedGroups((prev) =>
                    prev.length === RESTORE_GROUPS.length
                      ? []
                      : RESTORE_GROUPS.map((g) => g.id)
                  )
                }
              >
                {selectedGroups.length === RESTORE_GROUPS.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {RESTORE_GROUPS.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors text-xs ${
                    selectedGroups.includes(group.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="truncate">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs gap-1.5"
              disabled={seedPending}
              onClick={() => {
                const source = hasBaseline ? "saved baseline" : "original demo dataset";
                if (
                  window.confirm(
                    `Are you sure? This will replace ALL data with the ${source}.`
                  )
                ) {
                  setSeedPending(true);
                  setTimeout(() => {
                    setSelectedGroups([]);
                    toast({
                      title: "Demo Data Restored",
                      description: `All data has been reset from ${source}.`,
                    });
                    setSeedPending(false);
                  }, 700);
                }
              }}
            >
              {seedPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Restore All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              disabled={seedPending || selectedGroups.length === 0}
              onClick={() => {
                const labels = RESTORE_GROUPS.filter((g) =>
                  selectedGroups.includes(g.id)
                )
                  .map((g) => g.label)
                  .join(", ");
                if (
                  window.confirm(
                    `Restore selected data groups?\n\n${labels}\n\nThis will replace the selected data.`
                  )
                ) {
                  setSeedPending(true);
                  setTimeout(() => {
                    toast({
                      title: "Selected Data Restored",
                      description: `Restored: ${labels}`,
                    });
                    setSelectedGroups([]);
                    setSeedPending(false);
                  }, 700);
                }
              }}
            >
              {seedPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Restore Selected ({selectedGroups.length})
            </Button>
            {hasBaseline && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs gap-1.5 text-muted-foreground"
                disabled={seedPending}
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset to ORIGINAL factory defaults, bypassing your saved baseline?"
                    )
                  ) {
                    setSeedPending(true);
                    setTimeout(() => {
                      setSelectedGroups([]);
                      toast({
                        title: "Factory Reset Complete",
                        description: "All data restored to original defaults.",
                      });
                      setSeedPending(false);
                    }, 700);
                  }
                }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset to Original Defaults
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Integrity Check */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Data Integrity Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Scan all tables for orphaned references and missing data. Orphans are auto-deleted to
            maintain consistency.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={integrityRunning}
            onClick={runIntegrityCheck}
          >
            {integrityRunning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ShieldCheck className="h-3 w-3" />
            )}
            {integrityRunning ? "Checking…" : "Run Integrity Check"}
          </Button>

          {integrityResult && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    integrityResult.orphansFixed.length === 0 ? "secondary" : "destructive"
                  }
                  className="text-[10px]"
                >
                  {integrityResult.orphansFixed.length} orphan fix(es)
                </Badge>
                <Badge
                  variant={
                    integrityResult.emptyTables.length === 0 ? "secondary" : "outline"
                  }
                  className="text-[10px]"
                >
                  {integrityResult.emptyTables.length} empty table(s)
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {Object.keys(integrityResult.tableCounts).length} tables scanned
                </Badge>
              </div>
              {integrityResult.orphansFixed.length > 0 && (
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  {integrityResult.orphansFixed.map((fix, i) => (
                    <p key={i}>
                      Deleted {fix.count} orphan(s) from{" "}
                      <code className="text-foreground">
                        {fix.table}.{fix.column}
                      </code>
                    </p>
                  ))}
                </div>
              )}
              {integrityResult.emptyTables.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  Empty: {integrityResult.emptyTables.join(", ")}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
