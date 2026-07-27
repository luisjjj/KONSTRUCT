"use client";

import dynamic from "next/dynamic";

const PhaseBackground = dynamic(() => import("@/components/PhaseBackground"), { ssr: false });

export default function BackgroundLayer() {
  return <PhaseBackground />;
}
