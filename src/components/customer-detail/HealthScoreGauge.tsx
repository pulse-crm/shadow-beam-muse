import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface HealthScoreGaugeProps {
  /** 0–100 score. */
  score: number;
  size?: number;
  className?: string;
}

function tone(score: number): {
  ring: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
} {
  if (score >= 80) {
    return { ring: "stroke-success", text: "text-success", icon: CheckCircle2, label: "Healthy" };
  }
  if (score >= 60) {
    return { ring: "stroke-warning", text: "text-warning", icon: AlertTriangle, label: "At Risk" };
  }
  return { ring: "stroke-destructive", text: "text-destructive", icon: XCircle, label: "Critical" };
}

export function HealthScoreGauge({ score, size = 64, className }: HealthScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const { ring, text, icon: Icon, label } = tone(score);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Health</span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-muted fill-none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("fill-none transition-[stroke-dashoffset] duration-500", ring)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-lg font-bold", text)}>{clamped}</span>
        </div>
      </div>
      <div className={cn("flex items-center gap-1 text-[10px] font-medium", text)}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
    </div>
  );
}
