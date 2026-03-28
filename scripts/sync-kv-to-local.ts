/**
 * Sync KV data to local JSON file.
 * Run this before the weekly-learning-tracker skill generates content,
 * so the skill can read user feedback from the website.
 *
 * Usage: npx tsx scripts/sync-kv-to-local.ts
 *
 * Requires .env.local with KV_REST_API_URL and KV_REST_API_TOKEN
 */

import { config } from "dotenv";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

// Load .env.local
config({ path: join(process.cwd(), ".env.local") });

const KV_KEY = "tracker:data";

async function syncKVToLocal() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.log("No KV credentials found in .env.local, skipping sync");
    console.log("Set KV_REST_API_URL and KV_REST_API_TOKEN to enable sync");
    return;
  }

  console.log("Fetching data from Upstash KV...");

  const response = await fetch(`${url}/get/${KV_KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    console.error(`KV fetch failed: ${response.status} ${response.statusText}`);
    return;
  }

  const body = await response.json();
  const data = body.result;

  if (!data) {
    console.log("No data in KV, nothing to sync");
    return;
  }

  // Parse if string, otherwise use as-is
  const parsed = typeof data === "string" ? JSON.parse(data) : data;

  const localPath = join(process.cwd(), "data", ".learning-tracker.json");
  writeFileSync(localPath, JSON.stringify(parsed, null, 2));

  console.log(`Synced KV data to ${localPath}`);
  console.log(`  Concepts: ${parsed.concepts?.length || 0}`);
  console.log(`  Last updated: ${parsed.last_updated}`);
  console.log(`  Learning requests: ${parsed.learning_requests?.length || 0}`);
}

syncKVToLocal().catch(console.error);
