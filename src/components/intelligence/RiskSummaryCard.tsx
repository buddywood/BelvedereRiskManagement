"use client";

import { Card } from "@/components/ui/card";

interface RiskSummaryCardProps {
  totalFamilies: number;
  familiesAtRisk: number;
  criticalCount: number;
  portfolioRisksCount: number;
}

export function RiskSummaryCard({
  totalFamilies,
  familiesAtRisk,
  criticalCount,
  portfolioRisksCount,
}: RiskSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Families</p>
          <p className="text-2xl font-semibold">{totalFamilies}</p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Families at Risk</p>
          <p className={`text-2xl font-semibold ${
            familiesAtRisk > 0
              ? 'text-destructive'
              : ''
          }`}>
            {familiesAtRisk}
          </p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Critical Issues</p>
          <p className={`text-2xl font-semibold ${
            criticalCount > 0
              ? 'text-destructive'
              : ''
          }`}>
            {criticalCount}
          </p>
        </div>
      </div>

      <div className="hero-surface rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Risk Indicators</p>
          <p className="text-2xl font-semibold">{portfolioRisksCount}</p>
        </div>
      </div>
    </div>
  );
}