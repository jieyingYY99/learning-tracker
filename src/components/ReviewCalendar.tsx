import { format, addDays, isToday, isBefore, startOfDay } from "date-fns";
import clsx from "clsx";
import type { Concept } from "@/lib/types";

interface Props {
  calendar: Record<string, Concept[]>;
}

export default function ReviewCalendar({ calendar }: Props) {
  const dates = Object.keys(calendar).sort();
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {/* Day headers */}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div
          key={d}
          className="text-center text-xs font-medium text-text-dim"
        >
          {d}
        </div>
      ))}

      {dates.map((dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        const concepts = calendar[dateStr];
        const isNow = isToday(date);
        const isPast = isBefore(date, today);
        const hasItems = concepts.length > 0;

        return (
          <div
            key={dateStr}
            className={clsx(
              "relative flex min-h-[60px] flex-col rounded-lg border p-1.5 text-xs transition-colors",
              isNow
                ? "border-accent bg-accent-glow"
                : hasItems && isPast
                  ? "border-red/30 bg-red/5"
                  : hasItems
                    ? "border-border bg-surface"
                    : "border-border/50 bg-surface/50"
            )}
          >
            <span
              className={clsx(
                "mb-1 font-mono text-[10px]",
                isNow ? "font-bold text-accent" : "text-text-dim"
              )}
            >
              {format(date, "M/d")}
            </span>
            {concepts.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="mb-0.5 truncate rounded bg-accent/10 px-1 py-0.5 text-[10px] text-accent"
                title={c.name}
              >
                {c.name.slice(0, 12)}
              </div>
            ))}
            {concepts.length > 2 && (
              <span className="text-[10px] text-text-dim">
                +{concepts.length - 2}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
