"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { RiskIndicator } from "@/lib/intelligence/types";

interface PortfolioRiskListProps {
  risks: RiskIndicator[];
}

export function PortfolioRiskList({ risks }: PortfolioRiskListProps) {
  if (risks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No significant governance risks identified across your portfolio.
        </p>
      </div>
    );
  }

  // Show top 20 risks, but track if there are more
  const displayedRisks = risks.slice(0, 20);
  const hasMoreRisks = risks.length > 20;

  return (
    <div className="space-y-4">
      {/* Risk list */}
      <div className="space-y-3">
        {displayedRisks.map((risk, index) => (
          <div
            key={`${risk.familyId}-${risk.categorySlug}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <Link
                  href={`/advisor/intelligence/${risk.familyId}`}
                  className="font-medium hover:underline text-foreground"
                >
                  {risk.familyName}
                </Link>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {risk.categoryName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Score: {risk.score.toFixed(1)} / 10
                </span>
              </div>
            </div>
            <Badge
              variant={
                risk.severity === 'critical'
                  ? 'warning'
                  : risk.severity === 'moderate'
                  ? 'outline'
                  : 'secondary'
              }
              className={
                risk.severity === 'critical'
                  ? 'bg-red-500/12 text-red-900 dark:text-red-100'
                  : risk.severity === 'moderate'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : ''
              }
            >
              {risk.severity}
            </Badge>
          </div>
        ))}
      </div>

      {/* More risks indicator */}
      {hasMoreRisks && (
        <div className="text-center py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing top 20 of {risks.length} total risk indicators
          </p>
        </div>
      )}
    </div>
  );
}