import type { Metadata } from "next";

import { PractitionersPageContent } from "@/components/marketing/PractitionersPageContent";
import { withCanonical } from "@/lib/seo/site";

export const metadata: Metadata = withCanonical("/practitioners", {
  title: "For Practitioners",
  description:
    "Productized risk assessments for consultants, fractional executives, and client-serving professionals — under your brand, with a per-client pipeline.",
});

export default function PractitionersPage() {
  return <PractitionersPageContent />;
}
