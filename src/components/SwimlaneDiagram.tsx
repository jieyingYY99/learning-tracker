"use client";

import Link from "next/link";
import type { DomainFlow } from "@/lib/types";

interface Props {
  flows: DomainFlow[];
}

const DOMAINS = ["frontend", "backend", "infra", "ai"] as const;

const DOMAIN_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  infra: "Infra",
  ai: "AI",
};

const DOMAIN_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  frontend: {
    bg: "bg-blue/10",
    border: "border-blue/30",
    text: "text-blue",
    dot: "bg-blue",
  },
  backend: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    text: "text-accent",
    dot: "bg-accent",
  },
  infra: {
    bg: "bg-orange/10",
    border: "border-orange/30",
    text: "text-orange",
    dot: "bg-orange",
  },
  ai: {
    bg: "bg-pink/10",
    border: "border-pink/30",
    text: "text-pink",
    dot: "bg-pink",
  },
};

const DOMAIN_SVG_COLORS: Record<string, string> = {
  frontend: "var(--color-blue)",
  backend: "var(--color-accent)",
  infra: "var(--color-orange)",
  ai: "var(--color-pink)",
};

export default function SwimlaneDiagram({ flows }: Props) {
  return (
    <div className="space-y-8">
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  );
}

function FlowCard({ flow }: { flow: DomainFlow }) {
  const domainIndex = (d: string) => DOMAINS.indexOf(d as typeof DOMAINS[number]);

  // Layout: each step gets a row, placed in its domain column
  const colCount = DOMAINS.length;
  const stepHeight = 72;
  const headerHeight = 40;
  const colWidth = 180;
  const totalWidth = colCount * colWidth;
  const totalHeight = headerHeight + flow.steps.length * stepHeight + 20;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-md">
      <h3 className="mb-4 text-base font-semibold">{flow.name}</h3>

      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="min-w-full"
        >
          {/* Column headers */}
          {DOMAINS.map((domain, i) => {
            const x = i * colWidth;
            return (
              <g key={domain}>
                {/* Column background */}
                <rect
                  x={x}
                  y={0}
                  width={colWidth}
                  height={totalHeight}
                  fill={i % 2 === 0 ? "var(--color-surface2)" : "var(--color-surface)"}
                  opacity={0.5}
                />
                {/* Header label */}
                <text
                  x={x + colWidth / 2}
                  y={24}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill="var(--color-text-dim)"
                >
                  {DOMAIN_LABELS[domain]}
                </text>
                {/* Separator line */}
                {i > 0 && (
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={totalHeight}
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                  />
                )}
              </g>
            );
          })}

          {/* Header bottom line */}
          <line
            x1={0}
            y1={headerHeight}
            x2={totalWidth}
            y2={headerHeight}
            stroke="var(--color-border)"
          />

          {/* Connector lines between steps */}
          {flow.steps.map((step, i) => {
            if (i === 0) return null;
            const prev = flow.steps[i - 1];
            const prevCol = domainIndex(prev.domain);
            const curCol = domainIndex(step.domain);
            const y1 = headerHeight + (i - 1) * stepHeight + stepHeight / 2 + 10;
            const y2 = headerHeight + i * stepHeight + stepHeight / 2 + 10;
            const x1 = prevCol * colWidth + colWidth / 2;
            const x2 = curCol * colWidth + colWidth / 2;

            return (
              <g key={`line-${i}`}>
                <line
                  x1={x1}
                  y1={y1 + 14}
                  x2={x2}
                  y2={y2 - 14}
                  stroke="var(--color-border)"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Arrowhead marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="var(--color-border)"
              />
            </marker>
          </defs>

          {/* Step nodes */}
          {flow.steps.map((step, i) => {
            const col = domainIndex(step.domain);
            const cx = col * colWidth + colWidth / 2;
            const cy = headerHeight + i * stepHeight + stepHeight / 2 + 10;
            const nodeW = 140;
            const nodeH = 32;
            const color = DOMAIN_SVG_COLORS[step.domain] || "var(--color-text-dim)";

            return (
              <g key={`step-${i}`}>
                <rect
                  x={cx - nodeW / 2}
                  y={cy - nodeH / 2}
                  width={nodeW}
                  height={nodeH}
                  rx={8}
                  fill="var(--color-surface)"
                  stroke={color}
                  strokeWidth={2}
                />
                <circle cx={cx - nodeW / 2 + 14} cy={cy} r={4} fill={color} />
                <text
                  x={cx - nodeW / 2 + 26}
                  y={cy + 4}
                  className="text-[11px]"
                  fill="var(--color-text)"
                >
                  {step.description.length > 16
                    ? step.description.slice(0, 15) + "..."
                    : step.description}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step list with links */}
      <div className="mt-4 flex flex-wrap gap-2">
        {flow.steps.map((step, i) => {
          const colors = DOMAIN_COLORS[step.domain] || DOMAIN_COLORS.frontend;
          return (
            <Link
              key={`${step.concept_id}-${i}`}
              href={`/concept/${step.concept_id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${colors.bg} ${colors.border} ${colors.text}`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
              {step.description}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
