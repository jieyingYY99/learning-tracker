"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { Concept } from "@/lib/types";
import { isOverdue, getStageLabel } from "@/lib/tracker";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/20 text-blue",
  backend: "bg-green/20 text-green",
  general: "bg-pink/20 text-pink",
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
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-green" size={32} />
        <p className="text-text-dim">
          No reviews due today. Great job!
          <br />
          <span className="text-sm">\u4eca\u5929\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u6982\u5ff5\uff0c\u505a\u5f97\u597d\uff01</span>
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
              "rounded-xl border bg-surface p-4 transition-all",
              done
                ? "border-green/30 opacity-60"
                : overdue
                  ? "border-red/40"
                  : "border-border"
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
                    ? "bg-green/20 text-green cursor-default"
                    : "bg-accent/20 text-accent hover:bg-accent/30 active:scale-95"
                )}
              >
                {done
                  ? "\u2713 Reviewed \u5df2\u590d\u4e60"
                  : isLoading
                    ? "..."
                    : "Mark Reviewed \u6253\u5361"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
