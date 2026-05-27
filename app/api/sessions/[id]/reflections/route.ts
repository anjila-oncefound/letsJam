import { NextResponse } from "next/server";
import { getSession, saveReflection } from "@/lib/sessions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let body: { participantId?: unknown; text?: unknown; passed?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const participantId =
    typeof body.participantId === "string" ? body.participantId : "";
  if (!participantId) {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 }
    );
  }
  const known = session.participants.some((p) => p.id === participantId);
  if (!known) {
    return NextResponse.json(
      { error: "Unknown participant" },
      { status: 403 }
    );
  }

  const passed = body.passed === true;
  const text =
    typeof body.text === "string" ? body.text.trim().slice(0, 8000) : "";
  if (!passed && !text) {
    return NextResponse.json(
      { error: "text is required unless passing" },
      { status: 400 }
    );
  }

  await saveReflection(id, { participantId, text, passed });
  return NextResponse.json({ ok: true });
}
