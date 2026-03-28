import { Lightbulb } from "lucide-react";
import clsx from "clsx";
import type { Recommendation } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red/10 text-red",
  medium: "bg-orange/10 text-orange",
  low: "bg-blue/10 text-blue",
};

interface Props {
  recommendations: Recommendation[];
}

export default function LearningRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-text-dim">
        No recommendations yet. Run the weekly tracker to generate suggestions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface2 p-4"
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
          <p className="mb-1.5 text-xs text-text-dim leading-relaxed">
            <span className="font-medium text-text">Why:</span> {rec.why}
          </p>
          <p className="text-xs text-text-dim leading-relaxed">
            <span className="font-medium text-text">How:</span> {rec.how}
          </p>
        </div>
      ))}
    </div>
  );
}
