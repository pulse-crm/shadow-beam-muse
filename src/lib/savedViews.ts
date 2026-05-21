import * as React from "react";

export interface SavedView<F = Record<string, string>> {
  id: string;
  name: string;
  filters: F;
}

const KEY = "pulse-tickets-saved-views";

function read<F>(): SavedView<F>[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write<F>(views: SavedView<F>[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(views));
  } catch {
    /* storage may be unavailable */
  }
}

export function useSavedViews<F extends Record<string, string>>() {
  const [views, setViews] = React.useState<SavedView<F>[]>(() => read<F>());

  const saveView = React.useCallback((name: string, filters: F) => {
    const next: SavedView<F> = { id: `V-${Date.now()}`, name, filters };
    setViews((prev) => {
      const updated = [next, ...prev];
      write(updated);
      return updated;
    });
  }, []);

  const deleteView = React.useCallback((id: string) => {
    setViews((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      write(updated);
      return updated;
    });
  }, []);

  return { views, saveView, deleteView };
}
