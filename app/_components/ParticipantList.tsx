"use client";

import { useEffect, useState } from "react";
import type { Participant } from "@/lib/sessions";

export function ParticipantList({
  participants,
  sessionId,
  label,
}: {
  participants: Participant[];
  sessionId: string;
  label: string;
}) {
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`participant.${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as { id?: string };
        if (typeof parsed.id === "string") setMeId(parsed.id);
      }
    } catch {
      // ignore
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-[14px] font-medium leading-none text-black"
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        {label}
      </p>
      {participants.length === 0 ? (
        <p
          className="text-[12px] leading-snug text-black/55"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          Waiting for the first person to join…
        </p>
      ) : (
        <ul className="flex flex-col gap-4 px-3">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center gap-4">
              <span
                className="grid h-6 w-6 place-items-center rounded-full text-[10px] leading-none text-black"
                style={{
                  backgroundColor: p.bg,
                  fontFamily: "var(--font-public-sans)",
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span
                className="text-[14px] leading-none text-black"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                {p.name}
                {p.id === meId ? " (You)" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
