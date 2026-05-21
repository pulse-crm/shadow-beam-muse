import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Badge } from "@/components/ui/badge/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { Field } from "@/components/ui/field/field";
import { toast } from "@/components/ui/toast/toaster";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorThemePicker } from "@/components/ui/color-theme-picker/color-theme-picker";
import { Palette, Check, Camera, User as UserIcon } from "lucide-react";

type Role = "Admin" | "Supervisor" | "Agent" | "Software Developer";

const roleTone: Record<Role, string> = {
  Admin: "bg-primary/15 text-primary border-primary/30",
  Supervisor: "bg-warning/15 text-warning border-warning/30",
  Agent: "bg-muted text-muted-foreground border-muted-foreground/30",
  "Software Developer": "bg-info/15 text-info border-info/30",
};

export default function SettingsPage() {
  const [name, setName] = React.useState("Nihala Nazar");
  const [email, setEmail] = React.useState("nihala.nazar@timegroup.com");
  const [avatar, setAvatar] = React.useState<string | undefined>(undefined);
  const role: Role = "Software Developer";

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      toast({ title: "Avatar updated" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-stack">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <Badge variant="outline" className="text-xs">
          Logged in as: {role}
        </Badge>
      </div>

      {/* My Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-5">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div className="flex-1 form-stack">
              <Field label="Full Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled className="h-9 bg-muted/50" />
              </Field>
              <Field label="Email Address">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
              </Field>
              <Field label="Role">
                <Badge variant="outline" className={`text-[10px] ${roleTone[role]}`}>
                  {role}
                </Badge>
              </Field>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => toast({ title: "Profile saved", description: "Your details have been updated.", variant: "success" })}
              >
                <Check className="h-3 w-3" /> Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Dark Mode</p>
              <p className="text-[10px] text-muted-foreground">
                Toggle between light and dark interface
              </p>
            </div>
            <ThemeToggle variant="labeled" />
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Colour Theme</p>
            <ColorThemePicker columns={5} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
