import { isWideType } from "./platform-config";
import GeneratingStatus from "./GeneratingStatus";

export default function SkeletonCard({
  type,
  hasImage,
}: {
  type: string;
  hasImage?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] ${
        isWideType(type) ? "sm:col-span-2" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between border-b border-black/10 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">
          {type}
        </p>
      </div>
      <GeneratingStatus type={type} hasImage={hasImage} />
    </div>
  );
}