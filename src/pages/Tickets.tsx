import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Forward,
  StickyNote,
  CheckCircle2,
  XCircle,
  Users,
  ClipboardList,
  Send,
  Trash2,
  Pencil,
  UserCheck,
  ArrowUpRight,
  Download,
  Printer,
  Bookmark,
  BookmarkPlus,
  X,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select-pf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Popover } from "@/components/ui/popover/popover";
import { Separator } from "@/components/ui/separator/separator";
import {
  tickets as ticketsData,
  type Ticket,
  assignmentTeams,
  customers,
  users,
  type AssignmentTeam,
} from "@/data/mock";
import { Label } from "@/components/ui/label/label";
import { SearchablePicker } from "@/components/ui/searchable-picker/searchable-picker";
import { UserMinus } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/components/ui/toast/toaster";
import { useSavedViews } from "@/lib/savedViews";
import { downloadCsv, type CsvColumn } from "@/lib/csv";

interface TicketFilters extends Record<string, string> {
  status: string;
  priority: string;
  assignee: string;
}

const defaultFilters: TicketFilters = {
  status: "All Status",
  priority: "All Priority",
  assignee: "All Assignees",
};

export default function Tickets() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<TicketFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [active, setActive] = React.useState<Ticket | null>(null);
  const [forwardTo, setForwardTo] = React.useState("");
  const [newNote, setNewNote] = React.useState("");
  const [notes, setNotes] = React.useState<
    Record<string, { text: string; time: string; author: string }[]>
  >({});
  const [viewName, setViewName] = React.useState("");
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = React.useState(false);
  const [bulkAssignee, setBulkAssignee] = React.useState("");

  const { views, saveView, deleteView } = useSavedViews<TicketFilters>();
  const assignees = Array.from(new Set(ticketsData.map((t) => t.assignee)));

  // Team management state (local-only, mock data is read-only)
  const [localTeams, setLocalTeams] = React.useState<AssignmentTeam[]>(assignmentTeams);
  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<AssignmentTeam | null>(null);
  const [teamName, setTeamName] = React.useState("");
  const [teamDescription, setTeamDescription] = React.useState("");
  const [teamMembers, setTeamMembers] = React.useState<string[]>([]);
  const [memberToAdd, setMemberToAdd] = React.useState("");
  const [deleteTeamId, setDeleteTeamId] = React.useState<string | null>(null);

  const openNewTeam = () => {
    setEditingTeam(null);
    setTeamName("");
    setTeamDescription("");
    setTeamMembers([]);
    setMemberToAdd("");
    setTeamDialogOpen(true);
  };

  const openEditTeam = (team: AssignmentTeam) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description);
    setTeamMembers([...team.members]);
    setMemberToAdd("");
    setTeamDialogOpen(true);
  };

  const handleAddMember = () => {
    if (!memberToAdd || teamMembers.includes(memberToAdd)) return;
    setTeamMembers((prev) => [...prev, memberToAdd]);
    setMemberToAdd("");
  };

  const handleRemoveMember = (m: string) =>
    setTeamMembers((prev) => prev.filter((x) => x !== m));

  const handleSaveTeam = () => {
    const name = teamName.trim();
    if (!name || teamMembers.length === 0) return;
    if (editingTeam) {
      setLocalTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeam.id
            ? { ...t, name, description: teamDescription.trim(), members: teamMembers }
            : t
        )
      );
      toast({ title: "Team updated", description: `"${name}" saved.`, variant: "success" });
    } else {
      const newTeam: AssignmentTeam = {
        id: `TEAM-${Date.now().toString().slice(-4)}`,
        name,
        description: teamDescription.trim(),
        members: teamMembers,
      };
      setLocalTeams((prev) => [...prev, newTeam]);
      toast({ title: "Team created", description: `"${name}" created.`, variant: "success" });
    }
    setTeamDialogOpen(false);
  };

  const handleDeleteTeam = (id: string) => {
    const target = localTeams.find((t) => t.id === id);
    setLocalTeams((prev) => prev.filter((t) => t.id !== id));
    setDeleteTeamId(null);
    toast({ title: "Team deleted", description: `"${target?.name}" removed.`, variant: "destructive" });
  };

  const filtered = ticketsData.filter((t) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q);
    const matchesStatus = filters.status === "All Status" || t.status === filters.status;
    const matchesPriority = filters.priority === "All Priority" || t.priority === filters.priority;
    const matchesAssignee =
      filters.assignee === "All Assignees" || t.assignee === filters.assignee;
    return matchesQuery && matchesStatus && matchesPriority && matchesAssignee;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));
  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) filtered.forEach((t) => next.delete(t.id));
    else filtered.forEach((t) => next.add(t.id));
    setSelectedIds(next);
  };
  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const applyView = (v: { id: string; name: string; filters: TicketFilters }) => {
    setFilters(v.filters);
    toast({ title: "View applied", description: `"${v.name}" filters active.` });
  };

  const handleSaveView = () => {
    const name = viewName.trim();
    if (!name) return;
    saveView(name, filters);
    setViewName("");
    setSaveOpen(false);
    toast({ title: "View saved", description: `"${name}" saved.` });
  };

  const exportColumns: CsvColumn<Ticket>[] = [
    { key: "id", header: "ID", accessor: (t) => t.id },
    { key: "subject", header: "Subject", accessor: (t) => t.subject },
    { key: "customer", header: "Customer", accessor: (t) => t.customer },
    { key: "priority", header: "Priority", accessor: (t) => t.priority },
    { key: "status", header: "Status", accessor: (t) => t.status },
    { key: "category", header: "Category", accessor: (t) => t.category },
    { key: "assignee", header: "Assignee", accessor: (t) => t.assignee },
    { key: "sla", header: "SLA Deadline", accessor: (t) => t.slaDeadline },
  ];

  const slaCell = (t: Ticket) => {
    const ms = new Date(t.slaDeadline).getTime() - Date.now();
    const overdue = ms < 0 && t.status !== "Resolved" && t.status !== "Closed";
    const hours = Math.abs(Math.floor(ms / 3_600_000));
    return (
      <span className={overdue ? "text-destructive font-medium text-xs" : "text-xs text-muted-foreground"}>
        {overdue ? `Overdue ${hours}h` : `In ${hours}h`}
      </span>
    );
  };

  const ticketsTable = (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Views:</span>
        {views.length === 0 ? (
          <span className="text-[11px] text-muted-foreground/70">
            No saved views — apply filters and click the bookmark to save one.
          </span>
        ) : (
          views.map((v) => (
            <div key={v.id} className="flex items-center gap-0.5">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => applyView(v)}
              >
                {v.name}
              </Button>
              <button
                className="h-4 w-4 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors"
                onClick={() => deleteView(v.id)}
                aria-label={`Delete ${v.name} view`}
              >
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 flex-nowrap w-full md:w-1/2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="w-32 flex-none">
          <Select value={filters.priority} onValueChange={(v) => setFilters((f) => ({ ...f, priority: v }))}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Priority">All Priority</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-36 flex-none">
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40 flex-none">
          <Select value={filters.assignee} onValueChange={(v) => setFilters((f) => ({ ...f, assignee: v }))}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Assignees">All Assignees</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Popover
          open={saveOpen}
          onOpenChange={setSaveOpen}
          side="bottom"
          align="end"
          width={220}
          trigger={
            <Button variant="outline" size="icon-sm" title="Save current filters as a view" className="h-9 w-9">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          }
        >
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium">Save as View</p>
            <Input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="View name…"
              size="sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveView()}
            />
            <Button size="sm" className="w-full" onClick={handleSaveView} disabled={!viewName.trim()}>
              Save View
            </Button>
          </div>
        </Popover>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-primary/5 border-primary/20">
          <Badge variant="secondary" className="text-xs">
            {selectedIds.size} selected
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => {
              toast({ title: "Bulk Resolve", description: `${selectedIds.size} tickets marked as resolved.`, variant: "success" });
              setSelectedIds(new Set());
            }}
          >
            <CheckCircle2 className="h-3 w-3" /> Resolve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => {
              toast({ title: "Bulk Escalate", description: `${selectedIds.size} tickets escalated.`, variant: "destructive" });
              setSelectedIds(new Set());
            }}
          >
            <AlertTriangle className="h-3 w-3" /> Escalate
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setBulkAssignOpen(true)}
          >
            <UserCheck className="h-3 w-3" /> Assign
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3 w-3" /> Clear
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>SLA Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No tickets match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const cust = customers.find((c) => c.id === t.customerId);
                  return (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => setActive(t)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(t.id)}
                          onCheckedChange={() => toggle(t.id)}
                          className="h-3.5 w-3.5"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium max-w-64 truncate">{t.subject}</TableCell>
                      <TableCell className="text-sm">{cust?.name ?? t.customer}</TableCell>
                      <TableCell>
                        <StatusBadge status={t.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="text-sm">{t.category}</TableCell>
                      <TableCell className="text-sm">{t.assignee}</TableCell>
                      <TableCell>{slaCell(t)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="page-stack">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadCsv("tickets", filtered, exportColumns);
              toast({ title: "Exported", description: `${filtered.length} tickets → CSV.`, variant: "success" });
            }}
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Tickets
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Team Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {ticketsTable}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Assignment Teams</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage teams used for ticket assignment and distribution.
              </p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={openNewTeam}>
              <Plus className="h-3.5 w-3.5" /> New Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {team.name}
                      <Badge variant="secondary" className="text-[10px]">
                        {team.members.length} members
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditTeam(team)}
                        aria-label="Edit team"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTeamId(team.id)}
                        aria-label="Delete team"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-xs text-muted-foreground">{team.description}</p>
                  <Separator />
                  <div className="space-y-1">
                    {team.members.map((member) => {
                      const u = users.find((x) => x.name === member);
                      return (
                        <div
                          key={member}
                          className="flex items-center justify-between py-1 px-2 rounded bg-muted/40"
                        >
                          <span className="text-xs font-medium">{member}</span>
                          {u && <StatusBadge status={u.status} />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {localTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No teams configured yet. Create your first team to get started.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk Assign dialog */}
      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign {selectedIds.size} Tickets</DialogTitle>
          </DialogHeader>
          <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select assignee…" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!bulkAssignee}
              onClick={() => {
                toast({
                  title: "Bulk Assign",
                  description: `${selectedIds.size} tickets assigned to ${bulkAssignee}.`,
                });
                setSelectedIds(new Set());
                setBulkAssignOpen(false);
                setBulkAssignee("");
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team create / edit dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Team Name</Label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Billing Team"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="What this team handles..."
                className="h-8 text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Members ({teamMembers.length})</Label>
              <div className="flex gap-2">
                <SearchablePicker
                  className="flex-1"
                  options={users
                    .filter((u) => !teamMembers.includes(u.name))
                    .map((u) => ({
                      value: u.name,
                      label: u.name,
                      description: `${u.status} · ${u.role}`,
                    }))}
                  value={memberToAdd}
                  onValueChange={setMemberToAdd}
                  placeholder="Search agents to add..."
                />
              </div>
              {memberToAdd && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={handleAddMember}
                >
                  <Plus className="h-3 w-3" /> Add {memberToAdd}
                </Button>
              )}

              {teamMembers.length > 0 && (
                <div className="space-y-1 mt-2">
                  {teamMembers.map((m) => (
                    <div
                      key={m}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50"
                    >
                      <span className="text-xs font-medium">{m}</span>
                      <button
                        onClick={() => handleRemoveMember(m)}
                        className="h-5 w-5 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors"
                        aria-label={`Remove ${m}`}
                      >
                        <UserMinus className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {teamMembers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No members added yet</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTeam}
              disabled={!teamName.trim() || teamMembers.length === 0}
            >
              {editingTeam ? "Save Changes" : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete team confirmation */}
      <Dialog open={!!deleteTeamId} onOpenChange={(o) => !o && setDeleteTeamId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Delete Team
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>{localTeams.find((t) => t.id === deleteTeamId)?.name}</strong>? This won't affect
            existing ticket assignments.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTeamId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTeamId && handleDeleteTeam(deleteTeamId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {active.id} — {active.subject}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {active.customer} · {active.category}
                </p>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-3 bg-muted/30 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <StatusBadge status={active.priority} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={active.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assignee</p>
                    <p className="font-medium">{active.assignee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA Deadline</p>
                    <p className="font-medium">{formatDateTime(active.slaDeadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDateTime(active.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Forward className="h-4 w-4 text-muted-foreground" /> Forward / Reassign
                  </h4>
                  <div className="flex gap-2">
                    <Select value={forwardTo} onValueChange={setForwardTo}>
                      <SelectTrigger className="flex-1 h-8 text-xs">
                        <SelectValue placeholder="Select person or team…" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            {u.name}
                          </SelectItem>
                        ))}
                        {assignmentTeams.map((t) => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!forwardTo}
                      onClick={() => {
                        toast({ title: "Ticket forwarded", description: `${active.id} → ${forwardTo}` });
                        setForwardTo("");
                      }}
                    >
                      <Send className="h-3 w-3" /> Forward
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-muted-foreground" /> Notes ({(notes[active.id] ?? []).length})
                  </h4>
                  {(notes[active.id] ?? []).length > 0 && (
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto scrollbar-thin">
                      {(notes[active.id] ?? []).map((n, i) => (
                        <div key={i} className="rounded-md border border-border p-2 bg-muted/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium">{n.author}</span>
                            <span className="text-[10px] text-muted-foreground">{n.time}</span>
                          </div>
                          <p className="text-xs">{n.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note…"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={!newNote.trim()}
                    onClick={() => {
                      setNotes((prev) => ({
                        ...prev,
                        [active.id]: [
                          ...(prev[active.id] ?? []),
                          { text: newNote, time: new Date().toLocaleString(), author: "Nihala Nazar" },
                        ],
                      }));
                      setNewNote("");
                      toast({ title: "Note added" });
                    }}
                  >
                    <StickyNote className="h-3 w-3" /> Add Note
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/customer/${active.customerId}`);
                    setActive(null);
                  }}
                >
                  Open customer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({ title: "Ticket escalated", description: active.id, variant: "destructive" });
                    setActive(null);
                  }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({ title: "Ticket closed", description: active.id });
                    setActive(null);
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" /> Close
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    toast({ title: "Ticket resolved", description: active.id, variant: "success" });
                    setActive(null);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
