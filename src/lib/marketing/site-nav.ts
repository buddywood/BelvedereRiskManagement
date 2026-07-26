import type { HeroAudience } from "@/components/home/hero/hero-audience-content";
import { heroAudiencePath } from "@/lib/marketing/friendly-urls";

export type SiteAudienceNavTab = {
  kind: "tab";
  id: HeroAudience;
  label: string;
  testId: string;
  href: string;
  akiliApexOnly?: false;
};

export type SiteAudienceNavLink = {
  kind: "link";
  id: string;
  label: string;
  testId: string;
  href: string;
  akiliApexOnly?: boolean;
};

export type SiteAudienceNavItem = SiteAudienceNavTab | SiteAudienceNavLink;

export const SITE_AUDIENCE_NAV: ReadonlyArray<SiteAudienceNavItem> = [
  {
    kind: "tab",
    id: "advisors",
    label: "Advisors",
    testId: "site-nav-audience-advisors",
    href: heroAudiencePath("advisors"),
  },
  {
    kind: "link",
    id: "organizations",
    label: "Organizations",
    testId: "site-nav-audience-organizations",
    href: "/organizations",
    akiliApexOnly: true,
  },
  {
    kind: "link",
    id: "practitioners",
    label: "Practitioners",
    testId: "site-nav-audience-practitioners",
    href: "/practitioners",
    akiliApexOnly: true,
  },
  {
    kind: "tab",
    id: "overview",
    label: "How it works",
    testId: "site-nav-audience-overview",
    href: heroAudiencePath("overview"),
  },
] as const;

/** Product / company links — secondary to audience destinations. */
export const SITE_PRIMARY_NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
] as const;

export const SITE_SECONDARY_NAV_LINKS = [
  { href: "/contact", label: "Contact" },
] as const;

/** Audience nav items visible for the current host surface. */
export function filterAudienceNavForHost(
  isAkiliApex: boolean,
  items: ReadonlyArray<SiteAudienceNavItem> = SITE_AUDIENCE_NAV,
): SiteAudienceNavItem[] {
  return items.filter((item) => (isAkiliApex ? true : !item.akiliApexOnly));
}

/** @deprecated Use SITE_PRIMARY_NAV_LINKS — kept for any legacy imports during migration. */
export const SITE_NAV_LINKS = [
  ...SITE_AUDIENCE_NAV.map(({ href, label }) => ({
    href,
    label,
  })),
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
] as const;

export function audienceNavHref(audience: HeroAudience): string {
  return heroAudiencePath(audience);
}
