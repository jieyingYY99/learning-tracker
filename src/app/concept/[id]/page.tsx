import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  GitCommit,
  FileText,
  Star,
  BookOpen,
} from "lucide-react";
import clsx from "clsx";
import { getTrackerData } from "@/lib/kv";
import { getStageLabel, isOverdue } from "@/lib/tracker";
import type { FeedbackLevel } from "@/lib/types";
import DeepDiveButton from "./DeepDiveButton";

export const revalidate = 60;

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

const MASTERY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  seen: { label: "Seen", icon: "👁", color: "text-text-dim" },
  understand: { label: "Understand", icon: "💡", color: "text-orange" },
  can_use: { label: "Can Use", icon: "🔧", color: "text-green" },
};

const FEEDBACK_COLORS: Record<string, string> = {
  easy: "bg-green/10 text-green",
  medium: "bg-accent/10 text-accent",
  hard: "bg-orange/10 text-orange",
  forgot: "bg-red/10 text-red",
};

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTrackerData();
  const concept = data.concepts.find((c) => c.id === id);

  if (!concept) notFound();

  const mastery = concept.mastery_level
    ? MASTERY_LABELS[concept.mastery_level]
    : MASTERY_LABELS.seen;

  const prereqs = (concept.prerequisites || [])
    .map((pid) => data.concepts.find((c) => c.id === pid))
    .filter(Boolean);

  const relatedPages = (data.pages || []).filter((p) =>
    p.concepts.includes(concept.id)
  );

  const overdue = isOverdue(concept);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={clsx(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              CATEGORY_COLORS[concept.category]
            )}
          >
            {concept.category}
          </span>
          <span className={clsx("text-sm", mastery.color)}>
            {mastery.icon} {mastery.label}
          </span>
          {concept.difficulty && (
            <span className="flex items-center gap-0.5 text-xs text-text-dim">
              {Array.from({ length: concept.difficulty }, (_, i) => (
                <Star key={i} size={10} className="fill-orange text-orange" />
              ))}
              {Array.from({ length: 5 - concept.difficulty }, (_, i) => (
                <Star key={i} size={10} className="text-border" />
              ))}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{concept.name}</h1>
        <p className="mt-2 text-sm text-text-dim leading-relaxed">
          {concept.description}
        </p>
      </div>

      {/* Tags */}
      {concept.tags && concept.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {concept.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className="rounded-md bg-surface2 px-2 py-1 text-xs text-text-dim hover:text-text hover:bg-accent/10 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Status bar */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-surface2 p-4 text-sm">
        <div>
          <span className="text-text-dim">Stage:</span>{" "}
          <span className="font-medium">{getStageLabel(concept.review_stage)}</span>
        </div>
        <div>
          <span className="text-text-dim">Learned:</span>{" "}
          <span className="font-medium">{concept.learned_date}</span>
        </div>
        <div>
          <span className="text-text-dim">Next review:</span>{" "}
          <span className={clsx("font-medium", overdue && "text-red")}>
            {concept.review_stage >= 5 ? "Mastered" : concept.next_review}
          </span>
        </div>
        <div>
          <span className="text-text-dim">Reviews:</span>{" "}
          <span className="font-medium">{concept.reviews.length}</span>
        </div>
      </div>

      {/* Notes */}
      {concept.notes && (
        <Section title="Notes" icon={<FileText size={16} />}>
          <div
            className="prose prose-sm max-w-none text-text [&_code]:bg-surface2 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-surface2 [&_pre]:p-3 [&_pre]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: concept.notes }}
          />
        </Section>
      )}

      {/* Deep Analysis */}
      {concept.deep_analysis && (
        <Section title="Deep Analysis" icon={<BookOpen size={16} />}>
          <div className="space-y-4">
            {concept.deep_analysis.existing_implementations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Existing Implementations</h4>
                <div className="space-y-2">
                  {concept.deep_analysis.existing_implementations.map((impl, i) => (
                    <div key={i} className="rounded-lg bg-surface2 p-3 text-xs">
                      <p className="font-medium text-text">{impl.location}</p>
                      <p className="text-text-dim mt-1">{impl.approach}</p>
                      {impl.key_code_pattern && (
                        <pre className="mt-2 overflow-x-auto rounded bg-surface p-2 font-mono text-[11px]">
                          {impl.key_code_pattern}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {concept.deep_analysis.comparison && (
              <div>
                <h4 className="text-sm font-medium mb-1">Comparison</h4>
                <p className="text-xs text-text-dim leading-relaxed">{concept.deep_analysis.comparison}</p>
              </div>
            )}
            {concept.deep_analysis.trade_offs && (
              <div>
                <h4 className="text-sm font-medium mb-1">Trade-offs</h4>
                <p className="text-xs text-text-dim leading-relaxed">{concept.deep_analysis.trade_offs}</p>
              </div>
            )}
            {concept.deep_analysis.decision_guide && (
              <div>
                <h4 className="text-sm font-medium mb-1">Decision Guide</h4>
                <p className="text-xs text-text-dim leading-relaxed">{concept.deep_analysis.decision_guide}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Prerequisites */}
      {prereqs.length > 0 && (
        <Section title="Prerequisites">
          <div className="flex flex-wrap gap-2">
            {prereqs.map((p) => (
              <Link
                key={p!.id}
                href={`/concept/${p!.id}`}
                className="rounded-lg border border-border bg-surface2 px-3 py-1.5 text-xs font-medium hover:border-accent transition-colors"
              >
                {p!.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Review History */}
      {concept.reviews.length > 0 && (
        <Section title="Review History" icon={<Clock size={16} />}>
          <div className="flex flex-wrap gap-1.5">
            {concept.reviews.map((r, i) => (
              <span
                key={i}
                className={clsx(
                  "rounded-md px-2 py-1 text-[11px] font-medium",
                  r.feedback
                    ? FEEDBACK_COLORS[r.feedback]
                    : "bg-surface2 text-text-dim"
                )}
                title={r.notes || undefined}
              >
                {r.date} {r.feedback || "reviewed"}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Source Commits */}
      {concept.source_commits.length > 0 && (
        <Section title="Source Commits" icon={<GitCommit size={16} />}>
          <ul className="space-y-1 font-mono text-xs text-text-dim">
            {concept.source_commits.map((commit, i) => (
              <li key={i} className="truncate">
                {commit}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Related Pages */}
      {relatedPages.length > 0 && (
        <Section title="Related Pages">
          <div className="flex flex-wrap gap-2">
            {relatedPages.map((p) => (
              <Link
                key={p.filename}
                href={`/view/${p.filename.replace(".html", "")}`}
                className="rounded-lg border border-border bg-surface2 px-3 py-1.5 text-xs font-medium hover:border-accent transition-colors"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Deep Dive Request */}
      {concept.review_stage < 5 && (
        <DeepDiveButton conceptId={concept.id} />
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
