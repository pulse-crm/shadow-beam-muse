import { Search, PanelLeft, Play } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { NotificationsCentre } from "@/components/NotificationsCentre";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NeoQuickChat } from "@/components/NeoQuickChat";
import { useSidebar } from "./sidebar-context";
import { useDemoMode } from "@/components/demo-mode/demo-context";

export function AppHeader() {
  const { toggle } = useSidebar();
  const { setLauncherOpen } = useDemoMode();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 gap-2 sm:gap-4 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar (⌘B)"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="relative w-72 hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search… (⌘K)"
            className="pl-8 h-9 text-sm bg-secondary border-0 cursor-pointer"
            readOnly
            onClick={() =>
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <NeoQuickChat />

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={() => setLauncherOpen(true)}
          title="Launch guided walkthrough"
        >
          <Play className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Demo</span>
        </Button>

        <ThemeToggle variant="icon" />

        <NotificationsCentre />

        <Badge variant="outline" className="hidden sm:inline-flex text-xs h-8 px-2.5">
          Supervisor
        </Badge>

        <UserMenu />
      </div>
    </header>
  );
}
