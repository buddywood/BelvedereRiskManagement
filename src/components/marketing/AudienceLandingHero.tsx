import Link from "next/link";
import { ArrowRight, ClipboardCheck, LineChart, ListChecks, type LucideIcon } from "lucide-react";

import { HeroFeatureCard } from "@/components/home/hero/HeroFeatureCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AudienceLandingHeroProps = {
  kicker: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  primaryTestId?: string;
  secondaryTestId?: string;
  features: ReadonlyArray<{
    title: string;
    description: string;
    icon?: LucideIcon;
  }>;
  sampleLinkLabel?: string;
  className?: string;
};

const DEFAULT_FEATURE_ICONS: LucideIcon[] = [ClipboardCheck, LineChart, ListChecks];

export function AudienceLandingHero({
  kicker,
  title,
  description,
  primaryCta,
  secondaryCta,
  primaryTestId,
  secondaryTestId,
  features,
  sampleLinkLabel = "See sample platform output ↓",
  className,
}: AudienceLandingHeroProps) {
  return (
    <section
      className={cn(
        "hero-surface app-grid overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <p className="editorial-kicker">{kicker}</p>
          <h1 className="text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="min-h-12 w-full sm:w-auto sm:min-w-[12rem]">
            <Link href={primaryCta.href} data-testid={primaryTestId}>
              {primaryCta.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-h-12 w-full sm:w-auto sm:min-w-[10rem]"
          >
            <Link href={secondaryCta.href} data-testid={secondaryTestId}>
              {secondaryCta.label}
            </Link>
          </Button>
        </div>

        <ul
          className="grid w-full gap-4 text-left sm:grid-cols-3"
          aria-label="Platform capabilities"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon ?? DEFAULT_FEATURE_ICONS[index % DEFAULT_FEATURE_ICONS.length];
            return (
              <li key={feature.title}>
                <HeroFeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={Icon}
                  className="h-full"
                />
              </li>
            );
          })}
        </ul>

        <Link
          href="#platform-preview"
          className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {sampleLinkLabel}
        </Link>
      </div>
    </section>
  );
}
