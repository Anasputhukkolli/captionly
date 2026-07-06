"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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

export default function Landing() {
  const [prompt, setPrompt] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleType(type: ContentType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, types: selectedTypes, image: imagePreview }),
      });
      const data = await res.json();
      setResults(data.results);
    } catch {
      // Placeholder until /api/generate is wired up
      setResults(
        Object.fromEntries(
          selectedTypes.map((t) => [t, `Sample ${t.toLowerCase()} will appear here.`])
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-white text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-black/60">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F5C518]" />
        AI SOCIAL MEDIA CONTENT STUDIO
      </div>

      <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-black md:text-6xl">
        One Upload.
        <br />
        <span className="relative inline-block">
          <span className="relative z-10">Every Platform.</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-[#F5C518] md:h-4" />
        </span>
      </h1>

      {/* Input area */}
      <div className="mt-8 w-full max-w-2xl rounded-3xl border-2 border-black bg-[#F5C518] p-3 shadow-[6px_6px_0_0_#000]">
        <div className="relative rounded-2xl bg-white">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your brand, product, or the post you need..."
            rows={2}
            className="w-full resize-none rounded-2xl bg-transparent p-4 pr-14 text-base text-black placeholder:text-black/35 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add an image"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black text-lg font-black text-[#F5C518] transition hover:bg-black/80"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Uploaded preview"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
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
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 px-1">
          {CONTENT_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
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
          disabled={isGenerating || !prompt.trim() || selectedTypes.length === 0}
          className="mt-3 w-full rounded-2xl bg-black py-3 text-sm font-bold text-[#F5C518] transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isGenerating ? "Generating..." : "Generate content"}
        </button>
      </div>

      {results && (
        <div className="mt-6 w-full max-w-2xl space-y-2 text-left">
          {Object.entries(results).map(([type, text]) => (
            <div key={type} className="rounded-xl border border-black/10 p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-black/40">
                {type}
              </p>
              <p className="text-sm text-black/80">{text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}