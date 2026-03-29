import { getTrackerData } from "@/lib/kv";
import KnowledgeMap from "@/components/KnowledgeMap";

export const revalidate = 60;

export default async function MapPage() {
  const data = await getTrackerData();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Map</h1>
        <p className="mt-1 text-sm text-text-dim">
          Visual dependency graph of all learned concepts. Drag to pan, scroll to zoom.
        </p>
      </div>
      <KnowledgeMap concepts={data.concepts} />
    </div>
  );
}
