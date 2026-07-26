import Link from "next/link";
import { ClipboardCheck, LineChart, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { InteractiveDemo } from "@/components/marketing/demo/InteractiveDemo";
import { LandingSectionBand } from "@/components/marketing/LandingSectionBand";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { Button } from "@/components/ui/button";
import {
  getDemoExperience,
  listDemoExperiences,
  type DemoAudience,
} from "@/lib/marketing/demo-experience";
import { cn } from "@/lib/utils";

const FULL_ASSESSMENT_STEPS: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: ClipboardCheck,
    title: "Every domain, not six questions",
    description:
      "A live engagement works through the full domain catalog, with branching that follows your actual circumstances rather than a fixed sample.",
  },
  {
    icon: LineChart,
    title: "Scored on your methodology",
    description:
      "Domain selection, weighting, and risk thresholds are configurable — the score reflects how your firm defines risk, not a generic benchmark.",
  },
  {
    icon: ListChecks,
    title: "A plan, not just a number",
    description:
      "Findings become a sequenced remediation plan with owners and priorities, delivered as a branded report you can work through session by session.",
  },
];

export async function DemoPageContent({
  audience = "families",
}: {
  audience?: DemoAudience;
}) {
  const experience = getDemoExperience(audience);
  const variants = listDemoExperiences();

  return (
    <PublicPageShell
      maxWidth="full"
      className="space-y-0"
      contentClassName="flex flex-col gap-14 sm:gap-20 lg:gap-24 space-y-0"
    >
      <section className="hero-surface app-grid overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="space-y-4">
            <p className="editorial-kicker">{experience.kicker}</p>
            <h1 className="text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl">
              {experience.title}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {experience.description}
            </p>
          </div>

          <nav aria-label="Demo audience" className="w-full">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {variants.map((variant) => {
                const isActive = variant.audience === experience.audience;
                return (
                  <li key={variant.audience}>
                    <Link
                      href={variant.path}
                      aria-current={isActive ? "page" : undefined}
                      data-testid={`demo-variant-${variant.audience}`}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                        isActive
                          ? "border-brand/70 bg-brand/10 text-foreground"
                          : "border-border/70 bg-background/60 text-muted-foreground hover:border-brand/50 hover:text-foreground",
                      )}
                    >
                      {variant.navLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <InteractiveDemo experience={experience} />

      <LandingSectionBand variant="inset">
        <MarketingSection
          id="beyond-the-demo"
          kicker="Beyond the demo"
          title="What a full assessment adds"
          description="The sample above uses the real scoring rubric on a deliberately short slice. An engagement goes considerably further."
          className="!space-y-8"
          headerClassName="max-w-2xl"
        >
          <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
            {FULL_ASSESSMENT_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex flex-col gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-12 sm:min-w-[13rem]">
              <Link href={experience.selfServeCta.href}>
                {experience.selfServeCta.label}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 sm:min-w-[11rem]"
            >
              <Link href={experience.salesCta.href}>
                {experience.salesCta.label}
              </Link>
            </Button>
          </div>
        </MarketingSection>
      </LandingSectionBand>
    </PublicPageShell>
  );
}
