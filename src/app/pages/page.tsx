import Link from "next/link";
import { FileText, Calendar } from "lucide-react";
import clsx from "clsx";

export default async function PagesIndex() {
  const fs = await import("fs");
  const path = await import("path");
  const pagesDir = path.join(process.cwd(), "public", "pages");

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(pagesDir)
      .filter((f: string) => f.endsWith(".html"))
      .sort()
      .reverse();
  } catch {
    // No pages yet
  }

  const categorize = (filename: string) => {
    if (filename.startsWith("week-")) return "weekly";
    if (filename.startsWith("review-")) return "review";
    return "topic";
  };

  const TYPE_COLORS: Record<string, string> = {
    weekly: "bg-accent/20 text-accent",
    review: "bg-orange/20 text-orange",
    topic: "bg-green/20 text-green",
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">
        Learning Pages{" "}
        <span className="text-base font-normal text-text-dim">
          \u5b66\u4e60\u9875\u9762
        </span>
      </h1>
      <p className="mb-6 text-sm text-text-dim">
        {files.length} pages available \u00b7 Click to view
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => {
          const slug = file.replace(".html", "");
          const type = categorize(file);
          const title = slug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <Link
              key={file}
              href={`/view/${slug}`}
              className="group rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:bg-surface2"
            >
              <div className="mb-2 flex items-center gap-2">
                <FileText
                  size={16}
                  className="text-text-dim group-hover:text-accent transition-colors"
                />
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    TYPE_COLORS[type]
                  )}
                >
                  {type}
                </span>
              </div>
              <h3 className="text-sm font-medium leading-tight group-hover:text-accent transition-colors">
                {title}
              </h3>
            </Link>
          );
        })}
      </div>

      {files.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-dim">
          No learning pages yet. Run /weekly-learning-tracker to generate your first page.
        </div>
      )}
    </div>
  );
}
