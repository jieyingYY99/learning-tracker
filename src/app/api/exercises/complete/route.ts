import { NextRequest, NextResponse } from "next/server";
import { markExerciseCompleted } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Missing exerciseId" },
        { status: 400 }
      );
    }

    const exercises = await markExerciseCompleted(exerciseId);
    const exercise = exercises.find((e) => e.id === exerciseId);

    return NextResponse.json({ success: true, exercise });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
