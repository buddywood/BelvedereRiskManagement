import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-md bg-muted/50 px-3 py-2">
            <div className="space-y-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
        <div className="space-y-2 border-t border-border/50 pt-4">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>
      </div>

      {/* Card-based client list skeleton (matches PipelineClientCard layout) */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="hidden lg:block lg:flex-[1.4]">
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="flex min-w-[7.5rem] flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
