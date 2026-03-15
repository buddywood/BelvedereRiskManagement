import { getGovernanceDashboardData } from "@/lib/actions/advisor-actions";
import { GovernanceTable } from "@/components/dashboard/GovernanceTable";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdvisorGovernanceDashboardPage() {
  const result = await getGovernanceDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">Error loading governance dashboard: {result.error}</p>
        </div>
      </div>
    );
  }

  const { clients, metrics, profile } = result.data!;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero section */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="space-y-2 sm:space-y-3">
          <p className="editorial-kicker">Governance Intelligence</p>
          <h2 className="text-3xl font-semibold text-balance sm:text-5xl">
            Family Governance Dashboard
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Monitor governance scores, assess risk levels, and track assessment progress
            across your assigned client families from a unified intelligence dashboard.
          </p>
        </div>
      </section>

      {/* Metrics cards */}
      <MetricsCards metrics={metrics} />

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Family Portfolio</CardTitle>
          <CardDescription>
            View governance scores, risk levels, and assessment status for all assigned families.
            Click column headers to sort data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GovernanceTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}