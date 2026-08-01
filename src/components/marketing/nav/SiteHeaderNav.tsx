"use client";

import type { HeroAudience } from "@/components/home/hero/hero-audience-content";
import {
  MarketingNavLink,
  NavActiveIndicator,
  navLinkActiveClassName,
  marketingNavLinkClassName,
} from "@/components/marketing/MarketingNavLink";
import {
  filterAudienceNavForHost,
  filterPrimaryNavForHost,
  type SiteAudienceNavTab,
} from "@/lib/marketing/site-nav";
import { cn } from "@/lib/utils";

type SiteHeaderNavProps = {
  pathname: string;
  isHomepage: boolean;
  isAkiliApex?: boolean;
  activeAudience?: HeroAudience;
  onAudienceChange?: (audience: HeroAudience) => void;
};

/**
 * Flat SaaS header nav (B2B fintech pattern):
 * Audience destinations → product links → never overlap via shrink/overflow.
 * Desktop chrome starts at xl so logo + links + CTA have room.
 */
export function SiteHeaderNav({
  pathname,
  isHomepage,
  isAkiliApex = true,
  activeAudience,
  onAudienceChange,
}: SiteHeaderNavProps) {
  const audienceItems = filterAudienceNavForHost(isAkiliApex);
  const primaryItems = filterPrimaryNavForHost(isAkiliApex);

  return (
    <nav
      className="hidden min-w-0 items-center justify-center xl:flex"
      aria-label="Main navigation"
    >
      <ul className="flex items-center gap-0.5">
        {audienceItems.map((item) => {
          if (item.kind === "tab") {
            const tab = item as SiteAudienceNavTab;
            const pathActive =
              !isHomepage &&
              (pathname === tab.href || pathname.startsWith(`${tab.href}/`));
            const isActive =
              (isHomepage && activeAudience === tab.id) || pathActive;

            if (isHomepage && onAudienceChange) {
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    id={`site-nav-tab-${tab.id}`}
                    aria-pressed={isActive}
                    data-testid={tab.testId}
                    onClick={() => onAudienceChange(tab.id)}
                    className={cn(
                      marketingNavLinkClassName,
                      isActive && navLinkActiveClassName,
                    )}
                  >
                    {tab.label}
                    {isActive ? <NavActiveIndicator /> : null}
                  </button>
                </li>
              );
            }

            return (
              <li key={tab.id}>
                <MarketingNavLink
                  href={tab.href}
                  data-testid={tab.testId}
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                </MarketingNavLink>
              </li>
            );
          }

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.id}>
              <MarketingNavLink
                href={item.href}
                data-testid={item.testId}
                isActive={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </MarketingNavLink>
            </li>
          );
        })}
      </ul>

      {/* Tenant hosts drop every platform link, so the divider goes too. */}
      {primaryItems.length > 0 ? (
        <span className="mx-3 h-4 w-px shrink-0 bg-border/60" aria-hidden />
      ) : null}

      <ul className="flex items-center gap-0.5">
        {primaryItems.map(({ href, label }) => {
          const isActive =
            href === "/docs"
              ? pathname === "/docs" || pathname.startsWith("/docs/")
              : pathname === href;
          return (
            <li key={href}>
              <MarketingNavLink
                href={href}
                isActive={isActive}
                aria-current={isActive ? "page" : undefined}
                className="text-muted-foreground/90"
              >
                {label}
              </MarketingNavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
