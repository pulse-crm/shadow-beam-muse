import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Phone,
  Mail,
  Users,
  AlertCircle,
  Trash2,
  Pencil,
  CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
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
import { Popover } from "@/components/ui/popover/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker/calendar-picker";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";

type TaskType = "follow-up" | "meeting" | "call" | "email" | "deadline";
type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: TaskType;
  priority: Priority;
  customer?: string;
  completed: boolean;
}

const typeConfig: Record<TaskType, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  "follow-up": { icon: Clock, color: "text-primary", label: "Follow-up" },
  meeting: { icon: Users, color: "text-info", label: "Meeting" },
  call: { icon: Phone, color: "text-success", label: "Call" },
  email: { icon: Mail, color: "text-warning", label: "Email" },
  deadline: { icon: AlertCircle, color: "text-destructive", label: "Deadline" },
};

const priorityColors: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const todayISO = new Date().toISOString().slice(0, 10);
const isoFromOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const seedTasks: Task[] = [
  { id: "t1", title: "Follow up with TechNova on contract renewal", date: isoFromOffset(0), time: "10:00", type: "follow-up", priority: "high", customer: "TechNova Solutions Ltd", completed: false },
  { id: "t2", title: "Quarterly review meeting — Metro City Council", date: isoFromOffset(1), time: "14:00", type: "meeting", priority: "medium", customer: "Metro City Council", completed: false },
  { id: "t3", title: "Call Sarah Mitchell re: billing dispute", date: isoFromOffset(0), time: "11:30", type: "call", priority: "high", customer: "Sarah Mitchell", completed: true },
  { id: "t4", title: "Send proposal for SD-WAN deployment", date: isoFromOffset(2), time: "09:00", type: "email", priority: "medium", customer: "TechNova Solutions Ltd", completed: false },
  { id: "t5", title: "SLA review deadline — GlobalFreight", date: isoFromOffset(3), type: "deadline", priority: "high", customer: "GlobalFreight Corp", completed: false },
  { id: "t6", title: "Onboarding call with new SMB customer", date: isoFromOffset(5), time: "10:30", type: "call", priority: "medium", customer: "MedFirst Clinic", completed: false },
  { id: "t7", title: "Follow up on broadband installation", date: isoFromOffset(6), time: "14:00", type: "follow-up", priority: "low", customer: "James Rodriguez", completed: false },
  { id: "t8", title: "Send renewal offer email", date: isoFromOffset(8), time: "09:00", type: "email", priority: "medium", customer: "David Cooper", completed: false },
  { id: "t9", title: "Team standup meeting", date: isoFromOffset(0), time: "09:00", type: "meeting", priority: "low", completed: false },
  { id: "t10", title: "Invoice reconciliation deadline", date: isoFromOffset(16), type: "deadline", priority: "high", completed: false },
];

function formatMonthYear(d: Date) {
  return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short" });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isoOf(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Calendar() {
  const [tasks, setTasks] = React.useState<Task[]>(seedTasks);
  const [currentMonth, setCurrentMonth] = React.useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = React.useState<string | null>(todayISO);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [draft, setDraft] = React.useState<{
    title: string;
    customer: string;
    type: TaskType;
    priority: Priority;
    date: string;
    time: string;
  }>({ title: "", customer: "", type: "follow-up", priority: "medium", date: todayISO, time: "" });

  const toggleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Task Deleted", variant: "destructive" });
  };

  const handleAdd = () => {
    if (!draft.title.trim() || !draft.date) return;
    const task: Task = {
      id: `t${Date.now()}`,
      title: draft.title.trim(),
      date: draft.date,
      time: draft.time || undefined,
      type: draft.type,
      priority: draft.priority,
      customer: draft.customer.trim() || undefined,
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
    setAddOpen(false);
    setDraft({
      title: "",
      customer: "",
      type: "follow-up",
      priority: "medium",
      date: selectedDate ?? todayISO,
      time: "",
    });
    toast({ title: "Task Added", description: task.title, variant: "success" });
  };

  const openEdit = (task: Task) => {
    setEditing({ ...task });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editing || !editing.title.trim()) return;
    setTasks((prev) => prev.map((t) => (t.id === editing.id ? editing : t)));
    setEditOpen(false);
    setEditing(null);
    toast({ title: "Task Updated", variant: "success" });
  };

  const nextMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  // Build calendar grid (weeks start Monday)
  const monthStart = currentMonth;
  const firstWeekday = (monthStart.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const calDays: { date: Date; inMonth: boolean }[] = [];

  // Leading days from previous month
  for (let i = firstWeekday; i > 0; i--) {
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - i);
    calDays.push({ date: d, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calDays.push({ date: new Date(monthStart.getFullYear(), monthStart.getMonth(), day), inMonth: true });
  }
  // Trailing days to fill weeks
  while (calDays.length % 7 !== 0) {
    const last = calDays[calDays.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    calDays.push({ date: next, inMonth: false });
  }

  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    }
    return map;
  }, [tasks]);

  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) ?? [] : [];
  const monthTasks = tasks
    .filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));

  const todayTasks = tasks.filter((t) => t.date === todayISO);
  const overdue = tasks.filter((t) => !t.completed && t.date < todayISO);
  const weekEnd = isoFromOffset(7);
  const thisWeek = tasks.filter((t) => t.date >= todayISO && t.date <= weekEnd);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Calendar</h1>
          <p className="text-sm text-muted-foreground">Manage follow-ups, meetings, and deadlines</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setDraft((d) => ({ ...d, date: selectedDate ?? todayISO }));
            setAddOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> New Task
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Today</p>
            <p className="text-lg font-bold">{todayTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Overdue</p>
            <p className="text-lg font-bold text-destructive">{overdue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">This Week</p>
            <p className="text-lg font-bold">{thisWeek.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Completed</p>
            <p className="text-lg font-bold text-success">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle
                className="text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedDate(null)}
              >
                {formatMonthYear(currentMonth)}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={nextMonth} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {calDays.map(({ date: d, inMonth }, i) => {
                const iso = isoOf(d);
                const dayTasks = tasksByDate.get(iso) ?? [];
                const isSelected = selectedDate === iso;
                const isToday = iso === todayISO;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    className={cn(
                      "h-16 p-1 rounded-md text-left transition-colors relative",
                      inMonth ? "hover:bg-accent" : "text-muted-foreground/30",
                      isSelected && "bg-primary/10 ring-1 ring-primary",
                      isToday && !isSelected && "bg-accent"
                    )}
                  >
                    <span className={cn("text-[11px]", isToday && "font-bold text-primary")}>
                      {d.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              t.completed
                                ? "bg-muted-foreground/30"
                                : t.priority === "high"
                                  ? "bg-destructive"
                                  : t.priority === "medium"
                                    ? "bg-warning"
                                    : "bg-primary"
                            )}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedDate
                ? formatLongDate(selectedDate)
                : `All Tasks — ${formatMonthYear(currentMonth)}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {(selectedDate ? selectedTasks : monthTasks).map((task) => {
              const conf = typeConfig[task.type];
              const Icon = conf.icon;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-md border transition-colors group",
                    task.completed && "opacity-50"
                  )}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id)}
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={cn("text-xs font-medium", task.completed && "line-through")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Icon className={cn("h-2.5 w-2.5", conf.color)} />
                      <span>{conf.label}</span>
                      {task.time && (
                        <>
                          <span>·</span>
                          <span>{task.time}</span>
                        </>
                      )}
                      {!selectedDate && (
                        <>
                          <span>·</span>
                          <span>{formatShortDate(task.date)}</span>
                        </>
                      )}
                    </div>
                    {task.customer && (
                      <p className="text-[10px] text-muted-foreground">{task.customer}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => openEdit(task)}
                      title="Edit"
                      aria-label="Edit task"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[8px] shrink-0", priorityColors[task.priority])}
                  >
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
            {selectedDate && selectedTasks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No tasks for this day</p>
            )}
            {!selectedDate && monthTasks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No tasks this month</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="h-9"
              autoFocus
            />
            <Input
              placeholder="Customer (optional)"
              value={draft.customer}
              onChange={(e) => setDraft((d) => ({ ...d, customer: e.target.value }))}
              className="h-9"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v as TaskType }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(typeConfig) as [TaskType, { label: string }][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft((d) => ({ ...d, priority: v as Priority }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <Popover
                  side="bottom"
                  align="start"
                  width={288}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full h-9 justify-start text-left font-normal text-xs"
                      type="button"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {draft.date
                        ? new Date(draft.date).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Pick a date"}
                    </Button>
                  }
                >
                  <CalendarPicker
                    value={draft.date}
                    onChange={(iso) => setDraft((d) => ({ ...d, date: iso }))}
                  />
                </Popover>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Due Time</label>
                <Input
                  type="time"
                  value={draft.time}
                  onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!draft.title.trim() || !draft.date}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input
                placeholder="Task title"
                value={editing.title}
                onChange={(e) =>
                  setEditing((t) => (t ? { ...t, title: e.target.value } : t))
                }
                className="h-9"
                autoFocus
              />
              <Input
                placeholder="Customer (optional)"
                value={editing.customer ?? ""}
                onChange={(e) =>
                  setEditing((t) => (t ? { ...t, customer: e.target.value || undefined } : t))
                }
                className="h-9"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={editing.type}
                  onValueChange={(v) => setEditing((t) => (t ? { ...t, type: v as TaskType } : t))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(typeConfig) as [TaskType, { label: string }][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={editing.priority}
                  onValueChange={(v) =>
                    setEditing((t) => (t ? { ...t, priority: v as Priority } : t))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                  <Popover
                    side="bottom"
                    align="start"
                    width={288}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full h-9 justify-start text-left font-normal text-xs"
                        type="button"
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(editing.date).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Button>
                    }
                  >
                    <CalendarPicker
                      value={editing.date}
                      onChange={(iso) =>
                        setEditing((t) => (t ? { ...t, date: iso } : t))
                      }
                    />
                  </Popover>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Due Time</label>
                  <Input
                    type="time"
                    value={editing.time ?? ""}
                    onChange={(e) =>
                      setEditing((t) => (t ? { ...t, time: e.target.value || undefined } : t))
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={editing.completed}
                  onCheckedChange={(v) =>
                    setEditing((t) => (t ? { ...t, completed: !!v } : t))
                  }
                />
                <label className="text-xs text-muted-foreground">Mark as completed</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditSave} disabled={!editing?.title.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
