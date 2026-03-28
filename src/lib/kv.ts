import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { join } from "path";
import type { TrackerData } from "./types";
import { computeNextReview } from "./tracker";

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

/** Mark a concept as reviewed, update stage and next review date */
export async function markReviewed(
  conceptId: string,
  date: string
): Promise<TrackerData> {
  const data = await getTrackerData();
  const concept = data.concepts.find((c) => c.id === conceptId);

  if (!concept) {
    throw new Error(`Concept not found: ${conceptId}`);
  }

  // Add review entry
  concept.reviews.push({ date, completed: true });

  // Increment stage (max 5)
  if (concept.review_stage < 5) {
    concept.review_stage += 1;
  }

  // Compute next review date
  if (concept.review_stage < 5) {
    concept.next_review = computeNextReview(concept.review_stage, date);
  }

  data.last_updated = date;

  // Save to KV if available
  const redis = getRedis();
  if (redis) {
    await redis.set(KV_KEY, JSON.stringify(data));
  }

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
