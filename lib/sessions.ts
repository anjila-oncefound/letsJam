// In-memory session store.
// TODO: replace with Vercel KV / Upstash before prod traffic.
// On serverless cold-boot or `next dev` restart, this Map is wiped.

export type StoredSession = {
  id: string;
  topic: string;
  files: string[];
  roomUrl: string;
  hostRoomUrl: string;
  createdAt: number;
};

declare global {
  // Persist across HMR in dev. In prod, the Map lives for the lifetime of the process.
  // eslint-disable-next-line no-var
  var __sessionStore: Map<string, StoredSession> | undefined;
}

const store = globalThis.__sessionStore ?? new Map<string, StoredSession>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__sessionStore = store;
}

export function saveSession(session: StoredSession) {
  store.set(session.id, session);
}

export function getSession(id: string): StoredSession | undefined {
  return store.get(id);
}

export async function createWherebyRoom(): Promise<{
  roomUrl: string;
  hostRoomUrl: string;
}> {
  const apiKey = process.env.WHEREBY_API_KEY;
  if (!apiKey) {
    throw new Error("WHEREBY_API_KEY env var is not set");
  }

  // Rooms expire 24h after creation. See https://docs.whereby.com/reference/whereby-rest-api-reference
  const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch("https://api.whereby.dev/v1/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endDate,
      roomMode: "group",
      fields: ["hostRoomUrl"],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Whereby API error ${res.status}: ${detail}`);
  }

  const json = (await res.json()) as {
    roomUrl: string;
    hostRoomUrl: string;
  };
  return { roomUrl: json.roomUrl, hostRoomUrl: json.hostRoomUrl };
}
