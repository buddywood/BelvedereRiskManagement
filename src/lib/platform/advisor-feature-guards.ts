import "server-only";

import { redirect } from "next/navigation";

import { getPlatformFeatureFlags } from "@/lib/platform/feature-flags";

const DISABLED_REDIRECT = "/advisor";

export async function requireAdvisorGovernanceDashboardEnabled() {
  const flags = await getPlatformFeatureFlags();
  if (!flags.governanceDashboardEnabled) {
    redirect(DISABLED_REDIRECT);
  }
}

export async function requireAdvisorRiskIntelligenceEnabled() {
  const flags = await getPlatformFeatureFlags();
  if (!flags.riskIntelligenceEnabled) {
    redirect(DISABLED_REDIRECT);
  }
}
