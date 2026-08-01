import type { LegalSection } from "@/lib/legal/documents";

export const practitionersHero = {
  kicker: "For consultants, fractional executives, and client-serving professionals",
  title: "Add a productized risk assessment to your practice.",
  description:
    "One methodology you control, your branding, a per-client pipeline. Assessments that go out under your name and deliverables you can produce for the whole book instead of hand-building per engagement.",
  primaryCta: {
    label: "Create your practitioner workspace",
    href: "/signup/practitioner",
  },
  secondaryCta: {
    label: "Try the demo",
    href: "/demo/practitioners",
  },
} as const;

export const practitionersHeroFeatures = [
  {
    title: "Your pillars, your questions",
    description:
      "Map a differentiated framework into Akili — custom pillars and questions, same per-client pipeline.",
  },
  {
    title: "Your brand, your portal",
    description:
      "White-label reports and a client portal under your subdomain so Akili stays invisible.",
  },
  {
    title: "Per-client pipeline",
    description:
      "Invite, facilitate, score, and deliver across your book with comparable maturity scores.",
  },
] as const;

export const practitionersProseSections: LegalSection[] = [
  {
    id: "the-problem",
    title: "The problem",
    paragraphs: [
      "Independent consultants and fractional executives already deliver risk assessment as a service. What most of them do not have is a productized methodology behind it. Each engagement starts from a blank Google Doc — a framework the consultant has cobbled together over years, defensible but hand-assembled, with deliverables produced in a slide deck written by hand. The engagement is billable, but the margin is capped by how much bespoke work each client requires.",
      "The consequences are quiet. Fewer clients per year than the consultant could otherwise serve. Deliverables that vary in shape across engagements, making the methodology harder to demonstrate to a prospective client. Reports that require design work to look like they came from a real practice. And a persistent gap between the consultant's real expertise and the artifact the client actually receives.",
    ],
  },
  {
    id: "the-akili-approach",
    title: "The Akili approach",
    paragraphs: [
      "Akili gives the practitioner a productized methodology under their own brand. A per-client pipeline. Custom pillars and questions if the practitioner has a differentiated framework. Branded reports that come out of the platform under the practitioner's name and domain. The result: more clients at the same margin, more consistent deliverables across the book, and a demonstrable methodology that helps close the next engagement.",
      "The multi-tenant architecture behind this is the same one Akili built for the wealth-advisor market. A practitioner is a tenant; their business clients live in the pipeline. The tenancy model, the client-management workflow, the branded portal, and the custom-methodology tooling all exist today, unchanged. From the practitioner's perspective, Akili is a productized version of the workflow they already run — with the assessment framework and the reporting stack already built.",
    ],
  },
];

export const practitionersHowItWorks = [
  {
    step: "01",
    title: "Onboard the client",
    description:
      "Invite each client into your workspace. They complete the assessment against your methodology; you can preview or facilitate the intake.",
  },
  {
    step: "02",
    title: "Score and prioritize",
    description:
      "Every client is scored on the same methodology, comparable across your book. Recommendations are ranked by impact and effort.",
  },
  {
    step: "03",
    title: "Deliver under your brand",
    description:
      "Reports export under your firm's branding, with your subdomain and your logo. The client sees your practice; Akili is invisible.",
  },
] as const;

export const practitionersVignettes = [
  {
    title: "A fractional CISO with a book of business clients",
    body: "An independent fractional Chief Information Security Officer serving eight mid-sized business clients across professional services, healthcare, and light manufacturing. Every engagement previously started from a blank framework — defensible but hand-assembled per client. Akili gives a per-client pipeline in a branded workspace, one methodology across every client, and reports that export under their own brand.",
  },
  {
    title: "A tax professional adding risk advisory",
    body: "A mid-sized tax and accounting practice whose clients increasingly ask for advisory beyond tax — succession, insurance adequacy, cyber posture, key-person continuity. Akili gives the practice a productized risk assessment they can offer under their own brand, without hiring specialist staff.",
  },
  {
    title: "An independent compliance consultant",
    body: "A solo compliance consultant helping small and mid-sized organizations prepare for SOC 2, HIPAA, or grant-specific control frameworks. Akili gives a per-client workspace with the framework mapped into the pillar structure, so each engagement starts from a working template rather than a blank sheet.",
  },
] as const;

export const practitionersCaseStudy = {
  label: "Illustrative",
  title: "Marta Kessler — Kessler Fractional Security",
  practice:
    "Solo fractional CISO practice. Five ongoing business clients, one new engagement per quarter.",
  problem:
    "Every client engagement started from a Google Doc template built over ten years — defensible but bespoke per client. Report production took roughly forty hours per engagement. Two prospective clients walked because a comparable sample deliverable could not be produced fast enough.",
  whatTheyDid:
    "Marta configured her existing methodology into Akili's pillar structure over a two-week onboarding, then migrated her five active clients into the workspace. New engagements use the Akili-hosted pipeline with her branding; she facilitates the intake in a working session rather than authoring the assessment by hand.",
  outcome:
    "Report production dropped from roughly forty hours to eight hours per engagement. Marta added three new clients in the following two quarters — a 60% increase in book size — at unchanged margins. Total setup time: roughly twenty-five hours across two weeks.",
} as const;

export const practitionersPricingCopy = {
  title: "Per-seat tiers for client-serving practices",
  description:
    "The same self-serve module tiers advisors use — framed for consultants and fractional executives running assessments on behalf of a book of clients.",
} as const;

export const practitionersConfigServices = {
  kicker: "Optional services",
  title: "Need help configuring white-label?",
  description:
    "White-label configuration is available as a paid engagement on top of your subscription. Akili helps map your methodology into the pillar structure, set branding, and get your first client pipeline live.",
  items: [
    {
      title: "White-label setup",
      body: "Branding, subdomain, portal theme, and report templates configured for your practice.",
    },
    {
      title: "Methodology mapping",
      body: "Your existing framework mapped into Akili's pillar structure so engagements start from your template.",
    },
    {
      title: "Ongoing Advisory",
      body: "Retainer support for methodology refresh and client onboarding. Contact for pricing.",
    },
  ],
} as const;

export const practitionersSignupCopy = {
  eyebrow: "Practitioner workspace",
  title: "Create your practitioner account",
  description:
    "Register to run productized risk assessments under your brand. We'll email you a confirmation link before checkout.",
  organizationLabel: "Practice name",
  organizationPlaceholder: "Kessler Fractional Security",
} as const;
