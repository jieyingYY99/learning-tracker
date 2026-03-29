"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, Dumbbell } from "lucide-react";
import clsx from "clsx";
import type { Exercise, Concept } from "@/lib/types";

interface Props {
  exercises: Exercise[];
  concepts: Concept[];
  categories: string[];
}

export default function ExerciseListClient({ exercises, concepts, categories }: Props) {
  const [typeFilter, setTypeFilter] = useState<"all" | "quiz" | "task">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  function getConceptName(id: string) {
    return concepts.find((c) => c.id === id)?.name ?? id;
  }

  function getConceptCategory(id: string) {
    return concepts.find((c) => c.id === id)?.category ?? "";
  }

  const filtered = exercises.filter((ex) => {
    if (typeFilter !== "all" && ex.type !== typeFilter) return false;
    if (difficultyFilter > 0 && ex.difficulty !== difficultyFilter) return false;
    if (categoryFilter !== "all" && getConceptCategory(ex.concept_id) !== categoryFilter) return false;
    return true;
  });

  // Group by concept
  const grouped = new Map<string, Exercise[]>();
  for (const ex of filtered) {
    const key = ex.concept_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(ex);
  }

  if (exercises.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <Dumbbell size={48} className="mx-auto mb-4 text-text-dim" />
        <h1 className="mb-2 text-2xl font-bold text-text">No Exercises Yet</h1>
        <p className="text-text-dim">
          Exercises will appear here once they are generated from your learning data.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 lg:px-12">
      <h1 className="mb-6 text-2xl font-bold text-text">Exercises</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Type filter */}
        <div className="flex gap-1.5">
          {(["all", "quiz", "task"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                typeFilter === t
                  ? "bg-accent text-white"
                  : "bg-surface2 text-text-dim hover:text-accent"
              )}
            >
              {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setDifficultyFilter(0)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              difficultyFilter === 0
                ? "bg-accent text-white"
                : "bg-surface2 text-text-dim hover:text-accent"
            )}
          >
            All Levels
          </button>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={clsx(
                "flex items-center gap-0.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                difficultyFilter === d
                  ? "bg-accent text-white"
                  : "bg-surface2 text-text-dim hover:text-accent"
              )}
            >
              <Star size={12} className={difficultyFilter === d ? "fill-white" : ""} />
              {d}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setCategoryFilter("all")}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              categoryFilter === "all"
                ? "bg-accent text-white"
                : "bg-surface2 text-text-dim hover:text-accent"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                categoryFilter === cat
                  ? "bg-accent text-white"
                  : "bg-surface2 text-text-dim hover:text-accent"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped exercises */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-text-dim">
          No exercises match the current filters.
        </p>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([conceptId, exs]) => (
            <div key={conceptId}>
              <h2 className="mb-3 text-lg font-semibold text-text">
                {getConceptName(conceptId)}
              </h2>
              <div className="space-y-2">
                {exs.map((ex) => (
                  <Link
                    key={ex.id}
                    href={`/exercises/${ex.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface2 p-4 transition-colors hover:border-accent/50"
                  >
                    <span
                      className={clsx(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        ex.type === "quiz"
                          ? "bg-blue/10 text-blue"
                          : "bg-pink/10 text-pink"
                      )}
                    >
                      {ex.type}
                    </span>
                    <span className="flex-1 text-sm font-medium text-text">
                      {ex.title}
                    </span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < ex.difficulty
                              ? "fill-accent text-accent"
                              : "text-border"
                          }
                        />
                      ))}
                    </span>
                    {ex.completed && (
                      <CheckCircle size={16} className="text-green" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
