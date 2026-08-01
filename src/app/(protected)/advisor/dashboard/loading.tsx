import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorDashboardLoadingPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero skeleton */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-96 max-w-full" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
      </section>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="hero-surface rounded-lg p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Responsive table skeleton */}
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4" />
                  ))}
                </div>
                {/* Table rows */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 py-2">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-6" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
