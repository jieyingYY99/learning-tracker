"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import clsx from "clsx";
import type { Concept } from "@/lib/types";
import { getStageLabel } from "@/lib/tracker";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

const MASTERY_ICONS: Record<string, string> = {
  seen: "👁",
  understand: "💡",
  can_use: "🔧",
};

export default function SearchClient({
  concepts,
  allTags,
}: {
  concepts: Concept[];
  allTags: string[];
}) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") || "";

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    initialTag ? new Set([initialTag]) : new Set()
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return concepts.filter((c) => {
      // Category filter
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;

      // Tag filter
      if (selectedTags.size > 0) {
        const conceptTags = new Set(c.tags || []);
        for (const tag of selectedTags) {
          if (!conceptTags.has(tag)) return false;
        }
      }

      // Text search
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

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-text-dim">
          Search concepts by name, description, notes, or tags.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concepts..."
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none"
          autoFocus
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2">
        {["all", "frontend", "backend", "general"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              categoryFilter === cat
                ? "bg-accent text-white"
                : "bg-surface2 text-text-dim hover:text-text"
            )}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={clsx(
                "rounded-md px-2 py-1 text-xs transition-colors",
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

      {/* Results */}
      <div className="space-y-2">
        <p className="text-xs text-text-dim">
          {results.length} concept{results.length !== 1 ? "s" : ""} found
        </p>
        {results.map((c) => (
          <Link
            key={c.id}
            href={`/concept/${c.id}`}
            className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate">{c.name}</h3>
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
                {c.tags && c.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={clsx(
                          "rounded px-1.5 py-0.5 text-[10px]",
                          selectedTags.has(tag)
                            ? "bg-accent/10 text-accent"
                            : "bg-surface2 text-text-dim"
                        )}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-text-dim">
                {c.mastery_level && (
                  <span>{MASTERY_ICONS[c.mastery_level]}</span>
                )}
                <span>{getStageLabel(c.review_stage)}</span>
                {c.difficulty && (
                  <span className="flex gap-0.5">
                    {Array.from({ length: c.difficulty }, (_, i) => (
                      <Star key={i} size={8} className="fill-orange text-orange" />
                    ))}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {results.length === 0 && (
          <div className="rounded-xl bg-surface2 p-8 text-center text-sm text-text-dim">
            No concepts match your search.
          </div>
        )}
      </div>
    </div>
  );
}
