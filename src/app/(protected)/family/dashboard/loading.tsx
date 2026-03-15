export default function FamilyDashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero section skeleton */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-2 sm:space-y-3">
            {/* Editorial kicker skeleton */}
            <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
            {/* Heading skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-80 bg-muted/50 rounded animate-pulse" />
              <div className="h-8 w-64 bg-muted/50 rounded animate-pulse" />
            </div>
            {/* Description skeleton */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full max-w-2xl bg-muted/50 rounded animate-pulse" />
              <div className="h-4 w-96 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Household members card skeleton */}
          <div className="bg-background/60 rounded-lg border p-4">
            <div className="h-4 w-32 bg-muted/50 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 w-32 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-6 w-16 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-muted/50 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Score card skeleton */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <div className="h-6 w-48 bg-muted/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-6">
          {/* Overall score skeleton */}
          <div className="text-center space-y-3">
            <div className="h-16 w-32 bg-muted/50 rounded animate-pulse mx-auto" />
            <div className="h-6 w-24 bg-muted/50 rounded-full animate-pulse mx-auto" />
          </div>

          {/* Categories skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="h-5 w-28 bg-muted/50 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-20 bg-muted/50 rounded-full animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <div className="h-6 w-44 bg-muted/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="p-6">
          <div className="h-[300px] w-full bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}