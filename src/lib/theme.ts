import * as React from "react";

const STORAGE_KEY = "app-dark-mode";
const CHANGE_EVENT = "pulse-dark-mode-changed";

const COLOR_THEME_KEY = "app-theme";
const COLOR_THEME_EVENT = "pulse-color-theme-changed";

export type ColorTheme = "default" | "ocean" | "forest" | "sunset" | "slate";

export const colorThemes: { id: ColorTheme; name: string; color: string; description: string }[] = [
  { id: "default", name: "Default Blue", color: "hsl(215 90% 52%)", description: "Clean corporate blue" },
  { id: "ocean", name: "Ocean Teal", color: "hsl(192 80% 42%)", description: "Calm teal waters" },
  { id: "forest", name: "Forest Green", color: "hsl(152 60% 38%)", description: "Natural green tones" },
  { id: "sunset", name: "Sunset Orange", color: "hsl(16 80% 52%)", description: "Warm sunset hues" },
  { id: "slate", name: "Slate Indigo", color: "hsl(226 60% 48%)", description: "Deep slate blue" },
];

function readInitialTheme(): ColorTheme {
  if (typeof document === "undefined") return "default";
  try {
    const stored = (localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null) ?? "default";
    return stored;
  } catch {
    return "default";
  }
}

function applyColorTheme(value: ColorTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-ocean", "theme-forest", "theme-sunset", "theme-slate");
  if (value !== "default") root.classList.add(`theme-${value}`);
  try {
    localStorage.setItem(COLOR_THEME_KEY, value);
  } catch {
    /* storage may be unavailable */
  }
  window.dispatchEvent(new CustomEvent<ColorTheme>(COLOR_THEME_EVENT, { detail: value }));
}

export function useColorTheme(): [ColorTheme, (value: ColorTheme) => void] {
  const [theme, setThemeInternal] = React.useState<ColorTheme>(readInitialTheme);

  React.useEffect(() => {
    const onChange = (e: Event) => {
      setThemeInternal((e as CustomEvent<ColorTheme>).detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === COLOR_THEME_KEY) setThemeInternal((e.newValue as ColorTheme) ?? "default");
    };
    window.addEventListener(COLOR_THEME_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(COLOR_THEME_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = React.useCallback((value: ColorTheme) => applyColorTheme(value), []);

  return [theme, setTheme];
}

function readInitial(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.classList.contains("dark")) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function applyDarkMode(value: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", value);
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* storage may be unavailable */
  }
  window.dispatchEvent(new CustomEvent<boolean>(CHANGE_EVENT, { detail: value }));
}

/**
 * Shared dark-mode hook. Multiple consumers (e.g. header toggle and Settings
 * page) stay in sync because every setter dispatches a window event and every
 * mounted instance subscribes to it.
 */
export function useDarkMode(): [boolean, (value: boolean) => void, () => void] {
  const [dark, setDarkInternal] = React.useState<boolean>(readInitial);

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const value = (e as CustomEvent<boolean>).detail;
      setDarkInternal(value);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDarkInternal(e.newValue === "true");
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setDark = React.useCallback((value: boolean) => {
    applyDarkMode(value);
  }, []);

  const toggle = React.useCallback(() => {
    applyDarkMode(!readInitial());
  }, []);

  return [dark, setDark, toggle];
}
