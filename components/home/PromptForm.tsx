import { useRef } from "react";
import Image from "next/image";
import { CONTENT_TYPES, type ContentType } from "./types";

interface PromptFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedTypes: ContentType[];
  onToggleType: (type: ContentType) => void;
  imagePreview: string | null;
  onImageSelect: (file: File | undefined) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function PromptForm({
  prompt,
  onPromptChange,
  selectedTypes,
  onToggleType,
  imagePreview,
  onImageSelect,
  isGenerating,
  onGenerate,
}: PromptFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-10 w-full max-w-2xl rounded-3xl border-2 border-black bg-[#F5C518] p-3 shadow-[6px_6px_0_0_#000]">
      <div className="relative rounded-2xl bg-white">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
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
          onChange={(e) => onImageSelect(e.target.files?.[0])}
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
              onClick={() => onToggleType(type)}
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
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim() || selectedTypes.length === 0}
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
  );
}