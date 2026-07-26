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
  practitionersCaseStudy,
  practitionersConfigServices,
  practitionersHero,
  practitionersHowItWorks,
  practitionersPricingCopy,
  practitionersProseSections,
  practitionersVignettes,
} from "@/lib/marketing/practitioners-content";

export async function PractitionersPageContent() {
  const { pricing } = await fetchPublicTierPricing();

  return (
    <PublicPageShell maxWidth="wide">
      <MarketingPageHero
        kicker={practitionersHero.kicker}
        title={practitionersHero.title}
        description={practitionersHero.description}
        meta={
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="min-h-12" data-testid="practitioners-primary-cta">
              <Link href={practitionersHero.primaryCta.href}>
                {practitionersHero.primaryCta.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12"
              data-testid="practitioners-secondary-cta"
            >
              <Link href={practitionersHero.secondaryCta.href}>
                {practitionersHero.secondaryCta.label}
              </Link>
            </Button>
          </div>
        }
      />

      <MarketingProseSections sections={practitionersProseSections} />

      <MarketingSection
        id="how-it-works"
        kicker="How it works"
        title="Onboard. Score. Deliver under your brand."
        description="The same advisor-tenant workflow — framed for consultants and fractional executives."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {practitionersHowItWorks.map((step) => (
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
        title="Productize the assessment you already deliver"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {practitionersVignettes.map((vignette) => (
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
        title={practitionersCaseStudy.title}
        description={practitionersCaseStudy.practice}
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
            <div className="grid gap-4 md:grid-cols-3">
              {practitionersConfigServices.items.map((item) => (
                <MarketingSurfaceCard key={item.title} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </MarketingSurfaceCard>
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
