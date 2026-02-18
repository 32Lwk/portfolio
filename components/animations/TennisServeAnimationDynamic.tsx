"use client";

import dynamic from "next/dynamic";

const TennisServeAnimation = dynamic(
  () =>
    import("./TennisServeAnimation").then((m) => ({
      default: m.TennisServeAnimation,
    })),
  { ssr: false }
);

export function TennisServeAnimationDynamic() {
  return <TennisServeAnimation />;
}
