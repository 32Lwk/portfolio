"use client";

import dynamic from "next/dynamic";

const ParticleSimulation = dynamic(
  () =>
    import("./ParticleSimulation").then((m) => ({
      default: m.ParticleSimulation,
    })),
  { ssr: false }
);

export function ParticleSimulationDynamic() {
  return <ParticleSimulation />;
}
