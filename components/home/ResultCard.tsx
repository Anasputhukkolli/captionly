import { Copy, Check, RefreshCw, Pencil } from "lucide-react";
import ReelContent from "./ReelContent";
import EditableText from "./EditableText";
import GeneratingStatus from "./GeneratingStatus";
import { flattenReelData, getPlatformConfig, isReelType, isWideType } from "./platform-config";
import type { ReelData } from "./types";

interface ResultCardProps {
  type: string;
  value: unknown;
  isRegenerating: boolean;
  justCopied: boolean;
  hasImage?: boolean;
  onCopy: (type: string, text: string) => void;
  onRegenerate: (type: string) => void;
  onRedirect: (type: string, text: string) => void;
  onEdit: (type: string, newValue: unknown) => void;
}

/**
 * Turns a plain string or a key/value object into clean, copy-safe text.
 * - Preserves paragraph breaks the model returned.
 * - Joins object fields with a blank line so sections never run together.
 * - Trims stray trailing/leading whitespace without collapsing internal breaks.
 */
function toDisplayText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, string>)
      .map(([key, val]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `${label}:\n${String(val).trim()}`;
      })
      .join("\n\n")
      .trim();
  }

  return String(value ?? "").trim();
}

export default function ResultCard({
  type,
  value,
  isRegenerating,
  justCopied,
  hasImage,
  onCopy,
  onRegenerate,
  onRedirect,
  onEdit,
}: ResultCardProps) {
  const reel = isReelType(type);
  const reelData: ReelData | null =
    reel && value && typeof value === "object" ? (value as ReelData) : null;

  const plainDisplay = toDisplayText(value);

  // For reels, flattenReelData should already insert blank lines between
  // hook / scenes / cta — this just guards against it collapsing accidentally.
  const actionText = reelData
    ? flattenReelData(reelData).trim()
    : plainDisplay;

  const config = getPlatformConfig(type);
  const Icon = config?.icon;
  const wide = isWideType(type);

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] animate-[fadeIn_0.3s_ease-out] ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      {/* Card header — always the same height/spacing across cards */}
      <div className="mb-3 flex shrink-0 items-center justify-between border-b border-black/10 pb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">
            {type}
          </p>
          <span
            title="Click any text below to edit it"
            className="flex items-center gap-1 rounded-full bg-[#F5C518]/20 px-2 py-0.5 text-[10px] font-semibold text-black/50"
          >
            <Pencil className="h-2.5 w-2.5" />
            Editable
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRegenerate(type)}
            disabled={isRegenerating}
            title="Regenerate this one"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/60 transition hover:border-black/40 hover:text-black disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => onCopy(type, actionText)}
            title="Copy"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/60 transition hover:border-black/40 hover:text-black"
          >
            {justCopied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {config && Icon && (
            <button
              type="button"
              onClick={() => onRedirect(type, actionText)}
              title={`Post to ${type}`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[#F5C518] transition hover:bg-black/85"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card body — grows to fill remaining space so footers/edges line up */}
      <div className="flex-1">
        {isRegenerating ? (
          <GeneratingStatus type={type} hasImage={hasImage} />
        ) : reelData ? (
          <ReelContent
            reelData={reelData}
            onChange={(next) => onEdit(type, next)}
          />
        ) : (
          <EditableText
            value={plainDisplay}
            onChange={(next) => onEdit(type, next)}
            className="whitespace-pre-wrap text-sm leading-relaxed text-black/80"
          />
        )}
      </div>
    </div>
  );
}