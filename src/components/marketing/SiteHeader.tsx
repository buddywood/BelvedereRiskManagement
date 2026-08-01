"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AkiliHeaderLockup } from "@/components/home/AkiliLogoLockup";
import { useOptionalHeroAudience } from "@/components/home/hero/HeroAudienceContext";
import type { HeroAudience } from "@/components/home/hero/hero-audience-content";
import { SiteHeaderNav } from "@/components/marketing/nav/SiteHeaderNav";
import { MarketingNavAuthActions } from "@/components/marketing/MarketingNavAuthActions";
import { MobileNavMenu } from "@/components/marketing/MobileNavMenu";
import { isMarketingHomePath } from "@/lib/marketing/friendly-urls";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
  showLogo?: boolean;
  /** When false, hide Akili-apex-only audience links (Organizations / Practitioners). */
  isAkiliApex?: boolean;
};

/**
 * B2B SaaS header: logo | nav | actions on a stable 3-column grid.
 * Full link row from xl up; hamburger below that — avoids mid-width overlap.
 */
export function SiteHeader({
  className,
  showLogo = true,
  isAkiliApex = true,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isHomepage = isMarketingHomePath(pathname);
  const heroAudience = useOptionalHeroAudience();

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 -mx-4 px-4 pt-2 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border/40",
          "bg-background/75 py-2 pl-3 pr-2 shadow-[0_10px_36px_-28px_rgba(26,24,20,0.34)]",
          "backdrop-blur-2xl backdrop-saturate-150 sm:gap-6 sm:pl-4 sm:pr-3",
        )}
      >
        {showLogo ? (
          <Link
            href="/"
            className="inline-flex shrink-0 leading-none text-foreground transition-opacity duration-200 hover:opacity-80"
            aria-label="AKILI home"
          >
            <AkiliHeaderLockup height={36} />
          </Link>
        ) : (
          <div aria-hidden className="w-px" />
        )}

        <SiteHeaderNav
          pathname={pathname}
          isHomepage={isHomepage}
          isAkiliApex={isAkiliApex}
          activeAudience={heroAudience?.audience}
          onAudienceChange={heroAudience?.setAudience}
        />

        <div className="flex items-center justify-end gap-2">
          <div className="hidden items-center xl:flex">
            <MarketingNavAuthActions />
          </div>
          <MobileNavMenu
            className="xl:hidden"
            isHomepage={isHomepage}
            isAkiliApex={isAkiliApex}
            activeAudience={heroAudience?.audience satisfies HeroAudience | undefined}
            onAudienceChange={heroAudience?.setAudience}
          />
        </div>
      </div>
    </header>
  );
}
