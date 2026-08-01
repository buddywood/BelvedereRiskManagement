import type { Metadata } from "next";

import { OrganizationsPageContent } from "@/components/marketing/OrganizationsPageContent";
import { withCanonical } from "@/lib/seo/site";

export const metadata: Metadata = withCanonical("/organizations", {
  title: "For Organizations",
  description:
    "Structured risk assessment for small businesses, non-profits, and NGOs — without hiring a risk team. Board-ready deliverables in one methodology.",
});

export default function OrganizationsPage() {
  return <OrganizationsPageContent />;
}
