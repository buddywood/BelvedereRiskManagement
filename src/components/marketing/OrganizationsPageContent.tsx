import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingPricingPreview } from "@/components/home/LandingPricingPreview";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingProseSections } from "@/components/marketing/MarketingProseSections";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { MarketingSurfaceCard } from "@/components/marketing/MarketingSurfaceCard";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { Button } from "@/components/ui/button";
import { fetchPublicTierPricing } from "@/lib/billing/public-tier-pricing";
import {
  organizationsCaseStudy,
  organizationsConfigServices,
  organizationsHero,
  organizationsHowItWorks,
  organizationsPricingCopy,
  organizationsProseSections,
  organizationsTierCopyOverrides,
  organizationsVignettes,
} from "@/lib/marketing/organizations-content";

export async function OrganizationsPageContent() {
  const { pricing } = await fetchPublicTierPricing();

  return (
    <PublicPageShell maxWidth="wide">
      <MarketingPageHero
        kicker={organizationsHero.kicker}
        title={organizationsHero.title}
        description={organizationsHero.description}
        meta={
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="min-h-12" data-testid="organizations-primary-cta">
              <Link href={organizationsHero.primaryCta.href}>
                {organizationsHero.primaryCta.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12"
              data-testid="organizations-secondary-cta"
            >
              <Link href={organizationsHero.secondaryCta.href}>
                {organizationsHero.secondaryCta.label}
              </Link>
            </Button>
          </div>
        }
      />

      <MarketingProseSections sections={organizationsProseSections} />

      <MarketingSection
        id="how-it-works"
        kicker="How it works"
        title="Assess. Visualize. Prioritize."
        description="Three steps designed for organizations without a dedicated risk team."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {organizationsHowItWorks.map((step) => (
            <MarketingSurfaceCard key={step.step} className="space-y-3">
              <p className="editorial-kicker !text-[0.625rem]">{step.step}</p>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
            </MarketingSurfaceCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        id="vignettes"
        kicker="Who it's for"
        title="Built for lean teams that still answer to a board"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {organizationsVignettes.map((vignette) => (
            <MarketingSurfaceCard key={vignette.title} as="article" className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {vignette.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">{vignette.body}</p>
            </MarketingSurfaceCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        id="case-study"
        kicker="Sample case study"
        title={organizationsCaseStudy.title}
        description={organizationsCaseStudy.practice}
      >
        <MarketingSurfaceCard as="article" className="space-y-5">
          <p className="inline-flex rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {organizationsCaseStudy.label}
          </p>
          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">The problem. </span>
              {organizationsCaseStudy.problem}
            </p>
            <p>
              <span className="font-semibold text-foreground">What they did. </span>
              {organizationsCaseStudy.whatTheyDid}
            </p>
            <p>
              <span className="font-semibold text-foreground">Outcome. </span>
              {organizationsCaseStudy.outcome}
            </p>
          </div>
        </MarketingSurfaceCard>
      </MarketingSection>

      <LandingPricingPreview
        pricing={pricing}
        title={organizationsPricingCopy.title}
        description={organizationsPricingCopy.description}
        tierCopyOverrides={organizationsTierCopyOverrides}
        showDefaultCtas={false}
        subscribeHref="/signup/organization"
        belowGrid={
          <div className="space-y-6 border-t border-border/60 pt-8">
            <div className="space-y-3">
              <p className="editorial-kicker">{organizationsConfigServices.kicker}</p>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {organizationsConfigServices.title}
              </h3>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {organizationsConfigServices.description}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {organizationsConfigServices.items.map((item) => (
                <MarketingSurfaceCard key={item.title} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </MarketingSurfaceCard>
              ))}
            </div>
            <Button asChild size="lg" className="min-h-12">
              <Link href="/signup/organization">
                Start your assessment
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      />
    </PublicPageShell>
  );
}
