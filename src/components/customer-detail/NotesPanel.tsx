import * as React from "react";
import { FileText, Plus, Pin, Trash2, X } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Button } from "@/components/ui/button/button";
import { Textarea } from "@/components/ui/textarea/textarea";
import { toast } from "@/components/ui/toast/toaster";
import type { Note } from "@/data/mock";

export function NotesPanel({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = React.useState<Note[]>(initial);
  const [draft, setDraft] = React.useState("");
  const [composing, setComposing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setNotes(initial);
    setDraft("");
    setComposing(false);
  }, [initial]);

  React.useEffect(() => {
    if (composing) textareaRef.current?.focus();
  }, [composing]);

  const addNote = () => {
    if (!draft.trim()) return;
    const next: Note = {
      id: `N-${Date.now()}`,
      customerId: initial[0]?.customerId ?? "",
      author: "Nihala Nazar",
      body: draft.trim(),
      when: new Date().toISOString().slice(0, 10),
    };
    setNotes([next, ...notes]);
    setDraft("");
    setComposing(false);
    toast({ title: "Note added", variant: "success" });
  };

  const togglePin = (id: string) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const remove = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const sorted = [...notes].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  return (
    <CollapsiblePanel
      title="Internal Notes"
      icon={FileText}
      count={notes.length}
      defaultOpen={false}
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setComposing((v) => !v)}
          aria-label={composing ? "Close composer" : "Add note"}
          title={composing ? "Close composer" : "Add note"}
        >
          {composing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      }
    >
      <div className="p-3 space-y-3">
        {composing && (
          <div className="rounded-md border border-border bg-muted/30 p-2 space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder="Add an internal note…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="bg-background"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft("");
                  setComposing(false);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={addNote} disabled={!draft.trim()}>
                <Plus className="h-3.5 w-3.5" /> Save Note
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No notes yet.</p>
          )}
          {sorted.map((n) => (
            <div
              key={n.id}
              className={`rounded-md border p-3 text-sm ${n.pinned ? "border-warning/40 bg-warning/5" : "border-border"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs font-medium">{n.author}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{n.when}</span>
                  <button
                    onClick={() => togglePin(n.id)}
                    className="p-0.5 text-muted-foreground hover:text-warning transition-colors"
                    aria-label={n.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className={`h-3.5 w-3.5 ${n.pinned ? "fill-warning text-warning" : ""}`} />
                  </button>
                  <button
                    onClick={() => remove(n.id)}
                    className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p>{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </CollapsiblePanel>
  );
}
