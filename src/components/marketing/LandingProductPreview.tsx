import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LandingSectionBand } from "@/components/marketing/LandingSectionBand";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { PlatformPillarRadarPreview } from "@/components/marketing/PlatformPillarRadarPreview";
import { Badge } from "@/components/ui/badge";
import {
  maturityHeatLevel,
  maturityScoreToPercent,
} from "@/lib/assessment/governance-rubric";
import { MATURITY_SCALE_MAX } from "@/lib/assessment/maturity-scale";
import {
  getSampleReportPreview,
  type SampleReportAudience,
} from "@/lib/marketing/sample-report-preview";
import { RISK_LEVEL_PALETTE } from "@/lib/assessment/risk-color-palette";
import { MarketingMeterBar } from "@/components/marketing/MarketingMeterBar";
import { cn } from "@/lib/utils";

function heatBarFillClass(maturity: number): string {
  const heat = maturityHeatLevel(maturity);
  if (heat === "strong") return "fill-emerald-100";
  if (heat === "fair") return "fill-amber-100";
  if (heat === "weak") return "fill-orange-100";
  return "fill-red-200";
}

function PillarBar({
  name,
  maturity,
  emphasized,
  focusLabel,
}: {
  name: string;
  maturity: number;
  emphasized?: boolean;
  focusLabel: string;
}) {
  const percent = maturityScoreToPercent(maturity);

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl px-3 py-2.5",
        emphasized && "border border-amber-200/80 bg-amber-50/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-foreground">{name}</p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {percent}
        </span>
      </div>
      <MarketingMeterBar
        percent={percent}
        fillClassName={cn("transition-all", heatBarFillClass(maturity))}
      />
      <p className="text-xs text-muted-foreground">
        Maturity {maturity.toFixed(1)} / {MATURITY_SCALE_MAX}
        {emphasized ? ` · ${focusLabel}` : null}
      </p>
    </div>
  );
}

type LandingProductPreviewProps = {
  audience?: SampleReportAudience;
};

export function LandingProductPreview({
  audience = "families",
}: LandingProductPreviewProps) {
  const sample = getSampleReportPreview(audience);
  const resilience = maturityScoreToPercent(sample.maturity);

  return (
    <LandingSectionBand>
      <MarketingSection
        id="platform-preview"
        kicker="Platform output"
        title="Governance intelligence at a glance"
        description={sample.description}
        className="!space-y-8"
      >
        <div
          className="marketing-card overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 shadow-[0_24px_60px_-40px_rgba(26,24,20,0.35)]"
          data-testid="landing-product-preview"
          data-audience={audience}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-5 py-3.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-medium">
                Sample report
              </Badge>
              <span className="font-medium text-foreground">{sample.subjectLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden />
                Assessment complete
              </span>
              <span>{sample.completed}</span>
              <span>
                {sample.questionCount} questions · {sample.pillarsInScope.length} of{" "}
                {sample.domainCatalogCount} risk domains in scope
              </span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-6 border-b border-border/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="space-y-4">
                <p className="editorial-kicker">{sample.resilienceLabel}</p>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <p className="font-display text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
                    {resilience}
                    <span className="ml-1 text-2xl font-normal text-muted-foreground sm:text-3xl">
                      / 100
                    </span>
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mb-1",
                      RISK_LEVEL_PALETTE.medium.border,
                      RISK_LEVEL_PALETTE.medium.bg,
                      RISK_LEVEL_PALETTE.medium.text,
                    )}
                  >
                    Moderate risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aggregate maturity {sample.maturity.toFixed(1)} / {MATURITY_SCALE_MAX} ·
                  scored across active risk domains
                </p>
                <MarketingMeterBar
                  percent={resilience}
                  fillClassName="fill-amber-100"
                  heightClassName="h-2.5"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="editorial-kicker">Active risk domain breakdown</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {sample.pillarsInScope.length} {sample.domainBreakdownNote}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sample.pillarsInScope.map((pillar) => (
                    <PillarBar
                      key={pillar.slug}
                      name={pillar.name}
                      maturity={pillar.maturity}
                      emphasized={pillar.emphasized}
                      focusLabel={sample.focusLabel}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col border-b border-border/60 bg-muted/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="space-y-2">
                <p className="editorial-kicker">Risk domain coverage</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {sample.coverageNote}
                </p>
              </div>
              <div className="mt-4 flex w-full flex-1 items-center justify-center">
                <PlatformPillarRadarPreview pillars={sample.pillarScores} />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="space-y-4">
                <p className="editorial-kicker">Priority remediations</p>
                <ul className="space-y-3">
                  {sample.risks.map((risk) => {
                    const palette = RISK_LEVEL_PALETTE[risk.level];
                    return (
                      <li
                        key={risk.title}
                        className="rounded-xl border border-border/60 bg-background/60 px-4 py-3.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase tracking-wide",
                              palette.border,
                              palette.bg,
                              palette.text,
                            )}
                          >
                            {palette.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{risk.pillar}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-snug text-foreground">
                          {risk.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                          {risk.detail}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3.5">
                <p className="editorial-kicker">Recommended next step</p>
                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-foreground">
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-brand"
                    aria-hidden
                  />
                  {sample.nextStep}
                </p>
              </div>

              <p className="text-xs leading-5 text-muted-foreground">{sample.footerNote}</p>
            </div>
          </div>
        </div>
      </MarketingSection>
    </LandingSectionBand>
  );
}
