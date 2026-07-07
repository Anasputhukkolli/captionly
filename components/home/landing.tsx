"use client";

import { useState } from "react";
import HeroSection from "./HeroSection";
import PromptForm from "./PromptForm";
import ResultsGrid from "./ResultsGrid";
import { getPlatformConfig } from "./platform-config";
import type { ContentType } from "./types";

export default function Landing() {
  const [prompt, setPrompt] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [generatingTypes, setGeneratingTypes] = useState<ContentType[]>([]);
  const [regeneratingType, setRegeneratingType] = useState<string | null>(null);

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
          selectedTypes.map((t) => [t, `Sample ${t.toLowerCase()} will appear here.`]),
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
      setTimeout(() => setCopiedType((prev) => (prev === type ? null : prev)), 1800);
    } catch {
      // clipboard write failed silently
    }
  }

  function handleEdit(type: string, newValue: unknown) {
    setResults((prev) => (prev ? { ...prev, [type]: newValue } : prev));
  }

  async function handleRedirect(type: string, text: string) {
    const config = getPlatformConfig(type);
    if (!config) return;

    if (!config.prefill) {
      await handleCopy(type, text);
    }

    const target = config.postUrl(text);
    const win = window.open(target, "_blank", "noopener,noreferrer");

    if (!win) {
      window.open(config.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className="flex min-h-screen w-full flex-col items-center bg-white px-4 py-16 text-center sm:px-6">
      <HeroSection />

      <PromptForm
        prompt={prompt}
        onPromptChange={setPrompt}
        selectedTypes={selectedTypes}
        onToggleType={toggleType}
        imagePreview={imagePreview}
        onImageSelect={handleFile}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />

      <ResultsGrid
        isGenerating={isGenerating}
        generatingTypes={generatingTypes}
        results={results}
        regeneratingType={regeneratingType}
        copiedType={copiedType}
        hasImage={!!imagePreview}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        onRedirect={handleRedirect}
        onEdit={handleEdit}
      />
    </section>
  );
}