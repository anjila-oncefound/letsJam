"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function InviteModal() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session") ?? "";
  const shouldOpen = params.get("invite") === "1";

  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shouldOpen) setOpen(true);
  }, [shouldOpen]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/waiting-room?session=${sessionId}`);
  }, [open, sessionId]);

  const close = useCallback(() => {
    setOpen(false);
    const next = new URLSearchParams(params.toString());
    next.delete("invite");
    const query = next.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [params, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (insecure context, permission denied) — silent fail.
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] rounded-3xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2
              id="invite-modal-title"
              className="text-[22px] font-semibold leading-tight text-[#1a1a1a]"
            >
              Invite Team to Collaborate
            </h2>
            <p className="text-[14px] leading-snug text-black/60">
              Teammates can edit, view, or provide feedback on this project.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="grid h-8 w-8 place-items-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f5f5f5] p-4">
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium leading-none text-[#1a1a1a]">
              Link to share
            </p>
            <p className="text-[13px] leading-snug text-black/55">
              Anyone with the link can access
            </p>
          </div>

          <div className="mt-4 flex items-center rounded-xl bg-white p-2 pl-3 ring-1 ring-inset ring-black/10">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 truncate bg-transparent text-[13px] leading-none text-black/70 outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy link"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-[13px] leading-none text-white transition-colors hover:bg-black"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 4l10 10M14 4L4 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="8"
        y="8"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l4 4 10-10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

