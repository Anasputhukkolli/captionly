"use client";

import EditableText from "./EditableText";
import type { ReelData, ReelScene } from "./types";

interface ReelContentProps {
  reelData: ReelData;
  onChange: (next: ReelData) => void;
}

export default function ReelContent({ reelData, onChange }: ReelContentProps) {
  function updateHook(value: string) {
    onChange({ ...reelData, hook: value });
  }

  function updateScene(index: number, field: keyof ReelScene, value: string) {
    const scenes = [...(reelData.scenes || [])];
    scenes[index] = { ...scenes[index], [field]: value };
    onChange({ ...reelData, scenes });
  }

  function updateCta(value: string) {
    onChange({ ...reelData, cta: value });
  }

  return (
    <div
      className={`grid grid-cols-1 gap-3 ${
        (reelData.scenes?.length ?? 0) > 1 ? "sm:grid-cols-2" : ""
      }`}
    >
      {reelData.hook !== undefined && (
        <div className="rounded-xl bg-[#F5C518]/15 p-3 sm:col-span-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-black/40">
            Hook
          </p>
          <EditableText
            value={reelData.hook ?? ""}
            onChange={updateHook}
            className="text-sm font-semibold text-black"
          />
        </div>
      )}

      {(reelData.scenes || []).map((s, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-black/10 p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
              Scene {s.scene ?? i + 1}
            </p>
            {s.duration && (
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/50">
                {s.duration}
              </span>
            )}
          </div>
          {s.visual !== undefined && (
            <p className="mb-1 text-sm text-black/80">
              <span className="font-semibold">Visual: </span>
              <EditableText
                as="span"
                value={s.visual ?? ""}
                onChange={(v) => updateScene(i, "visual", v)}
              />
            </p>
          )}
          {s.voiceover !== undefined && (
            <p className="text-sm text-black/80">
              <span className="font-semibold">Voiceover: </span>
              <EditableText
                as="span"
                value={s.voiceover ?? ""}
                onChange={(v) => updateScene(i, "voiceover", v)}
              />
            </p>
          )}
        </div>
      ))}

      {reelData.cta !== undefined && (
        <div className="rounded-xl bg-black p-3 sm:col-span-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#F5C518]/70">
            CTA
          </p>
          <EditableText
            value={reelData.cta ?? ""}
            onChange={updateCta}
            className="text-sm font-semibold text-[#F5C518]"
          />
        </div>
      )}
    </div>
  );
}