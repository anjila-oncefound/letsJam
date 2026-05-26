import { NextResponse } from "next/server";
import { addParticipant, getSession } from "@/lib/sessions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let body: { name?: unknown; participantId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // If the client already has a participantId for this session, dedupe.
  if (typeof body.participantId === "string") {
    const existing = session.participants.find(
      (p) => p.id === body.participantId
    );
    if (existing) return NextResponse.json(existing);
  }

  const participant = addParticipant(id, name);
  if (!participant) {
    return NextResponse.json(
      { error: "Could not add participant" },
      { status: 500 }
    );
  }
  return NextResponse.json(participant);
}
