"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Copy, Check, RefreshCw } from "lucide-react";

const CONTENT_TYPES = [
  "Instagram caption",
  "LinkedIn post",
  "Facebook caption",
  "X post",
  "Hashtags",
  "Reel script",
  "Content ideas",
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

interface ReelScene {
  scene?: number;
  duration?: string;
  visual?: string;
  voiceover?: string;
}

interface ReelData {
  hook?: string;
  scenes?: ReelScene[];
  cta?: string;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V23h-4V8z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 2H22l-7.4 8.5L23 22h-6.6l-5.2-6.6L5.3 22H2l7.9-9L1.3 2h6.7l4.7 6.1L18.9 2zM17.7 20h1.8L7 4H5.1l12.6 16z" />
    </svg>
  );
}

type PlatformIcon = React.ComponentType<{ className?: string }>;
type PlatformConfig = {
  icon: PlatformIcon;
  prefill: boolean;
  postUrl: (text: string) => string;
  fallbackUrl: string;
};

const INSTAGRAM_CONFIG: PlatformConfig = {
  icon: InstagramIcon,
  prefill: false,
  postUrl: () => "https://www.instagram.com/create/style/",
  fallbackUrl: "https://www.instagram.com/",
};

const LINKEDIN_CONFIG: PlatformConfig = {
  icon: LinkedinIcon,
  prefill: false,
  postUrl: () => "https://www.linkedin.com/feed/?shareActive=true",
  fallbackUrl: "https://www.linkedin.com/feed/",
};

const FACEBOOK_CONFIG: PlatformConfig = {
  icon: FacebookIcon,
  prefill: false,
  postUrl: () => "https://www.facebook.com/",
  fallbackUrl: "https://www.facebook.com/",
};

const X_CONFIG: PlatformConfig = {
  icon: XIcon,
  prefill: true,
  postUrl: (text) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  fallbackUrl: "https://twitter.com/",
};

// Fuzzy-matches any result key (however the API labels it) to a platform.
function getPlatformConfig(type: string): PlatformConfig | null {
  const t = type.toLowerCase();

  if (t.includes("instagram") || t.includes("insta") || t.includes("reel")) {
    return INSTAGRAM_CONFIG;
  }
  if (t.includes("linkedin")) {
    return LINKEDIN_CONFIG;
  }
  if (t.includes("facebook") || t.includes("fb")) {
    return FACEBOOK_CONFIG;
  }
  if (t.includes("x post") || t.includes("twitter") || t === "x") {
    return X_CONFIG;
  }
  return null;
}

function isReelType(type: string) {
  return type.toLowerCase().includes("reel");
}

// Flattens a reel's structured data into readable plain text for copy/redirect.
function flattenReelData(reelData: ReelData): string {
  return [
    reelData.hook ? `HOOK: ${reelData.hook}` : "",
    ...(reelData.scenes || []).map(
      (s) =>
        `SCENE ${s.scene ?? ""} (${s.duration ?? ""})\nVisual: ${s.visual ?? ""}\nVoiceover: ${s.voiceover ?? ""}`,
    ),
    reelData.cta ? `CTA: ${reelData.cta}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function Landing() {
  const [prompt, setPrompt] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [generatingTypes, setGeneratingTypes] = useState<ContentType[]>([]);
  const [regeneratingType, setRegeneratingType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleType(type: ContentType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!prompt.trim() || selectedTypes.length === 0) return;
    setIsGenerating(true);
    setResults(null);
    setGeneratingTypes(selectedTypes);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          types: selectedTypes,
          image: imagePreview,
        }),
      });
      const data = await res.json();
      setResults(data.results);
    } catch {
      setResults(
        Object.fromEntries(
          selectedTypes.map((t) => [
            t,
            `Sample ${t.toLowerCase()} will appear here.`,
          ]),
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate(type: string) {
    setRegeneratingType(type);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          types: [type],
          image: imagePreview,
        }),
      });
      const data = await res.json();
      const newValue = data.results?.[type];
      if (newValue !== undefined) {
        setResults((prev) => (prev ? { ...prev, [type]: newValue } : prev));
      }
    } catch {
      // keep existing content if regeneration fails
    } finally {
      setRegeneratingType(null);
    }
  }

  async function handleCopy(type: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(
        () => setCopiedType((prev) => (prev === type ? null : prev)),
        1800,
      );
    } catch {
      // clipboard write failed silently
    }
  }

  async function handleRedirect(type: string, text: string) {
    const config = getPlatformConfig(type);
    if (!config) return;

    if (!config.prefill) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(
          () => setCopiedType((prev) => (prev === type ? null : prev)),
          1800,
        );
      } catch {
        // ignore
      }
    }

    const target = config.postUrl(text);
    const win = window.open(target, "_blank", "noopener,noreferrer");

    if (!win) {
      window.open(config.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className="flex min-h-screen w-full flex-col items-center bg-white px-4 py-16 text-center sm:px-6">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#F5C518] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-[3px_3px_0_0_#000] animate-[wobble_3s_ease-in-out_infinite]">
        <span className="inline-block animate-[spin_3s_linear_infinite]">
          ⚡
        </span>
        Captiondoo — AI Content Studio
      </div>

      <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-black sm:text-5xl md:text-6xl">
        <span className="inline-flex flex-wrap justify-center gap-x-3">
          {"One Upload.".split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block animate-[bounce-fun_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {word}
            </span>
          ))}
        </span>
        <br />
        <span className="relative inline-block">
          <span className="relative z-10 inline-flex flex-wrap justify-center gap-x-3">
            {"Every Platform".split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block animate-[bounce-fun_2s_ease-in-out_infinite]"
                style={{ animationDelay: `${0.4 + i * 0.2}s` }}
              >
                {word}
              </span>
            ))}
          </span>
          <svg
            className="absolute -bottom-1 left-0 w-full animate-[wave_2.5s_ease-in-out_infinite]"
            height="14"
            viewBox="0 0 300 14"
            preserveAspectRatio="none"
          >
            <path
              d="M2 8 Q 60 2, 120 8 T 298 7"
              stroke="#F5C518"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes bounce-fun {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-3deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(-4px) rotate(3deg);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(0) scaleY(1);
          }
          50% {
            transform: translateX(4px) scaleY(1.3);
          }
        }
      `}</style>

      {/* Input area */}
      <div className="mt-10 w-full max-w-2xl rounded-3xl border-2 border-black bg-[#F5C518] p-3 shadow-[6px_6px_0_0_#000]">
        <div className="relative rounded-2xl bg-white">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your brand, product, or the post you need..."
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent p-4 pr-16 text-base leading-relaxed text-black placeholder:text-black/35 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add an image"
            className="absolute right-3 top-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-lg font-black text-[#F5C518] transition hover:bg-black/80"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Uploaded preview"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            ) : (
              "+"
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Content type chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-1">
          {CONTENT_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-black bg-black text-[#F5C518]"
                    : "border-black/20 bg-white text-black/60 hover:border-black/40"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            isGenerating || !prompt.trim() || selectedTypes.length === 0
          }
          className="mt-4 w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-[#F5C518] transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isGenerating ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5C518]/30 border-t-[#F5C518]" />
              Generating...
            </span>
          ) : (
            "Generate content"
          )}
        </button>
      </div>

      {/* Skeleton loading cards */}
      {isGenerating && (
        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {generatingTypes.map((type) => (
            <div
              key={type}
              className="flex flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                  {type}
                </p>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C518]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-black/10" />
                <div className="h-3 w-11/12 animate-pulse rounded-full bg-black/10" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isGenerating && results && (
        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {Object.entries(results).map(([type, value]) => {
            const reel = isReelType(type);
            const reelData: ReelData | null =
              reel && value && typeof value === "object"
                ? (value as ReelData)
                : null;

            const plainDisplay =
              typeof value === "string"
                ? value
                : typeof value === "object" && value !== null
                  ? Object.entries(value as Record<string, string>)
                      .map(([k, v]) => `${k}\n${v}`)
                      .join("\n\n")
                  : String(value ?? "");

            const actionText = reelData
              ? flattenReelData(reelData)
              : plainDisplay;

            const config = getPlatformConfig(type);
            const Icon = config?.icon;
            const justCopied = copiedType === type;
            const isRegenerating = regeneratingType === type;

            return (
              <div
                key={type}
                className="flex flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] animate-[fadeIn_0.3s_ease-out]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                    {type}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Regenerate */}
                    <button
                      type="button"
                      onClick={() => handleRegenerate(type)}
                      disabled={isRegenerating}
                      title="Regenerate this one"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/60 transition hover:border-black/40 hover:text-black disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
                      />
                    </button>

                    {/* Copy */}
                    <button
                      type="button"
                      onClick={() => handleCopy(type, actionText)}
                      title="Copy"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/60 transition hover:border-black/40 hover:text-black"
                    >
                      {justCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Platform redirect icon */}
                    {config && Icon && (
                      <button
                        type="button"
                        onClick={() => handleRedirect(type, actionText)}
                        title={`Post to ${type}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[#F5C518] transition hover:bg-black/85"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {isRegenerating ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 w-full animate-pulse rounded-full bg-black/10" />
                    <div className="h-3 w-11/12 animate-pulse rounded-full bg-black/10" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/10" />
                  </div>
                ) : reelData ? (
                  <div className="space-y-3">
                    {reelData.hook && (
                      <div className="rounded-xl bg-[#F5C518]/15 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-black/40">
                          Hook
                        </p>
                        <p className="text-sm font-semibold text-black">
                          {reelData.hook}
                        </p>
                      </div>
                    )}

                    {(reelData.scenes || []).map((s, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-black/10 p-3"
                      >
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
                        {s.visual && (
                          <p className="mb-1 text-sm text-black/80">
                            <span className="font-semibold">Visual: </span>
                            {s.visual}
                          </p>
                        )}
                        {s.voiceover && (
                          <p className="text-sm text-black/80">
                            <span className="font-semibold">Voiceover: </span>
                            {s.voiceover}
                          </p>
                        )}
                      </div>
                    ))}

                    {reelData.cta && (
                      <div className="rounded-xl bg-black p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#F5C518]/70">
                          CTA
                        </p>
                        <p className="text-sm font-semibold text-[#F5C518]">
                          {reelData.cta}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-black/80">
                    {plainDisplay}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
