"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Star,
  Clock,
  GitCommit,
  FileText,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import type { Concept, Page } from "@/lib/types";
import { getStageLabel, isOverdue } from "@/lib/tracker";
import DeepDiveButton from "@/app/concept/[id]/DeepDiveButton";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

const MASTERY_LABELS: Record<
  string,
  { label: string; icon: string; color: string }
> = {
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

export default function SearchClient({
  concepts,
  allTags,
  pages,
}: {
  concepts: Concept[];
  allTags: string[];
  pages: Page[];
}) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") || "";

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    initialTag ? new Set([initialTag]) : new Set()
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return concepts.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;

      if (selectedTags.size > 0) {
        const conceptTags = new Set(c.tags || []);
        for (const tag of selectedTags) {
          if (!conceptTags.has(tag)) return false;
        }
      }

      if (q) {
        const searchable = [
          c.name,
          c.description,
          c.notes || "",
          ...(c.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      }

      return true;
    });
  }, [concepts, query, selectedTags, categoryFilter]);

  const selected = useMemo(
    () => (selectedId ? concepts.find((c) => c.id === selectedId) : null),
    [concepts, selectedId]
  );

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar — search + filters in one row */}
      <div className="flex items-center gap-3 pb-4">
        {/* Search input */}
        <div className="relative w-64 shrink-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none"
            autoFocus
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5">
          {["all", "frontend", "backend", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === cat
                  ? "bg-accent text-white"
                  : "bg-surface2 text-text-dim hover:text-text"
              )}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Tag cloud */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={clsx(
                  "rounded-md px-1.5 py-1 text-[11px] transition-colors",
                  selectedTags.has(tag)
                    ? "bg-accent text-white"
                    : "bg-surface2 text-text-dim hover:text-text"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <span className="shrink-0 text-xs text-text-dim">
          {results.length} found
        </span>
      </div>

      {/* Bottom container — left cards + right detail */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left — scrollable card list */}
        <div className="w-[420px] shrink-0 overflow-y-auto space-y-2 pr-1 pb-4">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={clsx(
                "w-full text-left rounded-xl border p-4 transition-colors",
                selectedId === c.id
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:border-accent/50 hover:bg-surface2"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate">
                      {c.name}
                    </h3>
                    <span
                      className={clsx(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        CATEGORY_COLORS[c.category]
                      )}
                    >
                      {c.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-dim line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-text-dim">
                  <span>{getStageLabel(c.review_stage)}</span>
                </div>
              </div>
            </button>
          ))}

          {results.length === 0 && (
            <div className="rounded-xl bg-surface2 p-8 text-center text-sm text-text-dim">
              No concepts match your search.
            </div>
          )}
        </div>

        {/* Right — detail preview */}
        <div className="flex-1 min-w-0 overflow-y-auto pb-4">
          {selected ? (
            <DetailPreview
              concept={selected}
              concepts={concepts}
              pages={pages}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-text-dim">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a concept to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Preview ─── */

function DetailPreview({
  concept,
  concepts,
  pages,
}: {
  concept: Concept;
  concepts: Concept[];
  pages: Page[];
}) {
  const mastery = concept.mastery_level
    ? MASTERY_LABELS[concept.mastery_level]
    : MASTERY_LABELS.seen;

  const prereqs = (concept.prerequisites || [])
    .map((pid) => concepts.find((c) => c.id === pid))
    .filter(Boolean);

  const relatedPages = pages.filter((p) => p.concepts.includes(concept.id));

  const overdue = isOverdue(concept);

  return (
    <div className="space-y-5">
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
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">{concept.name}</h2>
          <Link
            href={`/concept/${concept.id}`}
            className="shrink-0 mt-1 text-text-dim hover:text-accent transition-colors"
            title="Open full page"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
        <p className="mt-2 text-sm text-text-dim leading-relaxed">
          {concept.description}
        </p>
      </div>

      {/* Tags */}
      {concept.tags && concept.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {concept.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface2 px-2 py-1 text-xs text-text-dim"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Status bar */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-surface2 p-4 text-sm">
        <div>
          <span className="text-text-dim">Stage:</span>{" "}
          <span className="font-medium">
            {getStageLabel(concept.review_stage)}
          </span>
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
                <h4 className="text-sm font-medium mb-1">
                  Existing Implementations
                </h4>
                <div className="space-y-2">
                  {concept.deep_analysis.existing_implementations.map(
                    (impl, i) => (
                      <div key={i} className="rounded-lg bg-surface2 p-3 text-xs">
                        <p className="font-medium text-text">{impl.location}</p>
                        <p className="text-text-dim mt-1">{impl.approach}</p>
                        {impl.key_code_pattern && (
                          <pre className="mt-2 overflow-x-auto rounded bg-surface p-2 font-mono text-[11px]">
                            {impl.key_code_pattern}
                          </pre>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {concept.deep_analysis.comparison && (
              <div>
                <h4 className="text-sm font-medium mb-1">Comparison</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  {concept.deep_analysis.comparison}
                </p>
              </div>
            )}
            {concept.deep_analysis.trade_offs && (
              <div>
                <h4 className="text-sm font-medium mb-1">Trade-offs</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  {concept.deep_analysis.trade_offs}
                </p>
              </div>
            )}
            {concept.deep_analysis.decision_guide && (
              <div>
                <h4 className="text-sm font-medium mb-1">Decision Guide</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  {concept.deep_analysis.decision_guide}
                </p>
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
