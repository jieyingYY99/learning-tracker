import {
  getConceptsDueToday,
  getReviewCalendar,
  getCategoryBreakdown,
  getStats,
  buildPagesIndex,
} from "@/lib/tracker";
import { getTrackerData } from "@/lib/kv";
import TodayReview from "@/components/TodayReview";
import ConceptTable from "@/components/ConceptTable";
import ReviewCalendar from "@/components/ReviewCalendar";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import WeeklyTimeline from "@/components/WeeklyTimeline";
import CrossReferenceMap from "@/components/CrossReferenceMap";
import LearningRecommendations from "@/components/LearningRecommendations";
import {
  Brain,
  Trophy,
  AlertCircle,
  Calendar,
} from "lucide-react";

// Revalidate every 60 seconds to pick up KV updates
export const revalidate = 60;

export default async function DashboardPage() {
  const data = await getTrackerData();

  // Build pages index from public/pages directory
  const fs = await import("fs");
  const path = await import("path");
  const pagesDir = path.join(process.cwd(), "public", "pages");
  let htmlFiles: string[] = [];
  try {
    htmlFiles = fs
      .readdirSync(pagesDir)
      .filter((f: string) => f.endsWith(".html"));
  } catch {
    // No pages directory yet
  }

  // If pages index doesn't exist in data, build it
  if (!data.pages || data.pages.length === 0) {
    data.pages = buildPagesIndex(data, htmlFiles);
  }

  const dueToday = getConceptsDueToday(data);
  const calendar = getReviewCalendar(data);
  const breakdown = getCategoryBreakdown(data);
  const stats = getStats(data);

  // Get latest week's recommendations
  const latestWeek = [...data.weeks].sort((a, b) =>
    a.week > b.week ? -1 : 1
  )[0];
  const recommendations = latestWeek?.learning_recommendations || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Learning Dashboard{" "}
          <span className="text-base font-normal text-text-dim">
            \u5b66\u4e60\u4eea\u8868\u76d8
          </span>
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Last updated: {data.last_updated}
        </p>

        {/* Stats bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Brain size={18} className="text-accent" />}
            value={stats.total}
            label="Concepts \u6982\u5ff5"
          />
          <StatCard
            icon={<Trophy size={18} className="text-green" />}
            value={stats.mastered}
            label="Mastered \u5df2\u638c\u63e1"
          />
          <StatCard
            icon={<AlertCircle size={18} className="text-orange" />}
            value={stats.dueToday}
            label="Due Today \u4eca\u65e5\u5f85\u590d\u4e60"
          />
          <StatCard
            icon={<Calendar size={18} className="text-blue" />}
            value={stats.totalWeeks}
            label="Weeks \u5468\u6570"
          />
        </div>
      </div>

      {/* Today's Review */}
      <Section title="Today's Review \u4eca\u65e5\u590d\u4e60" accent>
        <TodayReview concepts={dueToday} />
      </Section>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Concept Library */}
          <Section title="Concept Library \u6982\u5ff5\u5e93">
            <ConceptTable concepts={data.concepts} />
          </Section>

          {/* Cross-Reference */}
          <Section title="Cross-Reference \u5173\u8054\u56fe\u8c31">
            <CrossReferenceMap
              concepts={data.concepts}
              pages={data.pages || []}
            />
          </Section>
        </div>

        <div className="space-y-8">
          {/* Review Calendar */}
          <Section title="Review Calendar \u590d\u4e60\u65e5\u5386">
            <ReviewCalendar calendar={calendar} />
          </Section>

          {/* Category Breakdown */}
          <Section title="Categories \u7c7b\u522b\u5206\u5e03">
            <CategoryBreakdown breakdown={breakdown} />
          </Section>

          {/* Weekly Timeline */}
          <Section title="Timeline \u65f6\u95f4\u7ebf">
            <WeeklyTimeline weeks={data.weeks} />
          </Section>
        </div>
      </div>

      {/* Learning Recommendations */}
      <Section title="Recommendations \u5b66\u4e60\u63a8\u8350">
        <LearningRecommendations recommendations={recommendations} />
      </Section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      {icon}
      <div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs text-text-dim">{label}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={`mb-4 border-b border-border pb-2 text-base font-semibold ${accent ? "text-accent" : ""}`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
