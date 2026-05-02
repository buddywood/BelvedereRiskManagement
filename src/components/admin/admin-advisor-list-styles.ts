/** Allow only values safe to embed in inline CSS (avoid injection from stored branding strings). */
export function isSafeCssColor(value: string | null | undefined): value is string {
  if (!value?.trim()) return false;
  const s = value.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return true;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/.test(s)) return true;
  return false;
}

export function pickAdvisorBrandPrimary(
  primary: string | null | undefined,
  accent: string | null | undefined
): string | undefined {
  if (isSafeCssColor(primary)) return primary.trim();
  if (isSafeCssColor(accent)) return accent.trim();
  return undefined;
}

/** Secondary column for gradients; falls back in order so two stops always exist when any brand color is set. */
export function pickAdvisorBrandSecondary(
  secondary: string | null | undefined,
  primary: string | null | undefined,
  accent: string | null | undefined
): string | undefined {
  if (isSafeCssColor(secondary)) return secondary.trim();
  if (isSafeCssColor(accent)) return accent.trim();
  if (isSafeCssColor(primary)) return primary.trim();
  return undefined;
}

export function advisorBrandInitials(brandName: string | null, firmName: string | null, displayName: string | null) {
  const label = (brandName?.trim() || firmName?.trim() || displayName?.trim() || "?").trim();
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  return label.slice(0, 2).toUpperCase() || "?";
}
