import { Briefcase, Building2, Landmark, Palette, Scale, Sparkles } from "lucide-react";
import { MarketingSection } from "@/components/marketing/MarketingSection";

const AUDIENCES = [
  {
    title: "Family offices",
    description:
      "Standardize governance and continuity risk across the family enterprise and its principals.",
    icon: Landmark,
  },
  {
    title: "RIAs & wealth managers",
    description: "Productize personal risk reviews beyond portfolio planning.",
    icon: Building2,
  },
  {
    title: "Broker-dealers",
    description:
      "Deliver a consistent risk methodology across private-client teams and branches.",
    icon: Briefcase,
  },
  {
    title: "Estate & succession partners",
    description: "Evidence-based succession and authority assessment alongside the advisory team.",
    icon: Scale,
  },
] as const;

const TRUST_POINTS = [
  {
    title: "Private by design",
    description: "Encrypted responses, practice-controlled visibility.",
    icon: Scale,
  },
  {
    title: "Structured methodology",
    description: "Governed risk domains — not a generic survey.",
    icon: Briefcase,
  },
  {
    title: "Your domains, your questions",
    description:
      "Customize risk domains and assessment questions to match how your practice defines risk — not a one-size survey.",
    icon: Palette,
  },
  {
    title: "Action-oriented",
    description: "Prioritized risks and tailored recommendations.",
    icon: Sparkles,
  },
] as const;

export function LandingOutcomesSection() {
  return (
    <MarketingSection
      id="who-its-for"
      kicker="Who it's for"
      title="One platform for offices and wealth practices."
      description="AKILI gives family offices, RIAs, and broker-dealers a shared system of record for household governance risk — discreet for clients, structured for professional delivery."
      className="!space-y-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Built for
          </p>
          <ul className="space-y-4">
            {AUDIENCES.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5 border-t border-border/60 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Why practices trust AKILI
          </p>
          <ul className="space-y-4">
            {TRUST_POINTS.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MarketingSection>
  );
}
