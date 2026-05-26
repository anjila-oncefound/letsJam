"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadContext } from "./UploadContext";

const PLACEHOLDER =
  "Why is our enterprise expansion stalling, and what should we do about it in Q1?";

export function StartForm() {
  const router = useRouter();
  const [challenge, setChallenge] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSession({ invite }: { invite?: boolean } = {}) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const topic = challenge.trim() || PLACEHOLDER;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, files }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed (${res.status})`);
      }
      const { id, host } = (await res.json()) as {
        id: string;
        host?: { id: string; name: string; bg: string };
      };
      // Pre-stash the host's participant identity so JoinModal doesn't prompt them.
      if (host) {
        try {
          localStorage.setItem(`participant.${id}`, JSON.stringify(host));
        } catch {
          // ignore (private browsing / storage full)
        }
      }
      const suffix = invite ? "&invite=1" : "";
      router.push(`/waiting-room?session=${id}${suffix}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1
          className="text-[40px] leading-none tracking-[-0.96px] text-[#1a1a1a] md:text-[48px]"
          style={{ fontFamily: "var(--font-queens)" }}
        >
          Start a New Session
        </h1>

        <Field label="Define your challenge">
          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            className="h-[156px] w-full resize-none rounded-2xl bg-[#f5f5f5] p-4 text-[15px] leading-[1.5] text-[#1a1a1a] outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#3c5bcb]/40"
            placeholder={PLACEHOLDER}
            style={{ fontFamily: "var(--font-public-sans)" }}
          />
        </Field>

        <Field label="Upload context">
          <UploadContext files={files} onChange={setFiles} />
        </Field>

        <Field label="Start time">
          <div className="flex flex-wrap items-center gap-3">
            <TimePill label="Immediately" active />
            <TimePill label="Schedule" />
            <TimePill label="Draft" />
          </div>
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        {error ? (
          <p
            className="text-[13px] text-red-600"
            style={{ fontFamily: "var(--font-public-sans)" }}
          >
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row">
          <PrimaryAction onClick={() => startSession()} disabled={submitting}>
            {submitting ? "Creating room…" : "Draft Session"}
          </PrimaryAction>
          <PrimaryAction
            onClick={() => startSession({ invite: true })}
            disabled={submitting}
          >
            {submitting ? "Creating room…" : "Invite team"}
          </PrimaryAction>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label
        className="text-[14px] font-medium leading-none text-black"
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TimePill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full p-3 text-[14px] leading-none transition-colors ${
        active
          ? "bg-[#1a1a1a] text-white"
          : "bg-[#f5f5f5] text-black hover:bg-neutral-200"
      }`}
      style={{ fontFamily: "var(--font-public-sans)" }}
    >
      {label}
    </button>
  );
}

function PrimaryAction({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center rounded-2xl bg-[#1a1a1a] p-4 text-[14px] font-medium leading-none text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {children}
    </button>
  );
}
