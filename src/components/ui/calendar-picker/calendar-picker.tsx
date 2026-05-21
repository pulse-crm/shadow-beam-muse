import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  className?: string;
}

function isoOf(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function CalendarPicker({ value, onChange, className }: CalendarPickerProps) {
  const initial = value ? new Date(value) : new Date();
  const [view, setView] = React.useState<Date>(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const todayIso = isoOf(new Date());

  const firstWeekday = (view.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ date: new Date(view.getFullYear(), view.getMonth(), 1 - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(view.getFullYear(), view.getMonth(), d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return (
    <div className={cn("p-3 w-72", className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          className="h-7 w-7 rounded-md hover:bg-accent flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium">
          {view.toLocaleString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          className="h-7 w-7 rounded-md hover:bg-accent flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {cells.map(({ date: d, inMonth }, i) => {
          const iso = isoOf(d);
          const selected = iso === value;
          const isToday = iso === todayIso;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(iso)}
              className={cn(
                "h-8 w-8 rounded-md text-xs flex items-center justify-center transition-colors mx-auto",
                inMonth ? "hover:bg-accent" : "text-muted-foreground/40",
                selected && "bg-primary text-primary-foreground hover:bg-primary",
                !selected && isToday && "ring-1 ring-primary"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
