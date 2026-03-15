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

export interface RiskRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// Represents an actual assessment response that contributed to a risk score
export interface AssessmentResponseDetail {
  questionId: string;
  pillar: string;
  subCategory: string;
  answer: unknown; // Json field from Prisma
  skipped: boolean;
  answeredAt: string;
}

export interface RiskDetail {
  familyId: string;
  familyName: string;
  overallScore: number;
  latestAssessmentDate: string;
  assessmentId: string;
  topRisks: Array<RiskIndicator & {
    recommendations: RiskRecommendation[];
    assessmentResponses: AssessmentResponseDetail[]; // INTEL-04: underlying assessment details
  }>;
}

export interface PortfolioIntelligence {
  totalFamilies: number;
  familiesAtRisk: number; // families with at least one critical or moderate risk
  criticalCount: number; // total critical risks across portfolio
  familyRiskSummaries: FamilyRiskSummary[];
  portfolioRisks: RiskIndicator[]; // all risks across portfolio, sorted by severity then score
  risksByCategory: Record<string, number>; // count of risks per governance category
}