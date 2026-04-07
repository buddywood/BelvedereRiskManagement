import type { AdvisorBrandingData } from "@/lib/validation/branding";

/** Defaults aligned with `BrandingPreview` (dashboard / email sections). */
export const PREVIEW_DEFAULT_PRIMARY = "#1a1a2e";
export const PREVIEW_DEFAULT_SECONDARY = "#f5f5f5";
export const PREVIEW_DEFAULT_ACCENT = "#10b981";

export type PreviewBrandHex = {
  primary: string;
  secondary: string;
  accent: string;
};

/**
 * Whether a hex background reads as "dark" (for choosing disabled/hint foregrounds).
 */
export function isPreviewHexDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.45;
}

function pickHex(value: string | null | undefined, fallback: string): string {
  const v = value?.trim();
  if (v && /^#[0-9A-Fa-f]{6}$/.test(v)) {
    return v;
  }
  return fallback;
}

/**
 * Resolved brand hex for client portal / preview parity (explicit colors, not only CSS variables).
 */
export function getPreviewBrandHex(
  branding: Pick<
    AdvisorBrandingData,
    "primaryColor" | "secondaryColor" | "accentColor"
  > | null
  | undefined,
): PreviewBrandHex | null {
  if (!branding) return null;
  const primary = pickHex(branding.primaryColor, PREVIEW_DEFAULT_PRIMARY);
  const secondary = pickHex(branding.secondaryColor, PREVIEW_DEFAULT_SECONDARY);
  const accentRaw = branding.accentColor?.trim();
  const primaryRaw = branding.primaryColor?.trim();
  const accent =
    accentRaw && /^#[0-9A-Fa-f]{6}$/.test(accentRaw)
      ? accentRaw
      : primaryRaw && /^#[0-9A-Fa-f]{6}$/.test(primaryRaw)
        ? primaryRaw
        : PREVIEW_DEFAULT_ACCENT;
  return {
    primary,
    secondary,
    accent,
  };
}
