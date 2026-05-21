import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box/icon-box";
import { cn } from "@/lib/cn";

export type StatCardSize = "sm" | "md" | "lg";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconTone?: IconBoxTone;
  /** "sm" -> inline tiny icon next to label, "lg" -> big avatar-style icon on the right */
  size?: StatCardSize;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  iconTone = "primary",
  size = "sm",
  onClick,
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const isClickable = !!onClick;
  return (
    <Card
      onClick={onClick}
      className={cn(isClickable && "cursor-pointer hover:shadow-md transition-shadow", className)}
    >
      <CardContent className="p-5">
        {size === "lg" ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <IconBox icon={Icon} tone={iconTone} size="md" shape="rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <IconBox icon={Icon} tone={iconTone} size="xs" shape="square" />
            </div>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </>
        )}

        {(delta !== undefined || deltaLabel) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              delta !== undefined
                ? positive
                  ? "text-success"
                  : "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {delta !== undefined &&
              (positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              ))}
            {deltaLabel ?? (delta !== undefined ? `${Math.abs(delta)}% vs last month` : null)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
