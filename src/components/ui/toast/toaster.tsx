import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastVariant = "default" | "success" | "destructive" | "info";

export interface ToastOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "id" | "variant" | "duration">> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

type Subscriber = (toasts: ToastItem[]) => void;

const listeners = new Set<Subscriber>();
let state: ToastItem[] = [];

function emit() {
  for (const l of listeners) l(state);
}

let counter = 0;

export function toast(opts: ToastOptions) {
  const id = opts.id ?? `t${++counter}`;
  const item: ToastItem = {
    id,
    title: opts.title,
    description: opts.description,
    variant: opts.variant ?? "default",
    duration: opts.duration ?? 4000,
  };
  state = [...state, item];
  emit();
  if (item.duration > 0) {
    window.setTimeout(() => dismiss(id), item.duration);
  }
  return id;
}

export function dismiss(id: string) {
  state = state.filter((t) => t.id !== id);
  emit();
}

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-card border-border text-foreground",
  success: "bg-card border-success/40 text-foreground",
  destructive: "bg-card border-destructive/40 text-foreground",
  info: "bg-card border-info/40 text-foreground",
};

const variantIcon: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />,
  destructive: <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />,
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(state);
  React.useEffect(() => {
    const sub: Subscriber = (t) => setToasts(t);
    listeners.add(sub);
    return () => {
      listeners.delete(sub);
    };
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border shadow-lg p-4 animate-scale-in flex items-start gap-3",
            variantStyles[t.variant]
          )}
        >
          {variantIcon[t.variant]}
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && (
              <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
