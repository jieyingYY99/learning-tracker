import clsx from "clsx";

const COLORS: Record<string, { bg: string; bar: string; label: string }> = {
  frontend: { bg: "bg-blue/10", bar: "bg-blue", label: "Frontend" },
  backend: { bg: "bg-green/10", bar: "bg-green", label: "Backend" },
  general: { bg: "bg-pink/10", bar: "bg-pink", label: "General" },
};

interface Props {
  breakdown: Record<string, number>;
}

export default function CategoryBreakdown({ breakdown }: Props) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-4">
      {Object.entries(COLORS).map(([key, { bar, label }]) => {
        const count = breakdown[key] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="text-text-dim text-xs">
                {count} ({Math.round(pct)}%)
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface2">
              <div
                className={clsx("h-full rounded-full transition-all", bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
