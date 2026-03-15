import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdvisorDashboardLoadingPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero skeleton */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 w-96 bg-muted rounded animate-pulse" />
          <div className="h-6 w-full max-w-2xl bg-muted rounded animate-pulse" />
        </div>
      </section>

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