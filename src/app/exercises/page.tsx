import { getExercises, getTrackerData } from "@/lib/kv";
import ExerciseListClient from "./ExerciseListClient";

export const revalidate = 60;

export default async function ExercisesPage() {
  const [exercises, data] = await Promise.all([
    getExercises(),
    getTrackerData(),
  ]);

  const categories = Array.from(
    new Set(
      data.concepts.map((c) => c.category)
    )
  ).sort();

  return (
    <ExerciseListClient
      exercises={exercises}
      concepts={data.concepts}
      categories={categories}
    />
  );
}
