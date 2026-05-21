import { Sun, Moon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button/button";
import { useDarkMode } from "@/lib/theme";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  /**
   * `icon` — square icon-only button (header). Shows the *next state* icon:
   *   Sun when dark (click → light), Moon when light (click → dark).
   * `labeled` — icon + text label (Settings page). Shows the *current state*:
   *   Moon + "Dark" when dark, Sun + "Light" when light. Mirrors project-files.
   */
  variant?: "icon" | "labeled";
  size?: ButtonProps["size"];
  className?: string;
}

export function ThemeToggle({ variant = "icon", size, className }: ThemeToggleProps) {
  const [dark, , toggle] = useDarkMode();

  if (variant === "icon") {
    const ActionIcon = dark ? Sun : Moon;
    return (
      <Button
        variant="ghost"
        size={size ?? "icon-sm"}
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className={className}
      >
        <ActionIcon className="h-4 w-4" />
      </Button>
    );
  }

  const StateIcon = dark ? Moon : Sun;
  return (
    <Button
      variant={dark ? "default" : "outline"}
      size={size ?? "sm"}
      onClick={toggle}
      className={cn("gap-1.5", className)}
    >
      <StateIcon className="h-3.5 w-3.5" />
      {dark ? "Dark" : "Light"}
    </Button>
  );
}
