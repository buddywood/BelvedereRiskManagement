"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FamilyRiskCard } from "./FamilyRiskCard";
import type { RiskDetail } from "@/lib/intelligence/types";

interface RiskDetailPanelProps {
  riskDetail: RiskDetail;
}

export function RiskDetailPanel({ riskDetail }: RiskDetailPanelProps) {
  return (
    <div className="space-y-6">
      {/* Family summary header */}
      <section className="p-6 border rounded-lg bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{riskDetail.familyName}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{riskDetail.overallScore.toFixed(1)}</span>
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last assessment: {format(new Date(riskDetail.latestAssessmentDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <div>
            <Link
              href={`/advisor/analytics/${riskDetail.familyId}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Full Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Risk cards */}
      <section>
        {riskDetail.topRisks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {riskDetail.topRisks.map((risk) => (
              <FamilyRiskCard
                key={`${risk.familyId}-${risk.categorySlug}`}
                risk={risk}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              Strong Governance
            </h3>
            <p className="text-muted-foreground">
              This family has strong governance across all areas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}