export const CONTENT_TYPES = [
  "Instagram caption",
  "LinkedIn post",
  "Facebook caption",
  "X post",
  "Hashtags",
  "Reel script",
  "Content ideas",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export interface ReelScene {
  scene?: number;
  duration?: string;
  visual?: string;
  voiceover?: string;
}

export interface ReelData {
  hook?: string;
  scenes?: ReelScene[];
  cta?: string;
}

export type PlatformIcon = React.ComponentType<{ className?: string }>;

export type PlatformConfig = {
  icon: PlatformIcon;
  prefill: boolean;
  postUrl: (text: string) => string;
  fallbackUrl: string;
};