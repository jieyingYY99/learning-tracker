import { Lightbulb, ArrowRight } from "lucide-react";
import clsx from "clsx";
import type { Recommendation } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red/20 text-red",
  medium: "bg-orange/20 text-orange",
  low: "bg-blue/20 text-blue",
};

interface Props {
  recommendations: Recommendation[];
}

export default function LearningRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-text-dim">
        No recommendations yet. Run the weekly tracker to generate suggestions.
        <br />
        <span className="text-xs">\u8fd8\u6ca1\u6709\u5b66\u4e60\u63a8\u8350\uff0c\u8fd0\u884c\u5468\u62a5\u540e\u81ea\u52a8\u751f\u6210\u3002</span>
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb size={14} className="text-orange" />
            <h4 className="flex-1 text-sm font-semibold">{rec.topic}</h4>
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                PRIORITY_STYLES[rec.priority]
              )}
            >
              {rec.priority}
            </span>
          </div>
          <p className="mb-2 text-xs text-text-dim leading-relaxed">
            <span className="text-text">Why:</span> {rec.why}
          </p>
          <p className="text-xs text-text-dim leading-relaxed">
            <span className="text-text">How:</span> {rec.how}
          </p>
        </div>
      ))}
    </div>
  );
}
