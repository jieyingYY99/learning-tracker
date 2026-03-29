"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import clsx from "clsx";
import type { Exercise, ExerciseQuestion } from "@/lib/types";

export default function QuizRunner({ exercise }: { exercise: Exercise }) {
  const questions = exercise.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(exercise.completed ?? false);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface2 p-8 text-center text-text-dim">
        No questions available for this quiz.
      </div>
    );
  }

  const question: ExerciseQuestion = questions[currentIndex];
  const isCorrect = selectedOption === question.correct_index;
  const isLast = currentIndex === questions.length - 1;

  function handleCheck() {
    if (selectedOption === null) return;
    setChecked(true);
    if (selectedOption === question.correct_index) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setChecked(false);
    }
  }

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

  if (finished) {
    return (
      <div className="rounded-xl border border-border bg-surface2 p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-accent" />
        <h2 className="mb-2 text-2xl font-bold text-text">Quiz Complete!</h2>
        <p className="mb-6 text-lg text-text-dim">
          You got <span className="font-bold text-accent">{score}</span> / {questions.length} correct
        </p>
        {!completed ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {completing ? "Saving..." : "Mark as Completed"}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green">
            <CheckCircle size={20} />
            <span className="font-medium">Completed</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-text-dim">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm text-text-dim">Score: {score}</span>
      </div>

      <h3 className="mb-4 text-lg font-semibold text-text">{question.question}</h3>

      {question.code_snippet && (
        <pre className="mb-4 overflow-x-auto rounded-lg bg-surface p-4 text-sm text-text font-mono border border-border">
          {question.code_snippet}
        </pre>
      )}

      <div className="mb-6 space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !checked && setSelectedOption(i)}
            disabled={checked}
            className={clsx(
              "w-full rounded-lg border p-3 text-left text-sm transition-colors",
              checked && i === question.correct_index
                ? "border-green bg-green/10 text-green"
                : checked && i === selectedOption && !isCorrect
                  ? "border-red-400 bg-red-400/10 text-red-400"
                  : selectedOption === i
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface text-text hover:border-accent/50"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {checked && (
        <div
          className={clsx(
            "mb-4 rounded-lg p-4 text-sm",
            isCorrect ? "bg-green/10 text-green" : "bg-red-400/10 text-red-400"
          )}
        >
          <div className="mb-1 flex items-center gap-2 font-medium">
            {isCorrect ? (
              <>
                <CheckCircle size={16} /> Correct!
              </>
            ) : (
              <>
                <XCircle size={16} /> Incorrect
              </>
            )}
          </div>
          <p className="text-text-dim">{question.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedOption === null}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Check
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {isLast ? "See Results" : "Next"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
