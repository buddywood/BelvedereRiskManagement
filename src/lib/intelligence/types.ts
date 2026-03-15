export type RiskSeverity = 'critical' | 'moderate' | 'low';

export interface RiskIndicator {
  familyId: string;
  familyName: string;
  categorySlug: string;
  categoryName: string;
  score: number;
  severity: RiskSeverity;
  weight: number; // pillar weight for context
  assessmentId: string;
  assessmentDate: string;
}

export interface FamilyRiskSummary {
  familyId: string;
  familyName: string;
  overallScore: number;
  topRisks: RiskIndicator[]; // top 3 lowest-scoring pillars
  assessmentCount: number;
  latestAssessmentDate: string;
}

export interface PortfolioIntelligence {
  totalFamilies: number;
  familiesAtRisk: number; // families with at least one critical or moderate risk
  criticalCount: number; // total critical risks across portfolio
  familyRiskSummaries: FamilyRiskSummary[];
  portfolioRisks: RiskIndicator[]; // all risks across portfolio, sorted by severity then score
  risksByCategory: Record<string, number>; // count of risks per governance category
}