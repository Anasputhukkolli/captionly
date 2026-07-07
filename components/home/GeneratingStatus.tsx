"use client";

import { useEffect, useState } from "react";

interface GeneratingStatusProps {
  type: string;
  hasImage?: boolean;
}

function buildPhases(type: string, hasImage?: boolean) {
  const phases: string[] = [];
  if (hasImage) phases.push("Analyzing your image...");
  phases.push("Reading your brief...");
  phases.push(`Drafting your ${type.toLowerCase()}...`);
  phases.push("Polishing the wording...");
  return phases;
}

// Simulated multi-stage progress line. The API call itself is a single
// request/response (no server-side streaming), so this times through
// plausible stages rather than reflecting real backend progress.
export default function GeneratingStatus({ type, hasImage }: GeneratingStatusProps) {
  const phases = buildPhases(type, hasImage);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, hasImage]);

  return (
    <div className="flex flex-col gap-3 py-1">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F5C518] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5C518]" />
        </span>
        <p key={index} className="animate-[fadeSlide_0.4s_ease-out] text-sm font-semibold text-black">
          {phases[index]}
        </p>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-black/10" />
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-black/10" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/10" />
      </div>
    </div>
  );
}