import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import type { TrackerData, FeedbackLevel, ArchNode, Exercise } from "./types";
import { computeNextReviewWithFeedback, computeMasteryFromReviews } from "./tracker";

// --- KV keys & file paths ---

const DATA_DIR = join(process.cwd(), "data");

const KV_KEY = "tracker:data";
const ARCH_KV_KEY = "tracker:architecture";
const EXERCISES_KV_KEY = "tracker:exercises";

const TRACKER_FILE = join(DATA_DIR, ".learning-tracker.json");
const ARCH_FILE = join(DATA_DIR, "architecture.json");
const EXERCISES_FILE = join(DATA_DIR, "exercises.json");

// --- Generic KV helpers ---

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

/** Read from Redis KV, falling back to local JSON file */
async function getFromKV<T>(kvKey: string, filePath: string, defaultValue: T): Promise<T> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<T>(kvKey);
      if (data) return data;
    } catch {
      // Fall through to local file
    }
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/** Save to Redis KV + local JSON file (non-blocking write) */
async function saveToKV<T>(kvKey: string, filePath: string, data: T): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(kvKey, JSON.stringify(data));
  }
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// --- Tracker data ---

export async function getTrackerData(): Promise<TrackerData> {
  // TrackerData always exists in local file, so cast is safe
  return getFromKV<TrackerData>(KV_KEY, TRACKER_FILE, null as unknown as TrackerData);
}

async function saveData(data: TrackerData): Promise<void> {
  return saveToKV(KV_KEY, TRACKER_FILE, data);
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

  concept.reviews.push({ date, completed: true, feedback, notes });

  const { nextReview, newStage } = computeNextReviewWithFeedback(
    concept.review_stage,
    date,
    feedback
  );
  concept.review_stage = newStage;
  if (newStage < 5) {
    concept.next_review = nextReview;
  }

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

// --- Architecture ---

export async function getArchitecture(): Promise<ArchNode | null> {
  return getFromKV<ArchNode | null>(ARCH_KV_KEY, ARCH_FILE, null);
}

export async function setArchitecture(tree: ArchNode): Promise<void> {
  return saveToKV(ARCH_KV_KEY, ARCH_FILE, tree);
}

// --- Exercises ---

export async function getExercises(): Promise<Exercise[]> {
  return getFromKV<Exercise[]>(EXERCISES_KV_KEY, EXERCISES_FILE, []);
}

async function saveExercises(exercises: Exercise[]): Promise<void> {
  return saveToKV(EXERCISES_KV_KEY, EXERCISES_FILE, exercises);
}

export async function markExerciseCompleted(exerciseId: string): Promise<Exercise[]> {
  const exercises = await getExercises();
  const exercise = exercises.find((e) => e.id === exerciseId);

  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  exercise.completed = true;
  exercise.completed_date = new Date().toISOString().split("T")[0];

  await saveExercises(exercises);
  return exercises;
}

// --- Seed ---

export async function seedKV(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    console.log("No KV configured, skipping seed");
    return;
  }

  const raw = readFileSync(TRACKER_FILE, "utf-8");
  await redis.set(KV_KEY, raw);
  console.log("Seeded KV with tracker data");
}
