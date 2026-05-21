import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "center" (default) centers the modal vertically. "top" anchors it near the top of the viewport so it appears just below the trigger button. Ignored when {@link anchorRef} is provided. */
  align?: "center" | "top";
  /**
   * When provided, the dialog anchors directly under the referenced element
   * (popover-style) instead of being centered. Useful for "open just below the
   * trigger button" UX. Falls back to {@link align} when ref is empty.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Horizontal anchor alignment relative to the anchor element. Defaults to "end" (right edges align). */
  anchorSide?: "start" | "center" | "end";
  /** Pixels of gap between the anchor element and the dialog. Defaults to 8. */
  anchorOffset?: number;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  align = "center",
  anchorRef,
  anchorSide = "end",
  anchorOffset = 8,
  children,
}: DialogProps) {
  const [anchorPos, setAnchorPos] = React.useState<{ top: number; left: number; right: number } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  // Track anchor element position so the dialog stays glued to the button on resize/scroll.
  // useLayoutEffect runs before paint, so the initial position is set without a flash through center.
  // Also: when the user scrolls past the trigger button, the modal sticks to a minimum top
  // (16px from the viewport top) so the entire modal stays visible instead of scrolling off-screen.
  React.useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      setAnchorPos(null);
      return;
    }
    const MIN_TOP = 6;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const naturalTop = r.bottom + anchorOffset;
      const stickyTop = Math.max(MIN_TOP, naturalTop);
      setAnchorPos({ top: stickyTop, left: r.left, right: window.innerWidth - r.right });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, anchorOffset]);

  if (!open) return null;

  const useAnchor = !!anchorPos;
  // Reserve a small breathing buffer at the bottom of the viewport so the modal
  // doesn't kiss the bottom edge when content overflows.
  const anchorMaxHeight =
    useAnchor && anchorPos ? `calc(100vh - ${anchorPos.top + 24}px)` : undefined;

  const childWithClose = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === DialogContent) {
      const existingStyle = (child.props as DialogContentProps).style ?? {};
      return React.cloneElement(child as React.ReactElement<DialogContentProps>, {
        onClose: () => onOpenChange(false),
        // When anchored, force the DialogContent's max-height down to fit
        // available viewport space so its internal overflow-y-auto kicks in
        // and Back/Next stay reachable. Inline style overrides max-h-[90vh].
        style: useAnchor ? { ...existingStyle, maxHeight: anchorMaxHeight } : existingStyle,
      });
    }
    return child;
  });

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        !useAnchor && "flex justify-center p-4",
        !useAnchor && (align === "top" ? "items-start pt-16" : "items-center")
      )}
    >
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {useAnchor && anchorPos ? (
        <div
          className="absolute z-10 animate-scale-in"
          style={{
            ...(anchorSide === "end"
              ? { right: Math.max(8, anchorPos.right) }
              : anchorSide === "start"
              ? { left: anchorPos.left }
              : { left: "50%", transform: "translateX(-50%)" }),
            top: anchorPos.top,
            width: "min(56rem, calc(100vw - 1rem))",
          }}
        >
          {childWithClose}
        </div>
      ) : (
        <div className="relative z-10 w-full animate-scale-in flex justify-center">{childWithClose}</div>
      )}
    </div>
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  onClose?: () => void;
}

export function DialogContent({
  className,
  children,
  showClose = true,
  onClose,
  ...props
}: DialogContentProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "relative w-full max-w-lg rounded-lg border border-border bg-card text-card-foreground shadow-lg p-6 max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className
      )}
      {...props}
    />
  );
}