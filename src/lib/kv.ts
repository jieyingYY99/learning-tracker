import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { join } from "path";
import type { TrackerData, FeedbackLevel } from "./types";
import { computeNextReview, computeNextReviewWithFeedback, computeMasteryFromReviews } from "./tracker";

const KV_KEY = "tracker:data";

function getRedis(): Redis | null {
  if (
    !process.env.KV_REST_API_URL ||
    !process.env.KV_REST_API_TOKEN
  ) {
    return null;
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

/** Read tracker data from KV, falling back to local JSON file */
export async function getTrackerData(): Promise<TrackerData> {
  const redis = getRedis();

  if (redis) {
    try {
      const data = await redis.get<TrackerData>(KV_KEY);
      if (data) return data;
    } catch {
      // Fall through to local file
    }
  }

  // Fallback: read from local JSON file
  const filePath = join(process.cwd(), "data", ".learning-tracker.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as TrackerData;
}

async function saveData(data: TrackerData): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(KV_KEY, JSON.stringify(data));
  }
}

/** Mark a concept as reviewed with optional feedback */
export async function markReviewed(
  conceptId: string,
  date: string,
  feedback: FeedbackLevel = "medium",
  notes?: string
): Promise<TrackerData> {
  const data = await getTrackerData();
  const concept = data.concepts.find((c) => c.id === conceptId);

  if (!concept) {
    throw new Error(`Concept not found: ${conceptId}`);
  }

  // Add review entry with feedback
  concept.reviews.push({ date, completed: true, feedback, notes });

  // Compute next review using feedback-based algorithm
  const { nextReview, newStage } = computeNextReviewWithFeedback(
    concept.review_stage,
    date,
    feedback
  );
  concept.review_stage = newStage;
  if (newStage < 5) {
    concept.next_review = nextReview;
  }

  // Update mastery level based on recent reviews
  concept.mastery_level = computeMasteryFromReviews(
    concept.reviews,
    concept.mastery_level
  );

  data.last_updated = date;
  await saveData(data);

  return data;
}

/** Add a learning request for a concept */
export async function addLearningRequest(
  conceptId: string,
  reason?: string
): Promise<TrackerData> {
  const data = await getTrackerData();

  if (!data.learning_requests) data.learning_requests = [];

  // Avoid duplicate pending requests for same concept
  const existing = data.learning_requests.find(
    (r) => r.concept_id === conceptId && r.status === "pending"
  );
  if (existing) return data;

  data.learning_requests.push({
    concept_id: conceptId,
    requested_date: new Date().toISOString().split("T")[0],
    reason,
    status: "pending",
  });

  data.last_updated = new Date().toISOString().split("T")[0];
  await saveData(data);

  return data;
}

/** Seed KV with tracker data from the JSON file */
export async function seedKV(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    console.log("No KV configured, skipping seed");
    return;
  }

  const filePath = join(process.cwd(), "data", ".learning-tracker.json");
  const raw = readFileSync(filePath, "utf-8");
  await redis.set(KV_KEY, raw);
  console.log("Seeded KV with tracker data");
}
