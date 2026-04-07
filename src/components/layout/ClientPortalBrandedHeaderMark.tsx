"use client";

import Link from "next/link";

type ClientPortalBrandedHeaderMarkProps = {
  brandTitle: string;
  /** HTTPS URL or same-origin proxy path (e.g. /api/client/advisor-logo) */
  logoSrc: string | null;
  /** Match advisor branding preview: primary hex for title (and link) */
  primaryHex?: string;
};

/**
 * Client portal header mark: optional logo + advisor brand title (replaces Akili lockup when assigned advisor has branding).
 */
export function ClientPortalBrandedHeaderMark({
  brandTitle,
  logoSrc,
  primaryHex,
}: ClientPortalBrandedHeaderMarkProps) {
  return (
    <Link
      href="/dashboard"
      className="block text-foreground"
      aria-label={`${brandTitle} home`}
      style={primaryHex ? { color: primaryHex } : undefined}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt=""
            className="h-10 w-auto max-w-[200px] object-contain object-left"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <span
          className="text-lg font-semibold tracking-tight"
          style={primaryHex ? { color: primaryHex } : undefined}
        >
          {brandTitle}
        </span>
      </div>
    </Link>
  );
}
