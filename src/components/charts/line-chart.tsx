import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
  showValues?: boolean;
  formatValue?: (v: number) => string;
}

export function LineChart({
  data,
  height = 200,
  className,
  color = "hsl(215, 90%, 52%)",
  showValues = true,
  formatValue,
}: LineChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ReLineChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        {showValues && (
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={formatValue ? (v: number) => formatValue(v) : undefined}
          />
        )}
        <Tooltip formatter={formatValue ? (v: number) => formatValue(v) : undefined} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
