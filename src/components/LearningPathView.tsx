"use client";

import Link from "next/link";
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react";
import clsx from "clsx";
import type { LearningPathStep, Concept, Exercise } from "@/lib/types";

interface Props {
  steps: LearningPathStep[];
  concepts: Concept[];
  exercises: Exercise[];
}

export default function LearningPathView({ steps, concepts, exercises }: Props) {
  function getConcept(id: string) {
    return concepts.find((c) => c.id === id);
  }

  function isStepComplete(step: LearningPathStep) {
    const concept = getConcept(step.concept_id);
    return concept?.mastery_level === "can_use";
  }

  function isStepInProgress(step: LearningPathStep) {
    const concept = getConcept(step.concept_id);
    return concept?.mastery_level === "understand";
  }

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const concept = getConcept(step.concept_id);
        const complete = isStepComplete(step);
        const inProgress = isStepInProgress(step);
        const stepExercises = step.exercises
          .map((eid) => exercises.find((e) => e.id === eid))
          .filter(Boolean) as Exercise[];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.concept_id} className="relative flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  complete
                    ? "border-green bg-green/10"
                    : inProgress
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface"
                )}
              >
                {complete ? (
                  <CheckCircle size={16} className="text-green" />
                ) : (
                  <Circle
                    size={16}
                    className={inProgress ? "text-accent" : "text-text-dim"}
                  />
                )}
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    "w-0.5 flex-1",
                    complete ? "bg-green/40" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className={clsx("mb-6 flex-1 rounded-xl border border-border bg-surface2 p-5", isLast && "mb-0")}>
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  {concept ? (
                    <Link
                      href={`/concept/${concept.id}`}
                      className="text-lg font-semibold text-accent hover:underline"
                    >
                      {concept.name}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold text-text-dim">
                      {step.concept_id}
                    </span>
                  )}
                  {complete && (
                    <span className="ml-2 inline-block rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
                      Mastered
                    </span>
                  )}
                  {inProgress && (
                    <span className="ml-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      In Progress
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-text-dim">
                  <Clock size={14} />
                  {step.estimated_hours}h
                </div>
              </div>

              <p className="mb-3 text-sm text-text-dim">{step.reason}</p>

              {stepExercises.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium uppercase text-text-dim">
                    Exercises
                  </span>
                  {stepExercises.map((ex) => (
                    <Link
                      key={ex.id}
                      href={`/exercises/${ex.id}`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-accent/50"
                    >
                      <span
                        className={clsx(
                          "rounded px-1.5 py-0.5 text-xs font-medium",
                          ex.type === "quiz"
                            ? "bg-blue/10 text-blue"
                            : "bg-pink/10 text-pink"
                        )}
                      >
                        {ex.type}
                      </span>
                      <span className="flex-1">{ex.title}</span>
                      {ex.completed && (
                        <CheckCircle size={14} className="text-green" />
                      )}
                      <ArrowRight size={14} className="text-text-dim" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
