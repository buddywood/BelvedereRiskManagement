/**
 * Client-safe helpers: advisor logos are often stored as direct S3 URLs while the bucket
 * is private. Browsers cannot load those in <img>; use the authenticated view route instead.
 */
export function looksLikeAdvisorBrandingS3Url(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const s3VirtualHost = host.includes('.s3.') && host.endsWith('.amazonaws.com');
    const pathOk = path.includes('/advisors/') && path.includes('/logos/');
    return s3VirtualHost && pathOk;
  } catch {
    return false;
  }
}

/** Same-origin URL that streams the current advisor logo (session required). */
export const ADVISOR_LOGO_VIEW_PATH = '/api/advisor/branding/logo/view';

export function resolveAdvisorLogoSrcForPreview(storedLogoUrl: string | null | undefined): string {
  if (!storedLogoUrl?.trim()) return '';
  const trimmed = storedLogoUrl.trim();
  if (looksLikeAdvisorBrandingS3Url(trimmed)) {
    return ADVISOR_LOGO_VIEW_PATH;
  }
  return trimmed;
}
