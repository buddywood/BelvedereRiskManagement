import { Suspense } from "react";
import { getGovernanceDashboardData } from "@/lib/actions/advisor-actions";
import { GovernanceTable } from "@/components/dashboard/GovernanceTable";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dashboard skeleton for streaming fallback
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="hero-surface rounded-lg p-4">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
            {/* Table rows */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-6 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Async component for data-dependent content
async function DashboardContent() {
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
    <div className="space-y-6">
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

export default function AdvisorGovernanceDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero section - static content that renders immediately */}
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

      {/* Data-dependent content with Suspense streaming */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}