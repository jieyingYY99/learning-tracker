import { getTrackerData, getExercises } from "@/lib/kv";
import { Route } from "lucide-react";
import LearningPathView from "@/components/LearningPathView";

export const revalidate = 60;

export default async function PathPage() {
  const [data, exercises] = await Promise.all([
    getTrackerData(),
    getExercises(),
  ]);

  // Try to read learning_path from data, or generate a basic one from concepts
  const learningPath = (data as unknown as Record<string, unknown>).learning_path as
    | { generated_date: string; steps: { concept_id: string; reason: string; exercises: string[]; estimated_hours: number }[] }
    | undefined;

  if (!learningPath || learningPath.steps.length === 0) {
    // Generate a basic path from concepts sorted by learned_date
    const sortedConcepts = [...data.concepts].sort(
      (a, b) => a.learned_date.localeCompare(b.learned_date)
    );

    if (sortedConcepts.length === 0) {
      return (
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <Route size={48} className="mx-auto mb-4 text-text-dim" />
          <h1 className="mb-2 text-2xl font-bold text-text">No Learning Path Yet</h1>
          <p className="text-text-dim">
            A learning path will be generated as you add concepts and exercises.
          </p>
        </div>
      );
    }

    // Auto-generate steps from concepts
    const autoSteps = sortedConcepts.map((c) => ({
      concept_id: c.id,
      reason: c.description,
      exercises: exercises
        .filter((e) => e.concept_id === c.id)
        .map((e) => e.id),
      estimated_hours: c.difficulty ? c.difficulty * 0.5 : 1,
    }));

    return (
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 lg:px-12">
        <h1 className="mb-2 text-2xl font-bold text-text">Learning Path</h1>
        <p className="mb-8 text-sm text-text-dim">
          Auto-generated from your learning history. Add a custom path to data for a curated experience.
        </p>
        <LearningPathView
          steps={autoSteps}
          concepts={data.concepts}
          exercises={exercises}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 lg:px-12">
      <h1 className="mb-2 text-2xl font-bold text-text">Learning Path</h1>
      <p className="mb-8 text-sm text-text-dim">
        Generated on {learningPath.generated_date}
      </p>
      <LearningPathView
        steps={learningPath.steps}
        concepts={data.concepts}
        exercises={exercises}
      />
    </div>
  );
}
