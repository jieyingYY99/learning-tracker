import {
  isToday,
  isBefore,
  addDays,
  startOfDay,
  parseISO,
  format,
  isWithinInterval,
} from "date-fns";
import type { Concept, TrackerData, Page } from "./types";

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export function computeNextReview(
  reviewStage: number,
  lastReviewDate: string
): string {
  const stage = Math.min(reviewStage, REVIEW_INTERVALS.length - 1);
  const days = REVIEW_INTERVALS[stage];
  return format(addDays(parseISO(lastReviewDate), days), "yyyy-MM-dd");
}

export function getConceptsDueToday(
  data: TrackerData,
  today: Date = new Date()
): Concept[] {
  const todayStart = startOfDay(today);
  return data.concepts.filter((c) => {
    if (c.review_stage >= 5) return false;
    const reviewDate = startOfDay(parseISO(c.next_review));
    return isBefore(reviewDate, addDays(todayStart, 1));
  });
}

export function getConceptsDueThisWeek(
  data: TrackerData,
  today: Date = new Date()
): Concept[] {
  const start = startOfDay(today);
  const end = addDays(start, 7);
  return data.concepts.filter((c) => {
    if (c.review_stage >= 5) return false;
    const reviewDate = startOfDay(parseISO(c.next_review));
    return isWithinInterval(reviewDate, { start, end });
  });
}

export function getReviewCalendar(
  data: TrackerData,
  today: Date = new Date()
): Record<string, Concept[]> {
  const calendar: Record<string, Concept[]> = {};
  for (let i = 0; i < 14; i++) {
    const date = format(addDays(today, i), "yyyy-MM-dd");
    calendar[date] = [];
  }
  for (const concept of data.concepts) {
    if (concept.review_stage >= 5) continue;
    const reviewDate = concept.next_review;
    if (reviewDate in calendar) {
      calendar[reviewDate].push(concept);
    }
  }
  return calendar;
}

export function getCategoryBreakdown(
  data: TrackerData
): Record<string, number> {
  const breakdown: Record<string, number> = {
    frontend: 0,
    backend: 0,
    general: 0,
  };
  for (const c of data.concepts) {
    breakdown[c.category] = (breakdown[c.category] || 0) + 1;
  }
  return breakdown;
}

export function getCrossReferences(
  data: TrackerData
): { conceptId: string; pages: string[] }[] {
  if (!data.pages) return [];
  return data.concepts.map((c) => ({
    conceptId: c.id,
    pages: data.pages!.filter((p) => p.concepts.includes(c.id)).map((p) => p.filename),
  }));
}

export function buildPagesIndex(
  data: TrackerData,
  htmlFiles: string[]
): Page[] {
  const pages: Page[] = [];

  for (const filename of htmlFiles) {
    const weekMatch = filename.match(/^week-(\d{4})-W(\d{2})\.html$/);
    if (weekMatch) {
      const weekId = `${weekMatch[1]}-W${weekMatch[2]}`;
      const week = data.weeks.find((w) => w.week === weekId);
      pages.push({
        filename,
        title: `Week ${weekMatch[2]} Learning Hub`,
        type: "weekly",
        generated_date: data.last_updated,
        concepts: week?.concepts_learned || [],
      });
      continue;
    }

    if (filename.startsWith("review-")) {
      const allConcepts = data.concepts.map((c) => c.id);
      pages.push({
        filename,
        title: filename.replace(".html", "").replace(/-/g, " "),
        type: "review",
        generated_date: data.last_updated,
        concepts: allConcepts,
      });
      continue;
    }

    pages.push({
      filename,
      title: filename.replace(".html", "").replace(/[-_]/g, " "),
      type: "topic",
      generated_date: data.last_updated,
      concepts: [],
    });
  }

  return pages;
}

export function isOverdue(concept: Concept, today: Date = new Date()): boolean {
  if (concept.review_stage >= 5) return false;
  return isBefore(parseISO(concept.next_review), startOfDay(today));
}

export function isDueToday(
  concept: Concept,
  today: Date = new Date()
): boolean {
  return isToday(parseISO(concept.next_review));
}

export function getStageLabel(stage: number): string {
  if (stage >= 5) return "Mastered";
  return `Stage ${stage}/5`;
}

export function getStats(data: TrackerData) {
  const total = data.concepts.length;
  const mastered = data.concepts.filter((c) => c.review_stage >= 5).length;
  const dueToday = getConceptsDueToday(data).length;
  const totalWeeks = data.weeks.length;
  return { total, mastered, dueToday, totalWeeks };
}
