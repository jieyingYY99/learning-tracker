"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import clsx from "clsx";

export default function DeepDiveButton({ conceptId }: { conceptId: string }) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/learning-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId }),
      });
      if (res.ok) setRequested(true);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRequest}
      disabled={requested || loading}
      className={clsx(
        "w-full rounded-xl border p-4 text-sm font-medium transition-all",
        requested
          ? "border-green/30 bg-green/5 text-green cursor-default"
          : "border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 active:scale-[0.99]"
      )}
    >
      <BookOpen size={16} className="inline mr-2" />
      {requested
        ? "✓ Deep dive requested — will be generated next skill run"
        : loading
          ? "Requesting..."
          : "Request Deep Dive — generate more content for this concept"}
    </button>
  );
}
