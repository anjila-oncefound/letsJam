"use client";

import dynamic from "next/dynamic";

export const WherebyRoom = dynamic(
  () => import("./WherebyRoom").then((m) => m.WherebyRoom),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-[1003/639] w-full overflow-hidden rounded-xl bg-neutral-900" />
    ),
  }
);
