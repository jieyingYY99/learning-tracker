import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { getExercises, getTrackerData } from "@/lib/kv";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import TaskCard from "@/components/TaskCard";

export const revalidate = 60;

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exercises, data] = await Promise.all([
    getExercises(),
    getTrackerData(),
  ]);

  const exercise = exercises.find((e) => e.id === id);
  if (!exercise) {
    notFound();
  }

  const concept = data.concepts.find((c) => c.id === exercise.concept_id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 lg:px-12">
      <Link
        href="/exercises"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-dim transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} />
        Back to Exercises
      </Link>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {exercise.type}
          </span>
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < exercise.difficulty
                    ? "fill-accent text-accent"
                    : "text-border"
                }
              />
            ))}
          </span>
        </div>
        <h1 className="mb-1 text-2xl font-bold text-text">{exercise.title}</h1>
        {concept && (
          <p className="text-sm text-text-dim">
            Concept:{" "}
            <Link
              href={`/concept/${concept.id}`}
              className="text-accent hover:underline"
            >
              {concept.name}
            </Link>
          </p>
        )}
        <p className="mt-2 text-text-dim">{exercise.description}</p>
      </div>

      {exercise.type === "quiz" ? (
        <QuizRunner exercise={exercise} />
      ) : (
        <TaskCard exercise={exercise} />
      )}
    </div>
  );
}
