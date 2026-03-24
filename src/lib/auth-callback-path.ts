/**
 * Post-auth redirect target: same-origin relative paths only (open-redirect safe).
 */
export function safeAfterSignInPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return fallback;
}
