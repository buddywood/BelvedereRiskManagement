import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DemoPageContent } from "@/components/marketing/DemoPageContent";
import { getDemoExperience, isDemoAudience } from "@/lib/marketing/demo-experience";
import { withCanonical } from "@/lib/seo/site";

/** "families" lives at /demo — only the secondary audiences are nested routes. */
const NESTED_AUDIENCES = ["organizations", "practitioners"] as const;

type DemoAudienceParams = { params: Promise<{ audience: string }> };

const METADATA_DESCRIPTIONS: Record<(typeof NESTED_AUDIENCES)[number], string> = {
  organizations:
    "Answer six questions a board would recognize and watch your organization's risk profile score in real time — no signup, nothing saved.",
  practitioners:
    "Score your own practice on the methodology you would deliver to clients — six questions, real-time scoring, no signup.",
};

export function generateStaticParams() {
  return NESTED_AUDIENCES.map((audience) => ({ audience }));
}

export async function generateMetadata({
  params,
}: DemoAudienceParams): Promise<Metadata> {
  const { audience } = await params;
  if (!isDemoAudience(audience) || audience === "families") {
    return withCanonical("/demo", { title: "Interactive Demo" });
  }

  const experience = getDemoExperience(audience);

  return withCanonical(experience.path, {
    title: `Interactive Demo — ${experience.navLabel}`,
    description: METADATA_DESCRIPTIONS[audience],
  });
}

export default async function DemoAudiencePage({ params }: DemoAudienceParams) {
  const { audience } = await params;

  // Keep a single canonical URL for the default audience.
  if (audience === "families") redirect("/demo");
  if (!isDemoAudience(audience)) notFound();

  return <DemoPageContent audience={audience} />;
}
