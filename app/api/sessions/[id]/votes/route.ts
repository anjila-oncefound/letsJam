import { NextResponse } from "next/server";
import {
  currentRound,
  getSession,
  recordVote,
  tallyVotes,
  votesThisRound,
  type VoteChoice,
} from "@/lib/sessions";

// Status of the current voting round.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const round = currentRound(session);
  const votes = votesThisRound(session);
  const total = session.participants.length;
  return NextResponse.json({
    round,
    total,
    voted: votes.length,
    allVoted: total > 0 && votes.length >= total,
    tally: tallyVotes(session),
    voterIds: votes.map((v) => v.participantId),
    outcome: session.outcome && session.outcome.round === round ? session.outcome : null,
  });
}

// Cast (or change) a vote for the current round.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { participantId?: unknown; choice?: unknown; reason?: unknown };
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

  const choice = body.choice;
  if (choice !== "A" && choice !== "B" && choice !== "refine") {
    return NextResponse.json(
      { error: "choice must be A, B or refine" },
      { status: 400 }
    );
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 4000) : "";
  if (choice === "refine" && !reason) {
    return NextResponse.json(
      { error: "A refine vote needs a written reason" },
      { status: 400 }
    );
  }

  const result = await recordVote(id, {
    participantId,
    choice: choice as VoteChoice,
    reason: reason || undefined,
  });
  if (result === "no-session") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (result === "unknown-participant") {
    return NextResponse.json({ error: "Unknown participant" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
