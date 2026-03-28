import Link from "next/link";
import { FileText } from "lucide-react";
import clsx from "clsx";
import type { Concept, Page } from "@/lib/types";

interface Props {
  concepts: Concept[];
  pages: Page[];
}

export default function CrossReferenceMap({ concepts, pages }: Props) {
  // Only show pages that have concept associations
  const pagesWithConcepts = pages.filter((p) => p.concepts.length > 0);

  if (pagesWithConcepts.length === 0) {
    return (
      <p className="text-sm text-text-dim">
        No cross-references available yet. Run the weekly tracker to build the index.
        <br />
        <span className="text-xs">\u8fd8\u6ca1\u6709\u4ea4\u53c9\u5f15\u7528\u6570\u636e\uff0c\u8fd0\u884c\u5468\u62a5\u540e\u81ea\u52a8\u751f\u6210\u3002</span>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pagesWithConcepts.map((page) => {
        const slug = page.filename.replace(".html", "");
        const pageConcepts = concepts.filter((c) =>
          page.concepts.includes(c.id)
        );

        return (
          <div
            key={page.filename}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <FileText size={14} className="text-accent" />
              <Link
                href={`/view/${slug}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {page.title}
              </Link>
              <span className="rounded-full bg-surface2 px-2 py-0.5 text-[10px] text-text-dim">
                {page.type}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pageConcepts.map((c) => (
                <span
                  key={c.id}
                  className={clsx(
                    "rounded-md px-2 py-0.5 text-xs",
                    c.category === "frontend"
                      ? "bg-blue/10 text-blue"
                      : c.category === "backend"
                        ? "bg-green/10 text-green"
                        : "bg-pink/10 text-pink"
                  )}
                >
                  {c.name.length > 30 ? c.name.slice(0, 30) + "..." : c.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
