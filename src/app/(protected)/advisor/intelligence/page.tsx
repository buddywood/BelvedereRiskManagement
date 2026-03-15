import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPortfolioIntelligenceData } from "@/lib/actions/advisor-actions";
import { RiskSummaryCard } from "@/components/intelligence/RiskSummaryCard";
import { PortfolioRiskList } from "@/components/intelligence/PortfolioRiskList";
import { RiskDistributionChart } from "@/components/intelligence/RiskDistributionChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntelligenceLoading from "./loading";

// Async component for data-dependent content
async function IntelligenceContent() {
  const result = await getPortfolioIntelligenceData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">Error loading portfolio intelligence: {result.error}</p>
        </div>
      </div>
    );
  }

  const data = result.data!;

  // Check if any families have completed assessments
  if (data.totalFamilies === 0 || data.familyRiskSummaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No families have completed assessments yet. Risk intelligence will be available after families complete their governance assessments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk summary cards */}
      <RiskSummaryCard
        totalFamilies={data.totalFamilies}
        familiesAtRisk={data.familiesAtRisk}
        criticalCount={data.criticalCount}
        portfolioRisksCount={data.portfolioRisks.length}
      />

      {/* Main content - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio risk list - 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Risk Indicators</CardTitle>
            <CardDescription>
              Governance areas requiring attention across your client families, prioritized by severity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioRiskList risks={data.portfolioRisks} />
          </CardContent>
        </Card>

        {/* Risk distribution chart - 1/3 width */}
        <Card>
          <CardHeader>
            <CardTitle>Risk by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart risksByCategory={data.risksByCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back to Dashboard link */}
      <div>
        <Link
          href="/advisor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero section - static content that renders immediately */}
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="space-y-2 sm:space-y-3">
          <p className="editorial-kicker">Governance Intelligence</p>
          <h2 className="text-3xl font-semibold text-balance sm:text-5xl">
            Risk Intelligence
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Identify and prioritize governance risks across your portfolio. Monitor critical issues,
            track family risk exposure, and focus attention where it's needed most.
          </p>
        </div>
      </section>

      {/* Data-dependent content with Suspense streaming */}
      <Suspense fallback={<IntelligenceLoading />}>
        <IntelligenceContent />
      </Suspense>
    </div>
  );
}