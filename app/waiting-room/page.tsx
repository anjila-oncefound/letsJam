import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, type Participant } from "@/lib/sessions";
import { VideoPreview } from "./VideoPreviewClient";
import { InviteModal } from "./InviteModal";
import { JoinModal } from "./JoinModal";
import { ParticipantList } from "@/app/_components/ParticipantList";

export const metadata = {
  title: "Waiting room — Jam",
};

const TIMELINE_STEPS = [
  "Setup",
  "Waiting Room",
  "Self Reflection",
  "Synthesize",
  "Vote",
  "The call",
];

const ACTIVE_STEP = 1;

export default async function WaitingRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) notFound();
  const session = await getSession(sessionId);
  if (!session) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <Body
        sessionId={session.id}
        topic={session.topic}
        files={session.files}
        participants={session.participants}
      />
      <InviteModal />
      <JoinModal />
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-3 px-6 py-6 md:px-12 lg:px-16">
      <Link href="/" className="inline-flex" aria-label="Jam home">
        <Logo />
      </Link>
    </header>
  );
}

function Logo() {
  return (
    <div className="relative inline-grid grid-cols-[max-content]">
      <p
        className="col-start-1 row-start-1 ml-[34px] text-[22px] leading-[0.9] tracking-[-0.88px] text-black"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        jam
      </p>
      <div className="col-start-1 row-start-1 flex h-[21.2px] w-[31.3px] items-center justify-center">
        <div className="-rotate-[11.02deg]">
          <div className="flex items-center justify-center rounded-full bg-[var(--color-jam-blue)] px-1 py-[2px]">
            <span
              className="text-[14px] leading-[0.9] text-black"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              lets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Body({
  sessionId,
  topic,
  files,
  participants,
}: {
  sessionId: string;
  topic: string;
  files: string[];
  participants: Participant[];
}) {
  return (
    <div className="flex flex-1 flex-col items-stretch gap-6 px-6 pb-12 pt-4 md:px-12 lg:flex-row lg:gap-8 lg:px-16 lg:pb-16 lg:pt-8">
      <MainCard sessionId={sessionId} />
      <Sidebar
        sessionId={sessionId}
        topic={topic}
        files={files}
        participants={participants}
      />
    </div>
  );
}

function MainCard({ sessionId }: { sessionId: string }) {
  const onwardHref = `/session?session=${sessionId}`;
  const inviteHref = `/waiting-room?session=${sessionId}&invite=1`;
  return (
    <section className="flex min-w-0 flex-1 items-center justify-center">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-11">
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-[14px] font-medium leading-none text-black"
            style={{ fontFamily: "var(--font-public-sans)" }}
          >
            Waiting to start
          </p>
          <h1
            className="text-[40px] leading-none tracking-[-0.96px] text-[#1a1a1a] md:text-[48px]"
            style={{ fontFamily: "var(--font-queens)" }}
          >
            Start time 3:30pm
          </h1>
        </div>

        <VideoPreview />

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
          <SecondaryButton href={inviteHref}>Invite team</SecondaryButton>
          <SecondaryButton href={onwardHref}>Join the waiting room</SecondaryButton>
        </div>

        <HowItWorks />
      </div>
    </section>
  );
}

function SecondaryButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const className =
    "flex flex-1 items-center justify-center rounded-2xl bg-[#1a1a1a] p-4 text-[14px] font-medium leading-none text-white transition-colors hover:bg-black";
  const style = { fontFamily: "var(--font-inter)" };
  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} style={style}>
      {children}
    </button>
  );
}

function HowItWorks() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6">
      <p
        className="text-[14px] font-medium leading-none text-black"
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        How this works
      </p>
      <ol className="flex flex-col gap-3 text-[12px] leading-[1.5] text-black" style={{ fontFamily: "var(--font-public-sans)" }}>
        <li>1.&nbsp;&nbsp;Each person writes privately — 5 minutes, nobody sees anyone else&apos;s take.</li>
        <li>2.&nbsp;&nbsp;The AI reads the room — synthesizes submissions into two real paths.</li>
        <li>3.&nbsp;&nbsp;The team votes — one vote each, or vote to refine if neither lands.</li>
      </ol>
    </div>
  );
}

function Sidebar({
  sessionId,
  topic,
  files,
  participants,
}: {
  sessionId: string;
  topic: string;
  files: string[];
  participants: Participant[];
}) {
  return (
    <aside className="flex w-full flex-col gap-8 rounded-3xl bg-white p-6 lg:w-[420px] xl:w-[479px]">
      <div className="flex flex-col gap-4">
        <p
          className="text-[14px] font-medium leading-none text-black"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          Session
        </p>
        <p
          className="text-[24px] leading-[1.25] text-black"
          style={{ fontFamily: "var(--font-public-sans)" }}
        >
          {topic}
        </p>
      </div>

      <Timeline />

      <ParticipantList
        participants={participants}
        sessionId={sessionId}
        label="In the waiting room"
      />

      <SessionContext files={files} />
    </aside>
  );
}

function Timeline() {
  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-[14px] font-medium leading-none text-black"
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        Timeline
      </p>
      <ol className="flex flex-col">
        {TIMELINE_STEPS.map((label, idx) => {
          const active = idx === ACTIVE_STEP;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                active ? "bg-[#f5f5f5]" : ""
              }`}
            >
              <StepIndicator number={idx + 1} active={active} />
              <span
                className="text-[14px] leading-none text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepIndicator({
  number,
  active,
}: {
  number: number;
  active?: boolean;
}) {
  return (
    <span
      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] leading-none ${
        active ? "bg-[#e85d3c] text-white" : "bg-[#f5f5f5] text-black"
      }`}
      style={{ fontFamily: "var(--font-public-sans)" }}
    >
      {number}
    </span>
  );
}

function SessionContext({ files }: { files: string[] }) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-[14px] font-medium leading-none text-black"
        style={{ fontFamily: "var(--font-public-sans)" }}
      >
        Session Context
      </p>
      <div className="flex flex-wrap gap-3">
        {files.map((name, idx) => (
          <ContextChip key={`${name}-${idx}`} name={name} />
        ))}
      </div>
    </div>
  );
}


function ContextChip({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center gap-3 rounded-full bg-black/5 p-3 text-[14px] leading-none text-black"
      style={{ fontFamily: "var(--font-public-sans)" }}
    >
      <DocIcon />
      {name}
    </span>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
