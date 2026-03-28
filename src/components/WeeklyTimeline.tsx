import Link from "next/link";
import { Calendar, GitCommit, BookOpen } from "lucide-react";
import type { Week } from "@/lib/types";

interface Props {
  weeks: Week[];
}

export default function WeeklyTimeline({ weeks }: Props) {
  const sorted = [...weeks].sort((a, b) => (a.week > b.week ? -1 : 1));

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

      {sorted.map((week, i) => (
        <div key={week.week} className="relative flex gap-4 pb-6">
          {/* Dot */}
          <div className="relative z-10 mt-1.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-accent bg-bg flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-accent" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-sm">{week.week}</span>
              <Link
                href={`/view/week-${week.week.replace("-", "-").toLowerCase()}`}
                className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent hover:bg-accent/20 transition-colors"
              >
                <BookOpen size={11} />
                View page
              </Link>
            </div>
            <p className="mb-2 text-xs text-text-dim leading-relaxed">
              {week.summary}
            </p>
            <div className="flex gap-4 text-xs text-text-dim">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {week.concepts_learned.length} concepts
              </span>
              <span className="flex items-center gap-1">
                <GitCommit size={12} />
                {week.commits_analyzed} commits
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
