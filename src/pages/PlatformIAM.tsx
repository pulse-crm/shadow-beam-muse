import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  Key,
  Shield,
  Timer,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { toast } from "@/components/ui/toast/toaster";

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Ops" | "Finance" | "Read-only";
  type: "user" | "service";
  lastActive: string;
  status: "active" | "inactive";
}

const mockUsers: UserRole[] = [
  { id: "1", name: "Sarah Chen", email: "s.chen@enterprise.com", role: "Admin", type: "user", lastActive: "2 min ago", status: "active" },
  { id: "2", name: "Marcus Johnson", email: "m.johnson@enterprise.com", role: "Ops", type: "user", lastActive: "15 min ago", status: "active" },
  { id: "3", name: "Billing Service", email: "billing-svc@internal", role: "Finance", type: "service", lastActive: "Just now", status: "active" },
  { id: "4", name: "David Park", email: "d.park@enterprise.com", role: "Ops", type: "user", lastActive: "1 hour ago", status: "active" },
  { id: "5", name: "Audit Service", email: "audit-svc@internal", role: "Read-only", type: "service", lastActive: "Just now", status: "active" },
  { id: "6", name: "Emma Wilson", email: "e.wilson@enterprise.com", role: "Finance", type: "user", lastActive: "3 days ago", status: "inactive" },
];

const roleColors: Record<UserRole["role"], string> = {
  Admin: "bg-primary/10 text-primary border-primary/20",
  Ops: "bg-info/10 text-info border-info/20",
  Finance: "bg-success/10 text-success border-success/20",
  "Read-only": "bg-muted text-muted-foreground border-border",
};

interface Role {
  name: string;
  description: string;
  scopes: string[];
  userCount: number;
}

const roles: Role[] = [
  { name: "Admin", description: "Full platform access including IAM and configuration", scopes: ["platform.admin", "iam.manage", "audit.read", "config.write", "all.domains"], userCount: 2 },
  { name: "Ops", description: "Operational access to all domain functions", scopes: ["subscribers.manage", "billing.manage", "faults.manage", "provisioning.manage"], userCount: 8 },
  { name: "Finance", description: "Billing and revenue-related functions", scopes: ["billing.read", "billing.write", "analytics.read", "audit.read"], userCount: 4 },
  { name: "Read-only", description: "View-only access for auditors and observers", scopes: ["*.read"], userCount: 6 },
];

const ssoProviders = [
  { name: "Azure AD", status: "connected", type: "SAML 2.0" },
  { name: "Okta", status: "connected", type: "OIDC" },
];

const sessionInfo = {
  tokenExpiry: "8 hours",
  refreshWindow: "15 minutes",
  mfaEnforced: true,
  idleTimeout: "30 minutes",
};

function UserRolesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Users &amp; Service Accounts</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {mockUsers.filter((u) => u.type === "user").length} users
            <span className="text-border">•</span>
            <Shield className="h-3.5 w-3.5" />
            {mockUsers.filter((u) => u.type === "service").length} services
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Identity</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Last Active</TableHead>
              <TableHead className="text-xs w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      {user.type === "user" ? (
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Shield className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${roleColors[user.role]}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user.type === "service" ? "Service Account" : "User"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.status === "active" ? "bg-success" : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      toast({ title: user.name, description: `Viewing ${user.role} identity.` })
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RolePermissions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Roles &amp; Permissions</CardTitle>
          <Badge variant="outline" className="text-xs">
            {roles.length} roles defined
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{role.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{role.userCount} assigned</span>
            </div>
            <p className="text-xs text-muted-foreground">{role.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {role.scopes.map((scope) => (
                <Badge key={scope} variant="outline" className="text-[10px] h-5 bg-background">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span>Role-based access control enforced at API layer</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthenticationPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Authentication &amp; SSO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Identity Providers</p>
          <div className="space-y-2">
            {ssoProviders.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{provider.name}</span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {provider.type}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 bg-success/10 text-success border-success/20"
                >
                  <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                  Connected
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Session &amp; Security</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Key className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Token Expiry</span>
              </div>
              <p className="text-sm font-medium mt-0.5">{sessionInfo.tokenExpiry}</p>
            </div>
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Timer className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Idle Timeout</span>
              </div>
              <p className="text-sm font-medium mt-0.5">{sessionInfo.idleTimeout}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-success/20 bg-success/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">MFA Enforcement</span>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Enabled
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground pt-2">
          Authentication is delegated to enterprise identity providers. Local credentials are not
          stored.
        </p>
      </CardContent>
    </Card>
  );
}

export default function PlatformIAM() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <Button variant="ghost" size="sm" className="gap-2 self-start" onClick={() => navigate("/platform")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Platform
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Identity &amp; Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, service accounts, and role-based access controls
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Role-based access control with separation of duties.
          </span>{" "}
          All access is audited and permissions are enforced at the API layer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserRolesTable />
        </div>
        <div className="space-y-6">
          <RolePermissions />
          <AuthenticationPanel />
        </div>
      </div>
    </div>
  );
}
