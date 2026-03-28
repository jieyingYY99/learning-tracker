import { NextRequest, NextResponse } from "next/server";
import { markReviewed } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptId, date } = body;

    if (!conceptId || !date) {
      return NextResponse.json(
        { error: "Missing conceptId or date" },
        { status: 400 }
      );
    }

    const updatedData = await markReviewed(conceptId, date);
    const concept = updatedData.concepts.find((c) => c.id === conceptId);

    return NextResponse.json({ success: true, concept });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
