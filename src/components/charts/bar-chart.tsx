import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 220,
  className,
  color = "hsl(215, 90%, 52%)",
  formatValue,
}: BarChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ReBarChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={formatValue ? (v: number) => formatValue(v) : undefined}
        />
        <Tooltip formatter={formatValue ? (v: number) => formatValue(v) : undefined} />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
