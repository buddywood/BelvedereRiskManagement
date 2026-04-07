import { requireAdvisorGovernanceDashboardEnabled } from "@/lib/platform/advisor-feature-guards";

/**
 * Family analytics is part of the governance dashboard surface; respect the same flag.
 */
export default async function AdvisorAnalyticsFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdvisorGovernanceDashboardEnabled();
  return <>{children}</>;
}
