import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Side = "bottom" | "top" | "left" | "right";
type Align = "start" | "center" | "end";

interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: Side;
  align?: Align;
  width?: number;
  className?: string;
}

function computePosition(
  rect: DOMRect,
  side: Side,
  align: Align,
  width: number,
  height: number
): { top: number; left: number } {
  const gap = 8;
  let top = 0;
  let left = 0;

  if (side === "bottom") {
    top = rect.bottom + gap;
  } else if (side === "top") {
    top = rect.top - height - gap;
  } else if (side === "left") {
    left = rect.left - width - gap;
  } else if (side === "right") {
    left = rect.right + gap;
  }

  if (side === "bottom" || side === "top") {
    if (align === "start") left = rect.left;
    else if (align === "end") left = rect.right - width;
    else left = rect.left + rect.width / 2 - width / 2;
  } else {
    if (align === "start") top = rect.top;
    else if (align === "end") top = rect.bottom - height;
    else top = rect.top + rect.height / 2 - height / 2;
  }

  // Clamp into viewport with a small margin
  const margin = 8;
  const maxLeft = window.innerWidth - width - margin;
  const maxTop = window.innerHeight - height - margin;
  if (left < margin) left = margin;
  if (top < margin) top = margin;
  if (left > maxLeft) left = Math.max(margin, maxLeft);
  if (top > maxTop) top = Math.max(margin, maxTop);

  return { top, left };
}

export function Popover({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  trigger,
  children,
  side = "bottom",
  align = "start",
  width,
  className,
}: PopoverProps) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const open = isControlled ? controlled : internal;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternal(v);
    onOpenChange?.(v);
  };

  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const measure = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current?.getBoundingClientRect();
      const w = width ?? contentRect?.width ?? 320;
      const h = contentRect?.height ?? 240;
      setPos(computePosition(triggerRect, side, align, w, h));
    };
    measure();
    // Re-measure after content mounts (height not known until first paint)
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, side, align, width]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (contentRef.current && contentRef.current.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onClick={(e) => {
          if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
            setOpen(!open);
          }
        }}
      >
        {trigger}
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef}
            role="dialog"
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              width,
              visibility: pos ? "visible" : "hidden",
            }}
            className={cn(
              "fixed z-[60] rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-scale-in",
              !width && "w-80",
              className
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
