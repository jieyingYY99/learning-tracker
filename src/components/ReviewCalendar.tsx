import { format, isToday, isBefore, startOfDay } from "date-fns";
import clsx from "clsx";
import type { Concept } from "@/lib/types";

interface Props {
  calendar: Record<string, Concept[]>;
}

export default function ReviewCalendar({ calendar }: Props) {
  const dates = Object.keys(calendar).sort();
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div
          key={d}
          className="text-center text-xs font-medium text-text-dim pb-1"
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
              "relative flex min-h-[72px] flex-col rounded-xl border p-2 text-xs transition-colors",
              isNow
                ? "border-accent bg-accent-light ring-1 ring-accent/20"
                : hasItems && isPast
                  ? "border-red/20 bg-red/5"
                  : hasItems
                    ? "border-border bg-surface2"
                    : "border-border/50 bg-surface"
            )}
          >
            <span
              className={clsx(
                "mb-1 font-mono text-[11px]",
                isNow ? "font-bold text-accent" : "text-text-dim"
              )}
            >
              {format(date, "M/d")}
            </span>
            {concepts.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="mb-0.5 truncate rounded-md bg-accent/8 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                title={c.name}
              >
                {c.name.slice(0, 14)}
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
