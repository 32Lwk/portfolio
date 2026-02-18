"use client";

import dynamic from "next/dynamic";

const CodeVisualization = dynamic(
  () =>
    import("./CodeVisualization").then((m) => ({
      default: m.CodeVisualization,
    })),
  { ssr: false }
);

export function CodeVisualizationDynamic() {
  return <CodeVisualization />;
}
