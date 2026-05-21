import * as React from "react";

export interface CustomerTag {
  id: string;
  label: string;
  color: string;
}

const TAGS_KEY = "pulse-customer-tags";
const ASSIGN_KEY = "pulse-customer-tag-assignments";
const EVT = "pulse-customer-tags-updated";

const defaultTags: CustomerTag[] = [
  { id: "vip", label: "VIP", color: "hsl(280 70% 50%)" },
  { id: "at-risk", label: "At Risk", color: "hsl(0 72% 51%)" },
  { id: "expanding", label: "Expanding", color: "hsl(142 72% 40%)" },
  { id: "needs-review", label: "Needs Review", color: "hsl(38 92% 50%)" },
];

const defaultAssignments: Record<string, string[]> = {
  C001: ["vip"],
  C002: ["vip", "expanding"],
  C004: ["at-risk", "needs-review"],
  C005: ["needs-review"],
  C006: ["vip"],
  C009: ["at-risk"],
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useCustomerTags() {
  const [tags, setTags] = React.useState<CustomerTag[]>(() =>
    load(TAGS_KEY, defaultTags)
  );
  const [assignments, setAssignments] = React.useState<Record<string, string[]>>(
    () => load(ASSIGN_KEY, defaultAssignments)
  );

  React.useEffect(() => {
    const onUpdate = () => {
      setTags(load(TAGS_KEY, defaultTags));
      setAssignments(load(ASSIGN_KEY, defaultAssignments));
    };
    window.addEventListener(EVT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const getTagsForCustomer = React.useCallback(
    (customerId: string): CustomerTag[] => {
      const ids = assignments[customerId] ?? [];
      return ids.map((id) => tags.find((t) => t.id === id)).filter((t): t is CustomerTag => Boolean(t));
    },
    [tags, assignments]
  );

  const addTag = React.useCallback(
    (tag: CustomerTag) => {
      const next = [...tags.filter((t) => t.id !== tag.id), tag];
      setTags(next);
      save(TAGS_KEY, next);
    },
    [tags]
  );

  const assignTag = React.useCallback(
    (customerId: string, tagId: string) => {
      const current = assignments[customerId] ?? [];
      if (current.includes(tagId)) return;
      const next = { ...assignments, [customerId]: [...current, tagId] };
      setAssignments(next);
      save(ASSIGN_KEY, next);
    },
    [assignments]
  );

  const unassignTag = React.useCallback(
    (customerId: string, tagId: string) => {
      const current = assignments[customerId] ?? [];
      if (!current.includes(tagId)) return;
      const next = { ...assignments, [customerId]: current.filter((t) => t !== tagId) };
      setAssignments(next);
      save(ASSIGN_KEY, next);
    },
    [assignments]
  );

  const bulkAssignTag = React.useCallback(
    (customerIds: string[], tagId: string) => {
      const next = { ...assignments };
      for (const id of customerIds) {
        const current = next[id] ?? [];
        if (!current.includes(tagId)) next[id] = [...current, tagId];
      }
      setAssignments(next);
      save(ASSIGN_KEY, next);
    },
    [assignments]
  );

  return { tags, getTagsForCustomer, addTag, assignTag, unassignTag, bulkAssignTag };
}
