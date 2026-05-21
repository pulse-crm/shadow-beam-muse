import * as React from "react";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Shield,
  Camera,
  X,
  Bot,
  LayoutDashboard,
  Ticket,
  CreditCard,
  Package,
  BookOpen,
  MessageSquare,
  CalendarDays,
  Settings,
  FileText,
  Server,
  Network,
  BarChart3,
  CheckSquare,
  ClipboardList,
  GripVertical,
  UserCog,
  Mail,
  SmilePlus,
  Kanban,
  Database,
  ScrollText,
  GitBranch,
  Timer,
  Megaphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select-pf";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";

type Role = "Admin" | "Supervisor" | "Agent";
type LiveStatus = "available" | "busy" | "away" | "dnd" | "offline";

const liveStatusConfig: Record<LiveStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-emerald-500" },
  busy: { label: "Busy", color: "bg-amber-500" },
  away: { label: "Away", color: "bg-yellow-500" },
  dnd: { label: "Do Not Disturb", color: "bg-destructive" },
  offline: { label: "Offline", color: "bg-muted-foreground/40" },
};

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Suspended";
  lastLogin: string;
  department: string;
  forcePasswordReset?: boolean;
  avatar?: string;
  liveStatus?: LiveStatus;
  isAi?: boolean;
}

const roleColor: Record<Role, string> = {
  Admin: "bg-primary/15 text-primary border-primary/30",
  Supervisor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Agent: "bg-muted text-muted-foreground border-muted-foreground/30",
};

const initialUsers: AppUser[] = [
  { id: "U001", name: "Nihala Nazar", email: "nihala.nazar@pulse.example", role: "Supervisor", status: "Active", lastLogin: "2026-05-18 08:42", department: "Customer Service", liveStatus: "available" },
  { id: "U002", name: "Sarah Chen", email: "sarah.chen@pulse.example", role: "Agent", status: "Active", lastLogin: "2026-05-18 09:10", department: "Technical Support", liveStatus: "busy" },
  { id: "U003", name: "Marcus Lee", email: "marcus.lee@pulse.example", role: "Agent", status: "Active", lastLogin: "2026-05-17 16:55", department: "Billing", liveStatus: "away" },
  { id: "U004", name: "Priya Patel", email: "priya.patel@pulse.example", role: "Agent", status: "Suspended", lastLogin: "2026-05-10 12:30", department: "Billing", liveStatus: "offline" },
  { id: "U005", name: "Diego Alvarez", email: "diego.alvarez@pulse.example", role: "Agent", status: "Active", lastLogin: "2026-05-18 07:05", department: "Network Operations", liveStatus: "offline" },
  { id: "U006", name: "Nina Sokolova", email: "nina.s@pulse.example", role: "Admin", status: "Active", lastLogin: "2026-05-18 09:50", department: "IT Administration", liveStatus: "available" },
  { id: "U007", name: "Neo Assistant", email: "neo@pulse.example", role: "Agent", status: "Active", lastLogin: "Never", department: "AI Operations", liveStatus: "available", isAi: true },
];

interface Feature {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  { key: "dashboard", name: "Dashboard", description: "Overview & metrics", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "customers", name: "Customer List", description: "View & manage customers", icon: <Users className="h-4 w-4" /> },
  { key: "tickets", name: "Ticket Management", description: "Support tickets", icon: <Ticket className="h-4 w-4" /> },
  { key: "billing", name: "Billing", description: "Invoices & payments", icon: <CreditCard className="h-4 w-4" /> },
  { key: "orders", name: "Orders", description: "Order management", icon: <Package className="h-4 w-4" /> },
  { key: "pipeline", name: "Pipeline", description: "Sales pipeline", icon: <Kanban className="h-4 w-4" /> },
  { key: "knowledge", name: "Knowledge Base", description: "Help articles", icon: <BookOpen className="h-4 w-4" /> },
  { key: "messenger", name: "Messenger", description: "Live chat", icon: <MessageSquare className="h-4 w-4" /> },
  { key: "calendar", name: "Task Calendar", description: "Scheduling & tasks", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "email-templates", name: "Email Templates", description: "Template management", icon: <Mail className="h-4 w-4" /> },
  { key: "surveys", name: "Surveys & CSAT", description: "Customer feedback", icon: <SmilePlus className="h-4 w-4" /> },
  { key: "demo-data", name: "Demo Data", description: "Data management & restore", icon: <Database className="h-4 w-4" /> },
  { key: "changelog", name: "Changelog", description: "Application change history", icon: <ScrollText className="h-4 w-4" /> },
  { key: "settings", name: "Settings", description: "System configuration", icon: <Settings className="h-4 w-4" /> },
  { key: "audit", name: "Audit Log", description: "Activity tracking", icon: <FileText className="h-4 w-4" /> },
  { key: "platform", name: "Platform", description: "Infrastructure management", icon: <Server className="h-4 w-4" /> },
  { key: "architecture", name: "Architecture", description: "System design", icon: <Network className="h-4 w-4" /> },
  { key: "performance", name: "Agent Performance", description: "Agent analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "approvals", name: "Approvals", description: "Review & approve", icon: <CheckSquare className="h-4 w-4" /> },
  { key: "user-management", name: "User Management", description: "Manage users & roles", icon: <UserCog className="h-4 w-4" /> },
  { key: "escalation-workflows", name: "Escalation Workflows", description: "Escalation rules", icon: <GitBranch className="h-4 w-4" /> },
  { key: "sla-policies", name: "SLA Policies", description: "SLA configuration", icon: <Timer className="h-4 w-4" /> },
  { key: "announcements", name: "Announcements", description: "Platform announcements", icon: <Megaphone className="h-4 w-4" /> },
  { key: "feedback-log", name: "Feedback Log", description: "User feedback", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "docs", name: "Documentation", description: "App documentation", icon: <BookOpen className="h-4 w-4" /> },
];

const ALL_KEYS = FEATURES.map((f) => f.key);

const DEFAULT_PERMISSIONS: Record<Role, string[]> = {
  Admin: [...ALL_KEYS],
  Supervisor: ["dashboard", "customers", "tickets", "billing", "orders", "pipeline", "knowledge", "messenger", "calendar", "email-templates", "surveys", "performance", "approvals", "user-management", "escalation-workflows", "sla-policies", "announcements", "feedback-log", "changelog"],
  Agent: ["dashboard", "customers", "tickets", "orders", "knowledge", "messenger", "calendar", "surveys", "changelog", "docs"],
};

export default function UserManagement() {
  const currentRole: Role = "Admin";
  const availableRoles: Role[] = currentRole === "Admin" ? ["Admin", "Supervisor", "Agent"] : ["Agent"];

  const [users, setUsers] = React.useState<AppUser[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null);
  const [filterRole, setFilterRole] = React.useState<string>("All Roles");
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [permissionsOpen, setPermissionsOpen] = React.useState(false);

  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formRole, setFormRole] = React.useState<Role>("Agent");
  const [formDept, setFormDept] = React.useState("");
  const [formForceReset, setFormForceReset] = React.useState(false);
  const [formAvatar, setFormAvatar] = React.useState<string | undefined>(undefined);
  const [formPassword, setFormPassword] = React.useState("");
  const [formIsAi, setFormIsAi] = React.useState(false);

  const filteredUsers = users.filter((u) => {
    if (filterRole === "AI") return u.isAi;
    return filterRole === "All Roles" || u.role === filterRole;
  });

  const roleCounts = {
    Admin: users.filter((u) => u.role === "Admin").length,
    Supervisor: users.filter((u) => u.role === "Supervisor").length,
    Agent: users.filter((u) => u.role === "Agent").length,
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Agent");
    setFormDept("");
    setFormForceReset(false);
    setFormAvatar(undefined);
    setFormPassword("");
    setFormIsAi(false);
    setDialogOpen(true);
  };

  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDept(user.department);
    setFormForceReset(user.forcePasswordReset || false);
    setFormAvatar(user.avatar);
    setFormPassword("");
    setFormIsAi(user.isAi || false);
    setDialogOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formName || !formEmail) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (!editingUser && !formIsAi && !formPassword) {
      toast({ title: "Validation Error", description: "Password is required for new users.", variant: "destructive" });
      return;
    }
    if (!formIsAi && formPassword && formPassword.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formName,
                email: formEmail,
                role: formRole,
                department: formDept,
                forcePasswordReset: formForceReset,
                avatar: formAvatar,
                isAi: formIsAi,
              }
            : u
        )
      );
      toast({ title: "User Updated", description: `${formName} has been updated.` });
    } else {
      const newId = `U${String(Date.now()).slice(-3)}`;
      const newUser: AppUser = {
        id: newId,
        name: formName,
        email: formEmail,
        role: formRole,
        status: "Active",
        lastLogin: "Never",
        department: formDept,
        avatar: formAvatar,
        liveStatus: formIsAi ? "available" : "offline",
        isAi: formIsAi,
      };
      setUsers((prev) => [...prev, newUser]);
      toast({ title: "User Created", description: `${formName} has been added as ${formRole}.` });
    }
    setDialogOpen(false);
  };

  const toggleSuspend = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus as AppUser["status"] } : u))
    );
    toast({
      title: newStatus === "Suspended" ? "User Suspended" : "User Reactivated",
      description: `${user.name} has been ${newStatus === "Suspended" ? "suspended" : "reactivated"}.`,
      variant: newStatus === "Suspended" ? "destructive" : "default",
    });
  };

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleteConfirm(null);
    toast({ title: "User Deleted", description: `${user?.name} has been removed.`, variant: "destructive" });
  };


  const getDisplayedLiveStatus = (u: AppUser): LiveStatus => u.liveStatus ?? "offline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Badge variant="outline" className="text-xs">Logged in as: {currentRole}</Badge>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["Admin", "Supervisor", "Agent"] as Role[]).map((r) => (
          <Card
            key={r}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setFilterRole(filterRole === r ? "All Roles" : r)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">{r}s</p>
                <p className="text-2xl font-bold">{roleCounts[r]}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs", roleColor[r])}>{r}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> All Users
              <Badge variant="secondary" className="text-[10px] ml-1">{filteredUsers.length} users</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setPermissionsOpen(true)}>
                <Shield className="h-3.5 w-3.5" /> Manage Permissions
              </Button>
              <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={openAddDialog}>
                <UserPlus className="h-3.5 w-3.5" /> Add User
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="w-36">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Roles">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="AI">AI Agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-10"></TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Last Login</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="py-2 w-10">
                    <div className="relative inline-block">
                      <Avatar className="h-7 w-7">
                        {u.avatar && <AvatarImage src={u.avatar} alt={u.name} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card",
                          liveStatusConfig[getDisplayedLiveStatus(u)].color
                        )}
                        title={liveStatusConfig[getDisplayedLiveStatus(u)].label}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      {u.isAi && <Bot className="h-3.5 w-3.5 text-primary" />}
                      {u.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs py-2 text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={cn("text-[10px]", roleColor[u.role])}>{u.role}</Badge>
                      {u.isAi && (
                        <Badge variant="secondary" className="text-[10px] gap-0.5">
                          <Bot className="h-2.5 w-2.5" /> AI
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2">{u.department}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant={u.status === "Active" ? "default" : "destructive"} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2 text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="Edit user"
                        onClick={() => openEditDialog(u)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-7 w-7 p-0",
                          u.status === "Active"
                            ? "text-destructive hover:text-destructive"
                            : "text-emerald-600 hover:text-emerald-600"
                        )}
                        title={u.status === "Active" ? "Suspend user" : "Reactivate user"}
                        onClick={() => toggleSuspend(u.id)}
                      >
                        {u.status === "Active" ? (
                          <ShieldAlert className="h-3 w-3" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                      </Button>
                      {deleteConfirm === u.id ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-[10px] px-2"
                          onClick={() => deleteUser(u.id)}
                        >
                          Confirm
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          title="Delete user"
                          onClick={() => setDeleteConfirm(u.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6 text-xs">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? (
                <Pencil className="h-4 w-4 text-primary" />
              ) : (
                <UserPlus className="h-4 w-4 text-primary" />
              )}
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-2 border-muted">
                  {formAvatar && <AvatarImage src={formAvatar} alt="Profile" />}
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {formName ? formName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                {formAvatar && (
                  <button
                    type="button"
                    onClick={() => setFormAvatar(undefined)}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Camera className="h-3 w-3" />
                  {formAvatar ? "Change photo" : "Upload photo"}
                </span>
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter full name" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="user@company.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <Input
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                placeholder="e.g. Customer Service"
              />
            </div>
            <div className="flex items-start gap-3 pt-1 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
              <Checkbox id="is-ai" checked={formIsAi} onCheckedChange={(v) => setFormIsAi(v === true)} />
              <div>
                <label
                  htmlFor="is-ai"
                  className="text-sm font-medium cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Bot className="h-3.5 w-3.5 text-primary" /> AI Agent
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  This user is an AI-powered agent that cannot log in but can be assigned to chats and tickets.
                </p>
              </div>
            </div>
            {!formIsAi && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Password {editingUser ? "(leave blank to keep current)" : "*"}
                </label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? "••••••••" : "Enter password"}
                  autoComplete="new-password"
                />
                {!editingUser && <p className="text-[11px] text-muted-foreground">Minimum 6 characters</p>}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="force-reset"
                checked={formForceReset}
                onCheckedChange={(v) => setFormForceReset(v === true)}
              />
              <label htmlFor="force-reset" className="text-sm cursor-pointer select-none">
                Require password reset on next login
              </label>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Editor Dialog */}
      <PermissionsEditor open={permissionsOpen} onOpenChange={setPermissionsOpen} />
    </div>
  );
}

function PermissionsEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedRole, setSelectedRole] = React.useState<Role>("Admin");
  const [permissions, setPermissions] = React.useState<Record<Role, string[]>>({
    Admin: [...DEFAULT_PERMISSIONS.Admin],
    Supervisor: [...DEFAULT_PERMISSIONS.Supervisor],
    Agent: [...DEFAULT_PERMISSIONS.Agent],
  });
  const [dragOverZone, setDragOverZone] = React.useState<"allowed" | "disallowed" | null>(null);
  const [draggingKey, setDraggingKey] = React.useState<string | null>(null);

  const allowed = FEATURES.filter((f) => permissions[selectedRole].includes(f.key));
  const disallowed = FEATURES.filter((f) => !permissions[selectedRole].includes(f.key));

  const moveFeature = React.useCallback(
    (featureKey: string, to: "allowed" | "disallowed") => {
      setPermissions((prev) => {
        const current = [...prev[selectedRole]];
        if (to === "allowed" && !current.includes(featureKey)) {
          return { ...prev, [selectedRole]: [...current, featureKey] };
        }
        if (to === "disallowed") {
          return { ...prev, [selectedRole]: current.filter((k) => k !== featureKey) };
        }
        return prev;
      });
    },
    [selectedRole]
  );

  const handleDragStart = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
    setDraggingKey(key);
  };

  const handleDragOver = (e: React.DragEvent, zone: "allowed" | "disallowed") => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverZone(zone);
  };

  const handleDrop = (e: React.DragEvent, zone: "allowed" | "disallowed") => {
    e.preventDefault();
    const key = e.dataTransfer.getData("text/plain");
    if (key) moveFeature(key, zone);
    setDragOverZone(null);
    setDraggingKey(null);
  };

  const handleDragEnd = () => {
    setDragOverZone(null);
    setDraggingKey(null);
  };

  const handleSave = () => {
    toast({ title: "Permissions Saved", description: "Permissions for all roles updated." });
    onOpenChange(false);
  };

  const FeatureCard = ({
    feature,
    zone,
  }: {
    feature: Feature;
    zone: "allowed" | "disallowed";
  }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, feature.key)}
      onDragEnd={handleDragEnd}
      onClick={() => moveFeature(feature.key, zone === "allowed" ? "disallowed" : "allowed")}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition-all select-none hover:shadow-sm",
        draggingKey === feature.key ? "opacity-40 scale-95" : "opacity-100",
        zone === "allowed"
          ? "border-success/30 bg-success/5 hover:bg-success/10"
          : "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
      <span className="text-muted-foreground shrink-0">{feature.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-tight truncate">{feature.name}</p>
        <p className="text-[10px] text-muted-foreground leading-tight truncate">
          {feature.description}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Manage Permissions
          </DialogTitle>
        </DialogHeader>

        {/* Role Tabs */}
        <div className="flex gap-1 border-b pb-2">
          {(["Admin", "Supervisor", "Agent"] as Role[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={selectedRole === r ? "default" : "ghost"}
              className="h-8 text-xs"
              onClick={() => setSelectedRole(r)}
            >
              {r}
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                {permissions[r].length}/{ALL_KEYS.length}
              </Badge>
            </Button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Drag features between columns or click to toggle. Changes apply to the{" "}
          <span className="font-semibold">{selectedRole}</span> role.
        </p>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto">
          {/* Allowed */}
          <div
            className={cn(
              "flex flex-col rounded-lg border-2 border-dashed transition-colors",
              dragOverZone === "allowed"
                ? "border-success bg-success/10"
                : "border-success/30"
            )}
            onDragOver={(e) => handleDragOver(e, "allowed")}
            onDragLeave={() => setDragOverZone(null)}
            onDrop={(e) => handleDrop(e, "allowed")}
          >
            <div className="px-3 py-2 border-b border-success/20 bg-success/5 rounded-t-lg">
              <p className="text-xs font-semibold text-success flex items-center gap-1.5">
                ✓ Allowed
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {allowed.length}
                </Badge>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {allowed.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-6">
                  Drop features here to allow
                </p>
              )}
              {allowed.map((f) => (
                <FeatureCard key={f.key} feature={f} zone="allowed" />
              ))}
            </div>
          </div>

          {/* Disallowed */}
          <div
            className={cn(
              "flex flex-col rounded-lg border-2 border-dashed transition-colors",
              dragOverZone === "disallowed"
                ? "border-destructive bg-destructive/10"
                : "border-destructive/30"
            )}
            onDragOver={(e) => handleDragOver(e, "disallowed")}
            onDragLeave={() => setDragOverZone(null)}
            onDrop={(e) => handleDrop(e, "disallowed")}
          >
            <div className="px-3 py-2 border-b border-destructive/20 bg-destructive/5 rounded-t-lg">
              <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                ✗ Disallowed
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {disallowed.length}
                </Badge>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {disallowed.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-6">
                  Drop features here to disallow
                </p>
              )}
              {disallowed.map((f) => (
                <FeatureCard key={f.key} feature={f} zone="disallowed" />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
