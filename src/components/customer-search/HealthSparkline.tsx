interface HealthSparklineProps {
  score: number; // 0-1000
  id: string;
}

// Deterministic pseudo-history so the same id always renders the same line
function pseudoHistory(id: string, score: number, points = 12): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) & 0xffffffff;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  const arr: number[] = [];
  let v = Math.max(0, Math.min(1000, score - 40 + rand() * 80));
  for (let i = 0; i < points; i++) {
    v += (rand() - 0.5) * 60;
    v = Math.max(0, Math.min(1000, v));
    arr.push(v);
  }
  arr[arr.length - 1] = score;
  return arr;
}

export function HealthSparkline({ score, id }: HealthSparklineProps) {
  const data = pseudoHistory(id, score);
  const width = 72;
  const height = 22;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const stepX = width / Math.max(1, data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color =
    score >= 800 ? "hsl(142 72% 40%)" : score >= 600 ? "hsl(38 92% 50%)" : "hsl(0 72% 51%)";

  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
