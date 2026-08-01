"use client";

import Link from "next/link";

type ClientPortalBrandedHeaderMarkProps = {
  brandTitle: string;
  /** HTTPS URL or same-origin proxy path (e.g. /api/client/advisor-logo) */
  logoSrc: string | null;
  /** Match advisor branding preview: primary hex for title (and link) */
  primaryHex?: string;
  homeHref?: string;
  /** Use h1 on public landing pages for SEO/accessibility */
  titleAsHeading?: boolean;
  /** Hide text title when logo is present (cleaner white-label look) */
  logoOnly?: boolean;
};

/**
 * Client portal header mark: optional logo + advisor brand title (replaces Akili lockup when assigned advisor has branding).
 */
export function ClientPortalBrandedHeaderMark({
  brandTitle,
  logoSrc,
  primaryHex,
  homeHref = "/dashboard",
  titleAsHeading = false,
  logoOnly = false,
}: ClientPortalBrandedHeaderMarkProps) {
  const TitleTag = titleAsHeading ? "h1" : "span";
  const showTitle = !logoOnly || !logoSrc;

  return (
    <Link
      href={homeHref}
      className="block text-foreground"
      aria-label={`${brandTitle} home`}
      style={primaryHex ? { color: primaryHex } : undefined}
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={logoOnly ? brandTitle : ""}
            className="h-10 w-auto max-w-[180px] object-contain object-left sm:h-12 sm:max-w-[240px]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        {showTitle ? (
          <TitleTag
            className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl"
            style={primaryHex ? { color: primaryHex } : undefined}
          >
            {brandTitle}
          </TitleTag>
        ) : null}
      </div>
    </Link>
  );
}
