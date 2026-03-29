"use client";

import { useState } from "react";
import { CheckCircle, Star } from "lucide-react";
import type { Exercise } from "@/lib/types";

export default function TaskCard({ exercise }: { exercise: Exercise }) {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(exercise.completed ?? false);

  async function handleComplete() {
    setCompleting(true);
    try {
      await fetch("/api/exercises/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id }),
      });
      setCompleted(true);
    } catch {
      // silently fail
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface2 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-text-dim">Difficulty:</span>
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < exercise.difficulty ? "fill-accent text-accent" : "text-border"}
            />
          ))}
        </span>
      </div>

      {exercise.instructions && (
        <div
          className="prose prose-sm mb-6 max-w-none text-text [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-accent [&_h1]:text-text [&_h2]:text-text [&_h3]:text-text [&_p]:text-text-dim [&_li]:text-text-dim [&_a]:text-accent"
          dangerouslySetInnerHTML={{ __html: exercise.instructions }}
        />
      )}

      <div className="mt-6 border-t border-border pt-4">
        {!completed ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {completing ? "Saving..." : "Mark as Completed"}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green">
            <CheckCircle size={20} />
            <span className="font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
