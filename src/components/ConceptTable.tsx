"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import type { Concept } from "@/lib/types";
import { getStageLabel, isOverdue } from "@/lib/tracker";

type SortKey = "name" | "category" | "learned_date" | "review_stage";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/20 text-blue",
  backend: "bg-green/20 text-green",
  general: "bg-pink/20 text-pink",
};

export default function ConceptTable({
  concepts,
}: {
  concepts: Concept[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("learned_date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "all" ? concepts : concepts.filter((c) => c.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    if (sortKey === "category")
      return a.category.localeCompare(b.category) * dir;
    if (sortKey === "learned_date")
      return (a.learned_date > b.learned_date ? 1 : -1) * dir;
    return (a.review_stage - b.review_stage) * dir;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-3 flex gap-2">
        {["all", "frontend", "backend", "general"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={clsx(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              filter === cat
                ? "bg-accent/20 text-accent"
                : "text-text-dim hover:text-text"
            )}
          >
            {cat === "all" ? "All \u5168\u90e8" : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-3 text-left font-medium text-text-dim">
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1"
                >
                  Name \u540d\u79f0 <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="hidden p-3 text-left font-medium text-text-dim sm:table-cell">
                <button
                  onClick={() => toggleSort("category")}
                  className="flex items-center gap-1"
                >
                  Category <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="hidden p-3 text-left font-medium text-text-dim md:table-cell">
                <button
                  onClick={() => toggleSort("learned_date")}
                  className="flex items-center gap-1"
                >
                  Learned <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="p-3 text-left font-medium text-text-dim">
                <button
                  onClick={() => toggleSort("review_stage")}
                  className="flex items-center gap-1"
                >
                  Progress <ArrowUpDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id} className="group">
                <td colSpan={4} className="p-0">
                  <button
                    onClick={() =>
                      setExpanded(expanded === c.id ? null : c.id)
                    }
                    className="flex w-full items-start gap-2 p-3 text-left transition-colors hover:bg-surface2"
                  >
                    <div className="flex w-full items-center gap-0">
                      {/* Expand icon */}
                      <span className="mr-2 shrink-0 text-text-dim">
                        {expanded === c.id ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </span>

                      {/* Name */}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {c.name}
                      </span>

                      {/* Category badge (hidden on mobile) */}
                      <span
                        className={clsx(
                          "ml-2 hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline",
                          CATEGORY_COLORS[c.category]
                        )}
                      >
                        {c.category}
                      </span>

                      {/* Date (hidden on mobile) */}
                      <span className="ml-4 hidden shrink-0 text-xs text-text-dim md:inline">
                        {c.learned_date}
                      </span>

                      {/* Progress bar */}
                      <div className="ml-4 flex shrink-0 items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all",
                              c.review_stage >= 5
                                ? "bg-green"
                                : isOverdue(c)
                                  ? "bg-red"
                                  : "bg-accent"
                            )}
                            style={{
                              width: `${(c.review_stage / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-text-dim">
                          {getStageLabel(c.review_stage)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded === c.id && (
                    <div className="border-t border-border bg-surface2 px-6 py-4 text-xs leading-relaxed text-text-dim">
                      <p className="mb-2">{c.description}</p>
                      <p className="mb-1">
                        <span className="text-text">Next review:</span>{" "}
                        {c.next_review}
                      </p>
                      {c.source_commits.length > 0 && (
                        <div className="mt-2">
                          <span className="text-text">Source commits:</span>
                          <ul className="mt-1 space-y-0.5 font-mono text-[11px]">
                            {c.source_commits.map((commit, i) => (
                              <li key={i} className="truncate">
                                {commit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
