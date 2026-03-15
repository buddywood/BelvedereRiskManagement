export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Latest assessment summary skeleton */}
      <div className="p-6 border rounded-lg space-y-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-12 w-16 bg-muted rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Trend chart skeleton */}
      <div className="p-6 border rounded-lg space-y-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>

      {/* Category chart skeleton */}
      <div className="p-6 border rounded-lg space-y-4">
        <div className="h-6 w-64 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>

      {/* Comparison skeleton */}
      <div className="p-6 border rounded-lg space-y-4">
        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}