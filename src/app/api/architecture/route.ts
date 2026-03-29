import { NextRequest, NextResponse } from "next/server";
import { getArchitecture, setArchitecture } from "@/lib/kv";

export async function GET() {
  try {
    const tree = await getArchitecture();
    if (!tree) {
      return NextResponse.json({ error: "No architecture data" }, { status: 404 });
    }
    return NextResponse.json({ success: true, tree });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tree } = body;

    if (!tree || !tree.id || !tree.name) {
      return NextResponse.json(
        { error: "Invalid architecture tree" },
        { status: 400 }
      );
    }

    await setArchitecture(tree);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
