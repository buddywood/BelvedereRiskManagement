export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-4" />

        <div className="space-y-2">
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        {/* Family summary skeleton */}
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-muted animate-pulse rounded" />
              <div className="flex items-center gap-4">
                <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Risk cards skeleton */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card text-card-foreground flex flex-col gap-6 rounded-[1.75rem] border py-6">
              {/* Card header */}
              <div className="px-6 sm:px-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>

              {/* Card content */}
              <div className="px-6 sm:px-8 space-y-4">
                {/* Recommendations skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  {[1, 2].map((j) => (
                    <div key={j} className="flex gap-3">
                      <div className="w-2 h-2 bg-muted animate-pulse rounded-full mt-2 flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assessment details skeleton */}
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}