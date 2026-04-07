import { requireAdvisorGovernanceDashboardEnabled } from "@/lib/platform/advisor-feature-guards";

export default async function AdvisorDashboardFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdvisorGovernanceDashboardEnabled();
  return <>{children}</>;
}
