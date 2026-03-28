import { Suspense } from "react";
import { getTrackerData } from "@/lib/kv";
import SearchClient from "./SearchClient";

export const revalidate = 60;

export default async function SearchPage() {
  const data = await getTrackerData();

  // Collect all unique tags
  const allTags = Array.from(
    new Set(data.concepts.flatMap((c) => c.tags || []))
  ).sort();

  return (
    <Suspense fallback={<div className="text-center text-text-dim py-8">Loading...</div>}>
      <SearchClient concepts={data.concepts} allTags={allTags} />
    </Suspense>
  );
}
