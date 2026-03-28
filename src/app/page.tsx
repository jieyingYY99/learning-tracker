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
  ArrowUpRight,
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

  if (!data.pages || data.pages.length === 0) {
    data.pages = buildPagesIndex(data, htmlFiles);
  }

  const dueToday = getConceptsDueToday(data);
  const calendar = getReviewCalendar(data);
  const breakdown = getCategoryBreakdown(data);
  const stats = getStats(data);

  const latestWeek = [...data.weeks].sort((a, b) =>
    a.week > b.week ? -1 : 1
  )[0];
  const recommendations = latestWeek?.learning_recommendations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1.5 text-sm text-text-dim">
            Track your learning progress with spaced repetition review.
          </p>
        </div>
        <p className="text-xs text-text-dim">
          Updated {data.last_updated}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Brain size={18} />}
          title="Total Concepts"
          value={stats.total}
          subtitle="All tracked concepts"
          hero
        />
        <StatCard
          icon={<Trophy size={18} />}
          title="Mastered"
          value={stats.mastered}
          subtitle="Stage 5/5 completed"
        />
        <StatCard
          icon={<AlertCircle size={18} />}
          title="Due Today"
          value={stats.dueToday}
          subtitle={stats.dueToday > 0 ? "Needs review" : "All caught up"}
        />
        <StatCard
          icon={<Calendar size={18} />}
          title="Weeks Tracked"
          value={stats.totalWeeks}
          subtitle="Learning weeks"
        />
      </div>

      {/* Today's Review */}
      {dueToday.length > 0 && (
        <Card title="Today's Review">
          <TodayReview concepts={dueToday} />
        </Card>
      )}

      {/* Row: Calendar/Categories + Timeline */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left: Calendar + Categories stacked */}
        <div className="flex flex-col gap-5 lg:w-3/5">
          <Card title="Review Calendar">
            <ReviewCalendar calendar={calendar} />
          </Card>
          <Card title="Categories">
            <CategoryBreakdown breakdown={breakdown} />
          </Card>
        </div>
        {/* Right: Timeline fills full height */}
        <div className="flex lg:w-2/5">
          <Card title="Timeline" stretch>
            <WeeklyTimeline weeks={data.weeks} />
          </Card>
        </div>
      </div>

      {/* Concept Library - full width */}
      <Card title="Concept Library">
        <ConceptTable concepts={data.concepts} />
      </Card>

      {/* Row: Cross-Reference + Recommendations */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Cross-Reference">
          <CrossReferenceMap
            concepts={data.concepts}
            pages={data.pages || []}
          />
        </Card>
        <Card title="Recommendations">
          <LearningRecommendations recommendations={recommendations} />
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  hero,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-accent p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/90">{title}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <ArrowUpRight size={16} />
          </div>
        </div>
        <div className="mt-3 text-4xl font-bold">{value}</div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
          {icon}
          <span>{subtitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-dim">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2">
          <ArrowUpRight size={16} className="text-text-dim" />
        </div>
      </div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-dim">
        {icon}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  stretch,
}: {
  title: string;
  children: React.ReactNode;
  stretch?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-6 shadow-md ${stretch ? "flex flex-1 flex-col" : ""}`}>
      <h2 className="mb-5 text-base font-semibold">{title}</h2>
      {stretch ? <div className="flex-1">{children}</div> : children}
    </section>
  );
}
