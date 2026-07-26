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
  SITE_PRIMARY_NAV_LINKS,
  type SiteAudienceNavItem,
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

function AudienceTabItem({
  id,
  label,
  testId,
  href,
  isHomepage,
  isActive,
  onAudienceChange,
}: {
  id: HeroAudience;
  label: string;
  testId: string;
  href: string;
  isHomepage: boolean;
  isActive: boolean;
  onAudienceChange?: (audience: HeroAudience) => void;
}) {
  if (isHomepage && onAudienceChange) {
    return (
      <button
        type="button"
        role="tab"
        id={`site-nav-tab-${id}`}
        aria-selected={isActive}
        aria-controls="landing-hero-panel"
        tabIndex={isActive ? 0 : -1}
        data-testid={testId}
        onClick={() => onAudienceChange(id)}
        className={cn(
          marketingNavLinkClassName,
          isActive && navLinkActiveClassName,
        )}
      >
        {label}
        {isActive ? <NavActiveIndicator /> : null}
      </button>
    );
  }

  return (
    <MarketingNavLink href={href} data-testid={testId}>
      {label}
    </MarketingNavLink>
  );
}

/** Group consecutive same-kind items so tablists never contain link children. */
function groupAudienceNavItems(
  items: ReadonlyArray<SiteAudienceNavItem>,
): Array<{ kind: "tab" | "link"; items: SiteAudienceNavItem[] }> {
  const groups: Array<{ kind: "tab" | "link"; items: SiteAudienceNavItem[] }> = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.kind === item.kind) {
      last.items.push(item);
    } else {
      groups.push({ kind: item.kind, items: [item] });
    }
  }
  return groups;
}

export function SiteHeaderNav({
  pathname,
  isHomepage,
  isAkiliApex = true,
  activeAudience,
  onAudienceChange,
}: SiteHeaderNavProps) {
  const audienceItems = filterAudienceNavForHost(isAkiliApex);
  const groups = groupAudienceNavItems(audienceItems);

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-0.5">
        {groups.map((group, groupIndex) => {
          if (group.kind === "tab") {
            const tabs = group.items as SiteAudienceNavTab[];
            return (
              <div
                key={`tab-group-${groupIndex}`}
                className="flex items-center gap-0.5"
                role={isHomepage ? "tablist" : undefined}
                aria-label={isHomepage ? "Choose your path" : undefined}
              >
                {tabs.map(({ id, label, testId, href }) => (
                  <AudienceTabItem
                    key={id}
                    id={id}
                    label={label}
                    testId={testId}
                    href={href}
                    isHomepage={isHomepage}
                    isActive={isHomepage && activeAudience === id}
                    onAudienceChange={onAudienceChange}
                  />
                ))}
              </div>
            );
          }

          return group.items.map(({ id, label, testId, href }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <MarketingNavLink
                key={id}
                href={href}
                data-testid={testId}
                isActive={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </MarketingNavLink>
            );
          });
        })}
      </div>

      <span className="mx-2 h-4 w-px bg-border/50" aria-hidden />

      {SITE_PRIMARY_NAV_LINKS.map(({ href, label }) => {
        const isActive =
          href === "/docs"
            ? pathname === "/docs" || pathname.startsWith("/docs/")
            : pathname === href;
        return (
          <MarketingNavLink
            key={href}
            href={href}
            isActive={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </MarketingNavLink>
        );
      })}
    </nav>
  );
}
