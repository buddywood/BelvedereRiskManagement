import Link from "next/link";
import { ArrowRight, ClipboardCheck, LineChart, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AudienceLandingHero } from "@/components/marketing/AudienceLandingHero";
import { LandingPricingPreview } from "@/components/home/LandingPricingPreview";
import { LandingProductPreview } from "@/components/marketing/LandingProductPreview";
import { LandingSectionBand } from "@/components/marketing/LandingSectionBand";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { MarketingSurfaceCard } from "@/components/marketing/MarketingSurfaceCard";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { Button } from "@/components/ui/button";
import { fetchPublicTierPricing } from "@/lib/billing/public-tier-pricing";
import {
  organizationsCaseStudy,
  organizationsConfigServices,
  organizationsHero,
  organizationsHeroFeatures,
  organizationsHowItWorks,
  organizationsPricingCopy,
  organizationsTierCopyOverrides,
  organizationsVignettes,
} from "@/lib/marketing/organizations-content";

const HOW_IT_WORKS_ICONS: LucideIcon[] = [ClipboardCheck, LineChart, ShieldCheck];

export async function OrganizationsPageContent() {
  const { pricing } = await fetchPublicTierPricing();

  return (
    <PublicPageShell
      maxWidth="full"
      className="space-y-0"
      contentClassName="flex flex-col gap-14 sm:gap-20 lg:gap-24 space-y-0"
    >
      <AudienceLandingHero
        kicker={organizationsHero.kicker}
        title={organizationsHero.title}
        description={organizationsHero.description}
        primaryCta={organizationsHero.primaryCta}
        secondaryCta={organizationsHero.secondaryCta}
        primaryTestId="organizations-primary-cta"
        secondaryTestId="organizations-secondary-cta"
        features={organizationsHeroFeatures}
        sampleLinkLabel="See sample organization output ↓"
      />

      <LandingProductPreview audience="organizations" />

      <LandingSectionBand variant="inset">
        <MarketingSection
          id="how-it-works"
          kicker="How it works"
          title="Assess. Visualize. Prioritize."
          description="Three steps designed for organizations without a dedicated risk team."
          className="!space-y-8"
          headerClassName="max-w-2xl"
        >
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {organizationsHowItWorks.map((step, index) => {
              const Icon = HOW_IT_WORKS_ICONS[index] ?? ClipboardCheck;
              return (
                <li key={step.step} className="relative md:px-2">
                  {index < organizationsHowItWorks.length - 1 ? (
                    <span
                      className="absolute top-5 hidden h-px bg-border/80 md:block md:left-[calc(50%+1.5rem)] md:w-[calc(100%-3rem)]"
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex flex-col gap-3 md:items-center md:text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-sm font-semibold tabular-nums text-foreground shadow-sm">
                      {step.step.replace(/^0/, "")}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand md:mx-auto">
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </MarketingSection>
      </LandingSectionBand>

      <MarketingSection
        id="who-its-for"
        kicker="Who it's for"
        title="Built for lean teams that still answer to a board"
        description="The same methodology wealth advisors use for households — framed for organizations assessing themselves."
        className="!space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {organizationsVignettes.map((vignette) => (
            <article key={vignette.title} className="space-y-2">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {vignette.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">{vignette.body}</p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <LandingSectionBand variant="inset">
        <MarketingSection
          id="case-study"
          kicker="Sample case study"
          title={organizationsCaseStudy.title}
          description={organizationsCaseStudy.practice}
          className="!space-y-6"
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
      </LandingSectionBand>

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
            <div className="grid gap-6 md:grid-cols-3">
              {organizationsConfigServices.items.map((item) => (
                <div key={item.title} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
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
