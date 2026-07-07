import SkeletonCard from "./SkeletonCard";
import ResultCard from "./ResultCard";
import type { ContentType } from "./types";

interface ResultsGridProps {
  isGenerating: boolean;
  generatingTypes: ContentType[];
  results: Record<string, unknown> | null;
  regeneratingType: string | null;
  copiedType: string | null;
  hasImage: boolean;
  onCopy: (type: string, text: string) => void;
  onRegenerate: (type: string) => void;
  onRedirect: (type: string, text: string) => void;
  onEdit: (type: string, newValue: unknown) => void;
}

export default function ResultsGrid({
  isGenerating,
  generatingTypes,
  results,
  regeneratingType,
  copiedType,
  hasImage,
  onCopy,
  onRegenerate,
  onRedirect,
  onEdit,
}: ResultsGridProps) {
  if (isGenerating) {
    return (
      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 items-stretch gap-4 text-left sm:grid-cols-2">
        {generatingTypes.map((type) => (
          <SkeletonCard key={type} type={type} hasImage={hasImage} />
        ))}
      </div>
    );
  }

  if (!results) return null;

  return (
    <>
      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 items-stretch gap-4 text-left sm:grid-cols-2">
        {Object.entries(results).map(([type, value]) => (
          <ResultCard
            key={type}
            type={type}
            value={value}
            isRegenerating={regeneratingType === type}
            justCopied={copiedType === type}
            hasImage={hasImage}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            onRedirect={onRedirect}
            onEdit={onEdit}
          />
        ))}
      </div>

      <style jsx global>{`
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

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}