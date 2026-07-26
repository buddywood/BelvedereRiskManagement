import {
  contactIntentPath,
  signInRolePath,
} from "@/lib/marketing/friendly-urls";

/** Marketing homepage audiences — professional buyers + workflow overview. */
export type HeroAudience = "advisors" | "overview";

export const HERO_AUDIENCE_OPTIONS: ReadonlyArray<{
  id: HeroAudience;
  label: string;
}> = [
  { id: "advisors", label: "For Advisors" },
  { id: "overview", label: "Overview" },
] as const;

export type HeroOverviewStep = {
  step: string;
  title: string;
  description: string;
};

export type HeroAudienceCopy = {
  kicker: string;
  headline: string;
  supporting: string;
  subtext?: string;
  overviewSteps?: ReadonlyArray<HeroOverviewStep>;
  primaryCta: { label: string; href: string; title: string };
  secondaryCta: { label: string; href: string; title: string };
  helperLinks: ReadonlyArray<{
    id: string;
    content: "link" | "text";
    text: string;
    href?: string;
    linkLabel?: string;
  }>;
};

export const HERO_AUDIENCE_CONTENT: Record<HeroAudience, HeroAudienceCopy> = {
  advisors: {
    kicker: "For family offices & wealth advisors",
    headline:
      "Governance intelligence for family offices, RIAs, and broker-dealers.",
    supporting:
      "Run structured personal risk profiles across households from one workspace — invite clients, score modular risk domains, and deliver prioritized recommendations. Built for single- and multi-family offices and wealth practices that need more than portfolio planning alone.",
    primaryCta: {
      label: "Advisor Sign In",
      href: signInRolePath("advisor"),
      title: "Sign in to your advisor workspace",
    },
    secondaryCta: {
      label: "Request Demo",
      href: contactIntentPath("demo"),
      title: "Request a platform demonstration",
    },
    helperLinks: [
      {
        id: "pricing",
        content: "link",
        text: "New to AKILI?",
        linkLabel: "View pricing",
        href: "/pricing",
      },
      {
        id: "signup",
        content: "link",
        text: "Ready to subscribe?",
        linkLabel: "Create advisor account",
        href: "/signup/advisor",
      },
      {
        id: "client-invite",
        content: "link",
        text: "Been invited to complete a profile?",
        linkLabel: "Start assessment",
        href: "/start",
      },
    ],
  },
  overview: {
    kicker: "How it works",
    headline: "Assess. Analyze. Act.",
    supporting:
      "Structured intake across up to ten modular risk domains — scoped and weighted per engagement — with prioritized recommendations for family offices, RIAs, and the households they serve.",
    overviewSteps: [
      {
        step: "1",
        title: "Assess",
        description:
          "Clients complete a guided profile. Family offices and RIAs choose which risk domains are in scope and manage intake from one workspace.",
      },
      {
        step: "2",
        title: "Analyze",
        description:
          "Scores across active risk domains surface succession, authority, cyber, tax, and continuity gaps.",
      },
      {
        step: "3",
        title: "Act",
        description:
          "Structured recommendations help practices and families address risks before they escalate.",
      },
    ],
    primaryCta: {
      label: "Advisor Sign In",
      href: signInRolePath("advisor"),
      title: "Sign in to your advisor workspace",
    },
    secondaryCta: {
      label: "Request Demo",
      href: contactIntentPath("demo"),
      title: "Request a platform demonstration",
    },
    helperLinks: [
      {
        id: "pricing",
        content: "link",
        text: "Evaluating for your practice?",
        linkLabel: "View pricing",
        href: "/pricing",
      },
      {
        id: "demo",
        content: "link",
        text: "Want a walkthrough?",
        linkLabel: "Request a demo",
        href: contactIntentPath("demo"),
      },
    ],
  },
};
