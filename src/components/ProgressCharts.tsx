"use client";

import { Brain, Trophy, BarChart3, Calendar } from "lucide-react";

interface Props {
  reviewsPerWeek: { week: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  masteryDistribution: { level: string; count: number }[];
  totalConcepts: number;
  mastered: number;
  totalReviews: number;
  totalWeeks: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "var(--color-blue)",
  backend: "var(--color-accent)",
  general: "var(--color-orange)",
};

const CATEGORY_TW: Record<string, string> = {
  frontend: "bg-blue",
  backend: "bg-accent",
  general: "bg-orange",
};

const MASTERY_COLORS: Record<string, string> = {
  seen: "var(--color-orange)",
  understand: "var(--color-blue)",
  can_use: "var(--color-accent)",
};

const MASTERY_LABELS: Record<string, string> = {
  seen: "Seen",
  understand: "Understand",
  can_use: "Can Use",
};

export default function ProgressCharts({
  reviewsPerWeek,
  categoryDistribution,
  masteryDistribution,
  totalConcepts,
  mastered,
  totalReviews,
  totalWeeks,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Brain size={18} />}
          label="Total Concepts"
          value={totalConcepts}
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="Mastered"
          value={mastered}
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Total Reviews"
          value={totalReviews}
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Active Weeks"
          value={totalWeeks}
        />
      </div>

      {/* Bar chart: reviews per week */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-md">
        <h2 className="mb-5 text-base font-semibold">Reviews Per Week</h2>
        {reviewsPerWeek.length === 0 ? (
          <p className="text-sm text-text-dim">No review data yet.</p>
        ) : (
          <ReviewsBarChart data={reviewsPerWeek} />
        )}
      </section>

      {/* Row: category + mastery */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Horizontal stacked bar: category breakdown */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-md">
          <h2 className="mb-5 text-base font-semibold">Category Breakdown</h2>
          <CategoryBar data={categoryDistribution} total={totalConcepts} />
        </section>

        {/* Donut: mastery distribution */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-md">
          <h2 className="mb-5 text-base font-semibold">
            Mastery Distribution
          </h2>
          <MasteryDonut data={masteryDistribution} total={totalConcepts} />
        </section>
      </div>
    </div>
  );
}

/* ---------- Stat Card ---------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 text-text-dim">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}

/* ---------- Reviews Bar Chart ---------- */

function ReviewsBarChart({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 180;
  const barWidth = Math.max(16, Math.min(40, 600 / data.length - 8));
  const gap = 6;
  const svgWidth = data.length * (barWidth + gap) + gap;

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={chartHeight + 40}
        viewBox={`0 0 ${svgWidth} ${chartHeight + 40}`}
        className="min-w-full"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = chartHeight - chartHeight * frac;
          return (
            <line
              key={frac}
              x1={0}
              y1={y}
              x2={svgWidth}
              y2={y}
              stroke="var(--color-border)"
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((d, i) => {
          const barH = (d.count / maxCount) * chartHeight;
          const x = gap + i * (barWidth + gap);
          const y = chartHeight - barH;
          return (
            <g key={d.week}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill="var(--color-accent)"
                opacity={0.85}
              />
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                className="text-[10px]"
                fill="var(--color-text-dim)"
              >
                {d.count}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                className="text-[9px]"
                fill="var(--color-text-dim)"
              >
                {d.week.replace(/^\d{4}-/, "")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Category Stacked Bar ---------- */

function CategoryBar({
  data,
  total,
}: {
  data: { category: string; count: number }[];
  total: number;
}) {
  if (total === 0) {
    return <p className="text-sm text-text-dim">No concepts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="flex h-8 overflow-hidden rounded-full bg-surface2">
        {data.map((d) => {
          const pct = (d.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={d.category}
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: CATEGORY_COLORS[d.category] || "var(--color-text-dim)",
              }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block h-3 w-3 rounded-full ${CATEGORY_TW[d.category] || "bg-text-dim"}`}
            />
            <span className="capitalize">{d.category}</span>
            <span className="text-text-dim">
              {d.count} ({Math.round((d.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Mastery Donut ---------- */

function MasteryDonut({
  data,
  total,
}: {
  data: { level: string; count: number }[];
  total: number;
}) {
  if (total === 0) {
    return <p className="text-sm text-text-dim">No concepts yet.</p>;
  }

  const radius = 70;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;
  const size = (radius + stroke) * 2;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.count / total;
    const dashLen = pct * circumference;
    const seg = {
      level: d.level,
      count: d.count,
      dashLen,
      gap: circumference - dashLen,
      offset,
      color: MASTERY_COLORS[d.level] || "var(--color-text-dim)",
    };
    offset += dashLen;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg) => (
          <circle
            key={seg.level}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dashLen} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="var(--color-text)"
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          className="text-xs"
          fill="var(--color-text-dim)"
        >
          concepts
        </text>
      </svg>

      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.level} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span>{MASTERY_LABELS[seg.level] || seg.level}</span>
            <span className="text-text-dim">
              {seg.count} ({Math.round((seg.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
