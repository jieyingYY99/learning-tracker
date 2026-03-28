"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, BookOpen } from "lucide-react";
import clsx from "clsx";
import type { FocusArea } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue/10 text-blue",
  backend: "bg-green/10 text-green",
  general: "bg-pink/10 text-pink",
};

export default function FocusAreas({
  focusAreas,
}: {
  focusAreas: FocusArea[];
}) {
  const [requested, setRequested] = useState<Set<string>>(new Set());

  async function handleDeepDive(conceptId: string) {
    try {
      const res = await fetch("/api/learning-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId }),
      });
      if (res.ok) setRequested((prev) => new Set(prev).add(conceptId));
    } catch {
      // Silent fail
    }
  }

  if (focusAreas.length === 0) return null;

  return (
    <div className="space-y-3">
      {focusAreas.map(({ concept, struggleScore, hardCount, forgotCount }) => (
        <div
          key={concept.id}
          className="flex items-center gap-3 rounded-xl border border-orange/20 bg-orange/5 p-4"
        >
          <AlertTriangle size={16} className="shrink-0 text-orange" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/concept/${concept.id}`}
                className="text-sm font-semibold truncate hover:text-accent transition-colors"
              >
                {concept.name}
              </Link>
              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  CATEGORY_COLORS[concept.category]
                )}
              >
                {concept.category}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-dim">
              Struggled {struggleScore} times in recent reviews
              {forgotCount > 0 && ` (forgot ${forgotCount}×)`}
              {hardCount > 0 && ` (hard ${hardCount}×)`}
            </p>
          </div>
          <button
            onClick={() => handleDeepDive(concept.id)}
            disabled={requested.has(concept.id)}
            className={clsx(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              requested.has(concept.id)
                ? "bg-green/10 text-green cursor-default"
                : "bg-accent text-white hover:bg-accent/90 active:scale-95"
            )}
          >
            {requested.has(concept.id) ? (
              "✓ Requested"
            ) : (
              <>
                <BookOpen size={12} className="inline mr-1" />
                Deep Dive
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
