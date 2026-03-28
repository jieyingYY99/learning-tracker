"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { Concept } from "@/lib/types";
import { isOverdue, getStageLabel } from "@/lib/tracker";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

export default function TodayReview({
  concepts,
}: {
  concepts: Concept[];
}) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  async function handleReview(conceptId: string) {
    setLoading(conceptId);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        setReviewed((prev) => new Set(prev).add(conceptId));
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setLoading(null);
    }
  }

  if (concepts.length === 0) {
    return (
      <div className="rounded-xl bg-accent-light p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-green" size={32} />
        <p className="font-medium text-green">
          No reviews due today. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {concepts.map((c) => {
        const overdue = isOverdue(c);
        const done = reviewed.has(c.id);
        const isLoading = loading === c.id;

        return (
          <div
            key={c.id}
            className={clsx(
              "rounded-xl border p-4 transition-all",
              done
                ? "border-green/30 bg-green/5 opacity-60"
                : overdue
                  ? "border-red/30 bg-red/5"
                  : "border-border bg-surface2"
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {overdue && !done && (
                  <AlertTriangle size={14} className="text-red shrink-0" />
                )}
                <h3 className="text-sm font-semibold leading-tight">
                  {c.name}
                </h3>
              </div>
              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  CATEGORY_COLORS[c.category]
                )}
              >
                {c.category}
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-text-dim line-clamp-2">
              {c.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-text-dim">
                <Clock size={12} />
                {getStageLabel(c.review_stage)}
              </span>
              <button
                onClick={() => handleReview(c.id)}
                disabled={done || isLoading}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  done
                    ? "bg-green/10 text-green cursor-default"
                    : "bg-accent text-white hover:bg-accent/90 active:scale-95"
                )}
              >
                {done ? "✓ Reviewed" : isLoading ? "..." : "Mark Reviewed"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
