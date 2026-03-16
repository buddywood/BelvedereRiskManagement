import { Suspense } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";

import { getClientPipelineData } from "@/lib/actions/pipeline-actions";
import { PipelineView } from "./PipelineView";
import PipelineLoading from "./loading";

// Metrics summary component
function MetricsSummary({ metrics }: { metrics: any }) {
  const metricCards = [
    { label: 'Invited', count: metrics.byStage.INVITED, color: 'bg-blue-50' },
    { label: 'Registered', count: metrics.byStage.REGISTERED, color: 'bg-indigo-50' },
    { label: 'Intake', count: metrics.byStage.INTAKE_IN_PROGRESS, color: 'bg-amber-50' },
    { label: 'Assessment', count: metrics.byStage.ASSESSMENT_IN_PROGRESS, color: 'bg-orange-50' },
    { label: 'Documents', count: metrics.byStage.DOCUMENTS_REQUIRED, color: 'bg-yellow-50' },
    { label: 'Complete', count: metrics.byStage.COMPLETE, color: 'bg-green-50' },
    { label: 'Stalled', count: metrics.stalled, color: 'bg-red-50' },
    { label: 'Total', count: metrics.total, color: 'bg-gray-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {metricCards.map((metric) => (
        <div key={metric.label} className={`rounded-md ${metric.color} px-3 py-2 text-center`}>
          <p className="text-lg font-semibold">{metric.count}</p>
          <p className="text-xs text-muted-foreground">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}

// Async component for data-dependent content
async function PipelineContent() {
  const result = await getClientPipelineData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">
            Error loading pipeline data: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const { clients, metrics, profile } = result.data!;

  return (
    <div className="space-y-6">
      {/* Metrics summary */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Pipeline Overview
        </h2>
        <MetricsSummary metrics={metrics} />
      </div>

      {/* Pipeline view with real-time updates */}
      <PipelineView initialClients={clients} initialMetrics={metrics} />
    </div>
  );
}

export default function PipelinePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero section - static content that renders immediately */}
      <section className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <p className="editorial-kicker">Client workflow</p>
        </div>
        <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
          Client Pipeline
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          Track client workflow progression and manage document requirements across all stages
          of the advisory process.
        </p>
      </section>

      {/* Quick navigation */}
      <div className="flex justify-center">
        <Link
          href="/advisor/invitations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Send new invitations
        </Link>
      </div>

      {/* Data-dependent content with Suspense streaming */}
      <Suspense fallback={<PipelineLoading />}>
        <PipelineContent />
      </Suspense>
    </div>
  );
}