"use client";

import { useEffect, useState } from "react";

export function AboutBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* グラデーション: 上から薄い青がフェード */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(215 100% 60% / 0.08) 0%, hsl(220 100% 65% / 0.04) 30%, transparent 60%)",
        }}
      />

      {/* 微細なドットパターン */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.4) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 遊び要素: ゆっくり漂う柔らかいオーブ */}
      {!reduceMotion && (
        <>
          <div
            className="absolute -left-20 top-1/4 h-64 w-64 rounded-full blur-3xl opacity-20"
            style={{
              background: "hsl(215 100% 60% / 0.5)",
              animation: "float-orb 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -right-16 top-2/3 h-48 w-48 rounded-full blur-3xl opacity-15"
            style={{
              background: "hsl(225 100% 65% / 0.5)",
              animation: "float-orb 25s ease-in-out infinite reverse",
              animationDelay: "-5s",
            }}
          />
          <div
            className="absolute left-1/3 top-3/4 h-40 w-40 rounded-full blur-3xl opacity-10"
            style={{
              background: "hsl(220 100% 60% / 0.5)",
              animation: "float-orb 22s ease-in-out infinite",
              animationDelay: "-10s",
            }}
          />
        </>
      )}
    </div>
  );
}
