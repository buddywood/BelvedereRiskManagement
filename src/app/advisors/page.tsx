import type { Metadata } from "next";

import { HomePageContent } from "@/components/marketing/HomePageContent";
import { withCanonical } from "@/lib/seo/site";

export const metadata: Metadata = withCanonical("/advisors", {
  title: "For Advisors",
  description:
    "Governance intelligence for family offices, RIAs, and broker-dealers — multi-household risk profiles, scoring, and succession guidance in one workspace.",
});

export default function AdvisorsPage() {
  return <HomePageContent initialAudience="advisors" />;
}
