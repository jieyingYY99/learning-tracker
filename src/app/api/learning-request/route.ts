import { NextRequest, NextResponse } from "next/server";
import { addLearningRequest } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptId, reason } = body;

    if (!conceptId) {
      return NextResponse.json(
        { error: "Missing conceptId" },
        { status: 400 }
      );
    }

    const updatedData = await addLearningRequest(conceptId, reason);
    const request_entry = updatedData.learning_requests?.find(
      (r) => r.concept_id === conceptId && r.status === "pending"
    );

    return NextResponse.json({ success: true, request: request_entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
