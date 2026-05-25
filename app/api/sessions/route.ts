import { NextResponse } from "next/server";
import { createWherebyRoom, saveSession } from "@/lib/sessions";

export async function POST(req: Request) {
  let body: { topic?: unknown; files?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic =
    typeof body.topic === "string" && body.topic.trim().length > 0
      ? body.topic.trim()
      : null;
  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const files = Array.isArray(body.files)
    ? body.files.filter((f): f is string => typeof f === "string")
    : [];

  try {
    const { roomUrl, hostRoomUrl } = await createWherebyRoom();
    const id = crypto.randomUUID();
    saveSession({
      id,
      topic,
      files,
      roomUrl,
      hostRoomUrl,
      createdAt: Date.now(),
    });
    return NextResponse.json({ id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create session", detail: msg },
      { status: 500 }
    );
  }
}
