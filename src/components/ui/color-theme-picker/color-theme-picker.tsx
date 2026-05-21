import { Check } from "lucide-react";
import { useColorTheme, colorThemes, type ColorTheme } from "@/lib/theme";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";

export interface ColorSwatch {
  id: string;
  name: string;
  /** Any CSS colour string — used for the swatch dot. */
  color: string;
  description?: string;
}

interface ColorThemePickerProps {
  /** Override the built-in `colorThemes` set. */
  themes?: ColorSwatch[];
  /** Controlled active id. Falls back to the shared `useColorTheme()` hook when omitted. */
  value?: string;
  /** Called when a swatch is picked. Overrides the default theme-swap behaviour. */
  onChange?: (id: string) => void;
  columns?: number;
  /** Hide the small `name`/`description` text under each swatch. */
  compact?: boolean;
  /** Suppress the "Theme applied" toast emitted by the default handler. */
  silent?: boolean;
  className?: string;
}

export function ColorThemePicker({
  themes = colorThemes,
  value,
  onChange,
  columns = 5,
  compact = false,
  silent = false,
  className,
}: ColorThemePickerProps) {
  // Only subscribe to the theme hook when in default (uncontrolled, theme-swap) mode.
  const usingThemeHook = value === undefined && onChange === undefined;
  const [hookActive, setHookActive] = useColorTheme();
  const active = value ?? (usingThemeHook ? hookActive : undefined);

  const handleSelect = (swatch: ColorSwatch) => {
    if (onChange) {
      onChange(swatch.id);
      return;
    }
    if (usingThemeHook) {
      setHookActive(swatch.id as ColorTheme);
      if (!silent) toast({ title: "Theme applied", description: `Switched to ${swatch.name}.` });
    }
  };

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {themes.map((t) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelect(t)}
            aria-pressed={selected}
            className={cn(
              "relative rounded-lg border-2 p-3 text-left transition-all hover:scale-105",
              selected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-muted-foreground/40"
            )}
          >
            {selected && (
              <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn("rounded-full border", compact ? "h-5 w-5" : "h-6 w-6 mb-2")}
              style={{ backgroundColor: t.color }}
            />
            {!compact && (
              <>
                <p className="text-xs font-medium leading-tight">{t.name}</p>
                {t.description && (
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.description}</p>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { ColorTheme };
