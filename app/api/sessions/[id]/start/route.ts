import { NextResponse } from "next/server";
import { startSession } from "@/lib/sessions";

// Host-only: marks the session as started so every client's countdown
// anchors to the same timestamp. Idempotent.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { participantId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const participantId =
    typeof body.participantId === "string" ? body.participantId : null;
  if (!participantId) {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 }
    );
  }

  const result = await startSession(id, participantId);
  if (!result.ok) {
    const status = result.reason === "no-session" ? 404 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ startedAt: result.startedAt });
}
