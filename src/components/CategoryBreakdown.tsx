import clsx from "clsx";

const COLORS: Record<string, { bg: string; bar: string; label: string }> = {
  frontend: { bg: "bg-blue/20", bar: "bg-blue", label: "Frontend \u524d\u7aef" },
  backend: { bg: "bg-green/20", bar: "bg-green", label: "Backend \u540e\u7aef" },
  general: { bg: "bg-pink/20", bar: "bg-pink", label: "General \u901a\u7528" },
};

interface Props {
  breakdown: Record<string, number>;
}

export default function CategoryBreakdown({ breakdown }: Props) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-3">
      {Object.entries(COLORS).map(([key, { bg, bar, label }]) => {
        const count = breakdown[key] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{label}</span>
              <span className="text-text-dim">
                {count} ({Math.round(pct)}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
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
