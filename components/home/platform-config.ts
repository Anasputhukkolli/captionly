import {
  InstagramIcon,
  LinkedinIcon,
  FacebookIcon,
  XIcon,
} from "./platform-icons";
import type { PlatformConfig, ReelData } from "./types";

export const INSTAGRAM_CONFIG: PlatformConfig = {
  icon: InstagramIcon,
  prefill: false,
  postUrl: () => "https://www.instagram.com/create/style/",
  fallbackUrl: "https://www.instagram.com/",
};

export const LINKEDIN_CONFIG: PlatformConfig = {
  icon: LinkedinIcon,
  prefill: false,
  postUrl: () => "https://www.linkedin.com/feed/?shareActive=true",
  fallbackUrl: "https://www.linkedin.com/feed/",
};

export const FACEBOOK_CONFIG: PlatformConfig = {
  icon: FacebookIcon,
  prefill: false,
  postUrl: () => "https://www.facebook.com/",
  fallbackUrl: "https://www.facebook.com/",
};

export const X_CONFIG: PlatformConfig = {
  icon: XIcon,
  prefill: true,
  postUrl: (text) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  fallbackUrl: "https://twitter.com/",
};

// Fuzzy-matches any result key (however the API labels it) to a platform.
export function getPlatformConfig(type: string): PlatformConfig | null {
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

export function isReelType(type: string) {
  return type.toLowerCase().includes("reel");
}

// Wide cards (long-form content) span the full grid width so short cards
// next to them don't get stretched into awkward empty space.
export function isWideType(type: string) {
  const t = type.toLowerCase();
  return t.includes("reel") || t.includes("content ideas");
}

// Flattens a reel's structured data into readable plain text for copy/redirect.
export function flattenReelData(reelData: ReelData): string {
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