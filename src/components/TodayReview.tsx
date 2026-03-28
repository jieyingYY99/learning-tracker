"use client";

import { useState } from "react";
import { Clock, AlertTriangle, MessageSquare } from "lucide-react";
import clsx from "clsx";
import type { Concept, FeedbackLevel } from "@/lib/types";
import { isOverdue, getStageLabel } from "@/lib/tracker";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

const FEEDBACK_OPTIONS: {
  level: FeedbackLevel;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { level: "easy", label: "Easy", emoji: "😎", color: "bg-green/10 text-green hover:bg-green/20" },
  { level: "medium", label: "Medium", emoji: "✓", color: "bg-accent/10 text-accent hover:bg-accent/20" },
  { level: "hard", label: "Hard", emoji: "😤", color: "bg-orange/10 text-orange hover:bg-orange/20" },
  { level: "forgot", label: "Forgot", emoji: "✗", color: "bg-red/10 text-red hover:bg-red/20" },
];

const MASTERY_ICONS: Record<string, string> = {
  seen: "👁",
  understand: "💡",
  can_use: "🔧",
};

export default function TodayReview({
  concepts,
}: {
  concepts: Concept[];
}) {
  const [reviewedFeedback, setReviewedFeedback] = useState<Record<string, FeedbackLevel>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<Set<string>>(new Set());
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});

  async function handleReview(conceptId: string, feedback: FeedbackLevel) {
    // For hard/forgot, show notes input first (if not already shown)
    if ((feedback === "hard" || feedback === "forgot") && !showNotes.has(conceptId)) {
      setShowNotes((prev) => new Set(prev).add(conceptId));
      // Still submit — notes are optional
    }

    setLoading(conceptId);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId,
          date: new Date().toISOString().split("T")[0],
          feedback,
          notes: notesInput[conceptId] || undefined,
        }),
      });
      if (res.ok) {
        setReviewedFeedback((prev) => ({ ...prev, [conceptId]: feedback }));
        setShowNotes((prev) => {
          const next = new Set(prev);
          next.delete(conceptId);
          return next;
        });
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
        <span className="mx-auto mb-2 block text-2xl">🎉</span>
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
        const done = c.id in reviewedFeedback;
        const isLoading = loading === c.id;
        const feedback = reviewedFeedback[c.id];

        return (
          <div
            key={c.id}
            className={clsx(
              "rounded-xl border p-4 transition-all",
              done
                ? feedback === "forgot"
                  ? "border-red/30 bg-red/5 opacity-70"
                  : feedback === "hard"
                    ? "border-orange/30 bg-orange/5 opacity-70"
                    : "border-green/30 bg-green/5 opacity-70"
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
                <a
                  href={`/concept/${c.id}`}
                  className="text-sm font-semibold leading-tight hover:text-accent transition-colors"
                >
                  {c.name}
                </a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {c.mastery_level && (
                  <span className="text-xs" title={c.mastery_level}>
                    {MASTERY_ICONS[c.mastery_level]}
                  </span>
                )}
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    CATEGORY_COLORS[c.category]
                  )}
                >
                  {c.category}
                </span>
              </div>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-text-dim line-clamp-2">
              {c.description}
            </p>

            {/* Tags */}
            {c.tags && c.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {c.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-text-dim"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-xs text-text-dim">
                <Clock size={12} />
                {getStageLabel(c.review_stage)}
              </span>
            </div>

            {/* Feedback buttons */}
            {done ? (
              <div className="text-center text-xs font-medium text-text-dim">
                Reviewed as{" "}
                <span className={clsx(
                  feedback === "easy" && "text-green",
                  feedback === "medium" && "text-accent",
                  feedback === "hard" && "text-orange",
                  feedback === "forgot" && "text-red",
                )}>
                  {feedback}
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {FEEDBACK_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      onClick={() => handleReview(c.id, opt.level)}
                      disabled={isLoading}
                      className={clsx(
                        "rounded-lg px-1 py-1.5 text-[11px] font-medium transition-all active:scale-95",
                        opt.color,
                        isLoading && "opacity-50 cursor-wait"
                      )}
                    >
                      <span className="block text-sm">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Optional notes input for hard/forgot */}
                {showNotes.has(c.id) && (
                  <div className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="What was confusing? (optional)"
                      value={notesInput[c.id] || ""}
                      onChange={(e) =>
                        setNotesInput((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setShowNotes((prev) => {
                          const next = new Set(prev);
                          next.delete(c.id);
                          return next;
                        });
                      }}
                      className="text-xs text-text-dim hover:text-text"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
