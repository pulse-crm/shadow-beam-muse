const KEY = "pulse-recent-customers";
const MAX = 6;

export function getRecentCustomerIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentCustomerId(id: string) {
  try {
    const current = getRecentCustomerIds().filter((x) => x !== id);
    const next = [id, ...current].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("pulse-recent-customers-updated"));
  } catch {
    /* storage may be unavailable */
  }
}
