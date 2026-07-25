import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsageTrend } from "@/lib/admin/analytics-metrics";

/**
 * 14-day usage trend rendered as inline sparkline bars — no chart
 * library. Three series side-by-side per bucket (intake submissions,
 * assessments started, assessments completed). When the trend is
 * entirely empty we render an honest "Not enough data yet" empty state
 * instead of a row of zero-height bars.
 */
export function TrendCard({ trend }: { trend: UsageTrend }) {
  const max = Math.max(
    1,
    ...trend.points.flatMap((p) => [
      p.intakeSubmissions,
      p.assessmentsStarted,
      p.assessmentsCompleted,
    ])
  );

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          Platform usage — last 14 days
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Intake submissions, assessments started, and assessments completed,
          bucketed by UTC day. Today&apos;s bucket is partial.
        </p>
      </CardHeader>
      <CardContent>
        {trend.empty ? (
          <EmptyState />
        ) : (
          <>
            <Legend />
            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-[600px] items-end gap-2 pb-2 sm:gap-3">
                {trend.points.map((p) => {
                  const total = p.intakeSubmissions + p.assessmentsStarted + p.assessmentsCompleted;
                  return (
                    <div
                      key={p.date}
                      className="group relative flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="flex h-40 w-full items-end justify-center gap-1"
                        aria-label={`Bucket ${p.date}: ${p.intakeSubmissions} intake submissions, ${p.assessmentsStarted} assessments started, ${p.assessmentsCompleted} completed`}
                      >
                        <Bar value={p.intakeSubmissions} max={max} variant="brand" />
                        <Bar
                          value={p.assessmentsStarted}
                          max={max}
                          variant="muted"
                        />
                        <Bar
                          value={p.assessmentsCompleted}
                          max={max}
                          variant="accent"
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDateLabel(p.date)}
                      </span>
                      {/* Hover tooltip */}
                      <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border bg-popover px-3 py-2 text-xs shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="font-semibold text-foreground">{formatDateLabel(p.date)}</p>
                        <ul className="mt-1 space-y-0.5 text-muted-foreground">
                          <li className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-sm bg-foreground/80" />
                            Intake: {p.intakeSubmissions}
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-sm bg-muted-foreground/40" />
                            Started: {p.assessmentsStarted}
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-sm bg-emerald-500/70" />
                            Completed: {p.assessmentsCompleted}
                          </li>
                        </ul>
                        <p className="mt-1 border-t pt-1 font-medium text-foreground">
                          Total: {total}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${month}/${day}`;
}

function Bar({
  value,
  max,
  variant,
}: {
  value: number;
  max: number;
  variant: "brand" | "muted" | "accent";
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color =
    variant === "brand"
      ? "bg-foreground/80"
      : variant === "accent"
        ? "bg-emerald-500/70"
        : "bg-muted-foreground/40";
  return (
    <div className="flex h-full w-3 flex-col justify-end sm:w-4">
      <div
        className={`${color} rounded-sm transition-all`}
        style={{ height: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
      />
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
      <LegendDot className="bg-foreground/80" label="Intake submitted" />
      <LegendDot className="bg-muted-foreground/40" label="Assessment started" />
      <LegendDot className="bg-emerald-500/70" label="Assessment completed" />
    </ul>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <li className="inline-flex items-center gap-2">
      <span className={`inline-block size-2.5 rounded-sm ${className}`} aria-hidden />
      <span className="font-medium text-muted-foreground">{label}</span>
    </li>
  );
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
      Not enough data yet. Trend points will appear once intake submissions
      and assessment activity start flowing.
    </p>
  );
}
