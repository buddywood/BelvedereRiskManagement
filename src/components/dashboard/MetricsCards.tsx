import type { DashboardMetrics } from "@/lib/dashboard/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Families</p>
          <p className="text-2xl font-semibold">{metrics.totalClients}</p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Average Score</p>
          <p className="text-2xl font-semibold">
            {metrics.averageScore?.toFixed(1) ?? 'N/A'}
            {metrics.averageScore && <span className="text-sm text-muted-foreground">/10</span>}
          </p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">High Risk</p>
          <p className={`text-2xl font-semibold ${
            metrics.highRiskCount > 0
              ? 'text-orange-600 dark:text-orange-400'
              : ''
          }`}>
            {metrics.highRiskCount}
          </p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Assessed</p>
          <p className="text-2xl font-semibold">
            {metrics.assessedCount} of {metrics.totalClients}
          </p>
        </div>
      </div>
    </div>
  );
}