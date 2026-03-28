import { NextRequest, NextResponse } from "next/server";
import { markReviewed } from "@/lib/kv";
import type { FeedbackLevel } from "@/lib/types";

const VALID_FEEDBACK: FeedbackLevel[] = ["easy", "medium", "hard", "forgot"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptId, date, feedback, notes } = body;

    if (!conceptId || !date) {
      return NextResponse.json(
        { error: "Missing conceptId or date" },
        { status: 400 }
      );
    }

    if (feedback && !VALID_FEEDBACK.includes(feedback)) {
      return NextResponse.json(
        { error: "Invalid feedback. Must be: easy, medium, hard, or forgot" },
        { status: 400 }
      );
    }

    const updatedData = await markReviewed(conceptId, date, feedback, notes);
    const concept = updatedData.concepts.find((c) => c.id === conceptId);

    return NextResponse.json({ success: true, concept });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
