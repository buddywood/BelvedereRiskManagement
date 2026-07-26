import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingSectionBand } from "@/components/marketing/LandingSectionBand";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { PlanTierFeatureList } from "@/components/billing/PlanTierFeatureList";
import { SELF_SERVE_TIERS, TIER_CATALOG } from "@/lib/billing/tier-catalog";
import type { SelfServeTier } from "@/lib/billing/tier-catalog";
import type { PublicTierPricing } from "@/lib/billing/public-tier-pricing";
import { Button } from "@/components/ui/button";
import { MarketingSurfaceCard } from "@/components/marketing/MarketingSurfaceCard";
import { contactIntentPath } from "@/lib/marketing/friendly-urls";

export type TierCopyOverride = {
  tagline?: string;
  modules?: string;
  cardIncludes?: readonly string[];
  cardExcludes?: readonly string[];
};

type LandingPricingPreviewProps = {
  pricing?: PublicTierPricing[];
  title?: string;
  description?: string;
  tierCopyOverrides?: Partial<Record<SelfServeTier, TierCopyOverride>>;
  /** Optional block rendered below the tier grid (e.g. config-as-a-service). */
  belowGrid?: ReactNode;
  /** Hide the default homepage CTAs when embedding on audience pages. */
  showDefaultCtas?: boolean;
  subscribeHref?: string;
};

export function LandingPricingPreview({
  pricing = [],
  title = "Modular tiers that grow with your practice",
  description = "Four module tiers from structured assessments through portfolio analytics — compare what's included before you subscribe.",
  tierCopyOverrides,
  belowGrid,
  showDefaultCtas = true,
  subscribeHref = "/pricing",
}: LandingPricingPreviewProps) {
  const rows = pricing ?? [];
  const essentials = rows.find((row) => row.tier === "ESSENTIALS");
  const startingMonthly = essentials?.monthly?.display ?? null;

  return (
    <LandingSectionBand variant="inset">
      <MarketingSection
        id="pricing"
        kicker="Pricing"
        title={title}
        description={description}
        className="!space-y-8"
      >
        {startingMonthly ? (
          <p className="-mt-4 text-sm text-muted-foreground">
            From{" "}
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {startingMonthly}
            </span>
            <span className="text-muted-foreground"> /mo</span>
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SELF_SERVE_TIERS.map((tier) => {
            const catalog = TIER_CATALOG[tier];
            const override = tierCopyOverrides?.[tier];
            return (
              <MarketingSurfaceCard key={tier} className="flex h-full flex-col space-y-3">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {catalog.name}
                </h3>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {override?.modules ?? catalog.modules}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {override?.tagline ?? catalog.tagline}
                </p>
                <PlanTierFeatureList
                  tier={tier}
                  variant="minimal"
                  className="mt-auto pt-1"
                  cardIncludesOverride={override?.cardIncludes}
                  cardExcludesOverride={override?.cardExcludes}
                />
              </MarketingSurfaceCard>
            );
          })}
        </div>

        {belowGrid}

        {showDefaultCtas ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-12">
              <Link href={subscribeHref}>
                View plans & subscribe
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12">
              <Link href={contactIntentPath("enterprise")}>Enterprise pricing</Link>
            </Button>
          </div>
        ) : null}
      </MarketingSection>
    </LandingSectionBand>
  );
}
