import type { AdvisorBrandingData } from "@/lib/validation/branding";

export const CLIENT_ADVISOR_LOGO_PATH = "/api/client/advisor-logo";

/** Logo URL for `<img src>` in the client portal (S3 proxy or public HTTPS). */
export function clientPortalLogoImgSrc(branding: AdvisorBrandingData): string | null {
  if (branding.logoS3Key) {
    return CLIENT_ADVISOR_LOGO_PATH;
  }
  const url = branding.logoUrl?.trim();
  if (url?.startsWith("https://")) {
    return url;
  }
  return null;
}

/**
 * Header / portal display name — must match `(protected)/layout` `brandTitle`.
 *
 * Prefer **`advisorFirmName` (`firmName`)** over **`brandName`**: admin and profile
 * edits update `firmName` first; `brandName` is mirrored on branding saves and can
 * otherwise keep a stale seed value. If only `brandName` is set, use it.
 */
export function clientPortalBrandingDisplayTitle(branding: AdvisorBrandingData): string {
  const firm = branding.advisorFirmName?.trim() ?? "";
  const brand = branding.brandName?.trim() ?? "";
  if (firm) return firm;
  if (brand) return brand;
  return "Partner portal";
}
