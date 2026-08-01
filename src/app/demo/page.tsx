import type { Metadata } from "next";

import { DemoPageContent } from "@/components/marketing/DemoPageContent";
import { withCanonical } from "@/lib/seo/site";

export const metadata: Metadata = withCanonical("/demo", {
  title: "Interactive Demo",
  description:
    "Answer six questions from the live household assessment and watch your risk profile score in real time — no signup, nothing saved.",
});

export default function DemoPage() {
  return <DemoPageContent audience="families" />;
}
