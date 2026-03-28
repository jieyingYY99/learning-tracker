import {
  isToday,
  isBefore,
  addDays,
  startOfDay,
  parseISO,
  format,
  isWithinInterval,
} from "date-fns";
import type { Concept, TrackerData, Page, FeedbackLevel, MasteryLevel, FocusArea } from "./types";

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export function computeNextReview(
  reviewStage: number,
  lastReviewDate: string
): string {
  const stage = Math.min(reviewStage, REVIEW_INTERVALS.length - 1);
  const days = REVIEW_INTERVALS[stage];
  return format(addDays(parseISO(lastReviewDate), days), "yyyy-MM-dd");
}

export function computeNextReviewWithFeedback(
  currentStage: number,
  lastReviewDate: string,
  feedback: FeedbackLevel
): { nextReview: string; newStage: number } {
  let newStage = currentStage;

  switch (feedback) {
    case "easy":
      newStage = Math.min(currentStage + 2, 5);
      break;
    case "medium":
      newStage = Math.min(currentStage + 1, 5);
      break;
    case "hard":
      // Stay at same stage
      break;
    case "forgot":
      newStage = Math.max(currentStage - 1, 0);
      break;
  }

  if (newStage >= 5) {
    return { nextReview: "", newStage: 5 }; // mastered
  }

  const intervalIndex = Math.min(newStage, REVIEW_INTERVALS.length - 1);
  let days = REVIEW_INTERVALS[intervalIndex];

  if (feedback === "hard") {
    days = Math.max(1, Math.floor(days / 2));
  } else if (feedback === "forgot") {
    days = 1;
  }

  const nextReview = format(addDays(parseISO(lastReviewDate), days), "yyyy-MM-dd");
  return { nextReview, newStage };
}

export function computeMasteryFromReviews(
  reviews: { feedback?: FeedbackLevel }[],
  currentMastery?: MasteryLevel
): MasteryLevel {
  const recent = reviews.slice(-3);
  const recentFeedback = recent.map((r) => r.feedback).filter(Boolean) as FeedbackLevel[];

  if (recentFeedback.length < 2) return currentMastery || "seen";

  if (recentFeedback.every((f) => f === "easy")) return "can_use";
  if (recentFeedback.includes("forgot")) {
    return currentMastery === "can_use" ? "understand" : "seen";
  }
  if (recentFeedback.filter((f) => f === "easy" || f === "medium").length >= 2) {
    return currentMastery === "seen" ? "understand" : currentMastery || "understand";
  }

  return currentMastery || "seen";
}

export function getFocusAreas(data: TrackerData): FocusArea[] {
  return data.concepts
    .map((c) => {
      const recent = c.reviews.slice(-5);
      const hardCount = recent.filter((r) => r.feedback === "hard").length;
      const forgotCount = recent.filter((r) => r.feedback === "forgot").length;
      const struggleScore = forgotCount * 2 + hardCount;
      return { concept: c, struggleScore, hardCount, forgotCount };
    })
    .filter((item) => item.struggleScore >= 2)
    .sort((a, b) => b.struggleScore - a.struggleScore)
    .slice(0, 5);
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
