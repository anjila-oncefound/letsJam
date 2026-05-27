"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReflectionForm({
  sessionId,
  onwardHref,
}: {
  sessionId: string;
  onwardHref: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function participantId(): string | null {
    try {
      const stored = localStorage.getItem(`participant.${sessionId}`);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as { id?: string };
      return typeof parsed.id === "string" ? parsed.id : null;
    } catch {
      return null;
    }
  }

  async function submit({ passed }: { passed: boolean }) {
    if (submitting) return;
    const pid = participantId();
    if (!pid) {
      setError("We lost track of who you are — reload and rejoin.");
      return;
    }
    if (!passed && !text.trim()) {
      setError("Write your take, or hit Pass.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: pid, text: text.trim(), passed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed (${res.status})`);
      }
      router.push(onwardHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-[342px] flex-col justify-between rounded-2xl bg-[#f5f5f5] p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's your read on this? What would you do, and why? Be specific — your thinking is what the AI uses to find the real choice the room faces."
          className="w-full flex-1 resize-none bg-transparent text-[15px] leading-[1.5] text-[#1a1a1a] outline-none placeholder:text-[#7a7a7a]"
          style={{ fontFamily: "var(--font-public-sans)" }}
        />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#b5b5b5]" aria-hidden>
              🔒
            </span>
            <p
              className="text-[12px] text-[#7a7a7a]"
              style={{ fontFamily: "var(--font-public-sans)" }}
            >
              Private until everyone is in
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="text-[13px] text-red-600"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          {error}
        </p>
      ) : null}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => submit({ passed: true })}
          disabled={submitting}
          className="flex w-[228px] items-center justify-center rounded-2xl bg-white p-4 text-[14px] font-medium leading-none text-black ring-1 ring-inset ring-black/10 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => submit({ passed: false })}
          disabled={submitting}
          className="flex flex-1 items-center justify-center rounded-2xl bg-[#1a1a1a] p-4 text-[14px] font-medium leading-none text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
