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
  practitionersCaseStudy,
  practitionersConfigServices,
  practitionersHero,
  practitionersHeroFeatures,
  practitionersHowItWorks,
  practitionersPricingCopy,
  practitionersVignettes,
} from "@/lib/marketing/practitioners-content";

const HOW_IT_WORKS_ICONS: LucideIcon[] = [ClipboardCheck, LineChart, ShieldCheck];

export async function PractitionersPageContent() {
  const { pricing } = await fetchPublicTierPricing();

  return (
    <PublicPageShell
      maxWidth="full"
      className="space-y-0"
      contentClassName="flex flex-col gap-14 sm:gap-20 lg:gap-24 space-y-0"
    >
      <AudienceLandingHero
        kicker={practitionersHero.kicker}
        title={practitionersHero.title}
        description={practitionersHero.description}
        primaryCta={practitionersHero.primaryCta}
        secondaryCta={practitionersHero.secondaryCta}
        primaryTestId="practitioners-primary-cta"
        secondaryTestId="practitioners-secondary-cta"
        features={practitionersHeroFeatures}
        sampleLinkLabel="See sample practitioner output ↓"
      />

      <LandingProductPreview audience="practitioners" />

      <LandingSectionBand variant="inset">
        <MarketingSection
          id="how-it-works"
          kicker="How it works"
          title="Onboard. Score. Deliver under your brand."
          description="The same advisor-tenant workflow — framed for consultants and fractional executives."
          className="!space-y-8"
          headerClassName="max-w-2xl"
        >
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {practitionersHowItWorks.map((step, index) => {
              const Icon = HOW_IT_WORKS_ICONS[index] ?? ClipboardCheck;
              return (
                <li key={step.step} className="relative md:px-2">
                  {index < practitionersHowItWorks.length - 1 ? (
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
        title="Productize the assessment you already deliver"
        description="One methodology across your book — branded reports that look like they came from your practice."
        className="!space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {practitionersVignettes.map((vignette) => (
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
          title={practitionersCaseStudy.title}
          description={practitionersCaseStudy.practice}
          className="!space-y-6"
        >
          <MarketingSurfaceCard as="article" className="space-y-5">
            <p className="inline-flex rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {practitionersCaseStudy.label}
            </p>
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">The problem. </span>
                {practitionersCaseStudy.problem}
              </p>
              <p>
                <span className="font-semibold text-foreground">What they did. </span>
                {practitionersCaseStudy.whatTheyDid}
              </p>
              <p>
                <span className="font-semibold text-foreground">Outcome. </span>
                {practitionersCaseStudy.outcome}
              </p>
            </div>
          </MarketingSurfaceCard>
        </MarketingSection>
      </LandingSectionBand>

      <LandingPricingPreview
        pricing={pricing}
        title={practitionersPricingCopy.title}
        description={practitionersPricingCopy.description}
        showDefaultCtas={false}
        subscribeHref="/signup/practitioner"
        belowGrid={
          <div className="space-y-6 border-t border-border/60 pt-8">
            <div className="space-y-3">
              <p className="editorial-kicker">{practitionersConfigServices.kicker}</p>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {practitionersConfigServices.title}
              </h3>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {practitionersConfigServices.description}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {practitionersConfigServices.items.map((item) => (
                <div key={item.title} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="min-h-12">
              <Link href="/signup/practitioner">
                Create your practitioner workspace
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      />
    </PublicPageShell>
  );
}
