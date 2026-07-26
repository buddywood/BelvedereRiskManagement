import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdvisorSignupForm } from "@/components/auth/AdvisorSignupForm";
import { auth } from "@/lib/auth";
import { isAdvisorHubNavRole } from "@/lib/auth-roles";
import {
  advisorBillingDeepLink,
  parseSignupCheckoutIntent,
} from "@/lib/billing/tier-catalog";
import { organizationsSignupCopy } from "@/lib/marketing/organizations-content";
import { withCanonical } from "@/lib/seo/site";

export const metadata: Metadata = withCanonical("/signup/organization", {
  title: "Organization sign up",
  description:
    "Create an AKILI account to run a structured risk assessment for your organization.",
});

export const dynamic = "force-dynamic";

export default async function OrganizationSignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkout_plan?: string;
    checkout_cycle?: string;
  }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const checkoutIntent = parseSignupCheckoutIntent(sp);

  if (session?.user?.id && isAdvisorHubNavRole(session.user.role)) {
    redirect(
      checkoutIntent
        ? advisorBillingDeepLink(checkoutIntent.tier, checkoutIntent.billingCycle)
        : "/advisor/billing",
    );
  }

  return (
    <AdvisorSignupForm
      checkoutPlan={checkoutIntent?.tier ?? null}
      checkoutCycle={checkoutIntent?.billingCycle ?? null}
      copy={organizationsSignupCopy}
    />
  );
}
