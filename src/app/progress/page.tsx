import { getTrackerData } from "@/lib/kv";
import ProgressCharts from "@/components/ProgressCharts";
import type { MasteryLevel } from "@/lib/types";

export const revalidate = 60;

function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export default async function ProgressPage() {
  const data = await getTrackerData();

  // Reviews per week
  const weekMap: Record<string, number> = {};
  for (const concept of data.concepts) {
    for (const review of concept.reviews) {
      if (!review.date) continue;
      const week = getISOWeek(review.date);
      weekMap[week] = (weekMap[week] || 0) + 1;
    }
  }
  const reviewsPerWeek = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  // Category distribution
  const categoryMap: Record<string, number> = {};
  for (const concept of data.concepts) {
    categoryMap[concept.category] = (categoryMap[concept.category] || 0) + 1;
  }
  const categoryDistribution = Object.entries(categoryMap).map(
    ([category, count]) => ({ category, count })
  );

  // Mastery distribution
  const masteryMap: Record<string, number> = { seen: 0, understand: 0, can_use: 0 };
  for (const concept of data.concepts) {
    const level: MasteryLevel = concept.mastery_level || "seen";
    masteryMap[level] = (masteryMap[level] || 0) + 1;
  }
  const masteryDistribution = Object.entries(masteryMap).map(
    ([level, count]) => ({ level, count })
  );

  // Stats
  const totalConcepts = data.concepts.length;
  const mastered = data.concepts.filter((c) => c.review_stage >= 5).length;
  const totalReviews = data.concepts.reduce(
    (sum, c) => sum + c.reviews.length,
    0
  );
  const totalWeeks = reviewsPerWeek.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-text-dim">
          Visualize your learning journey over time.
        </p>
      </div>

      <ProgressCharts
        reviewsPerWeek={reviewsPerWeek}
        categoryDistribution={categoryDistribution}
        masteryDistribution={masteryDistribution}
        totalConcepts={totalConcepts}
        mastered={mastered}
        totalReviews={totalReviews}
        totalWeeks={totalWeeks}
      />
    </div>
  );
}
