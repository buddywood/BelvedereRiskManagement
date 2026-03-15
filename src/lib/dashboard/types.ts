import { RiskLevel } from "@prisma/client";

// Latest governance score for a client
export type GovernanceScoreSummary = {
  score: number; // 0-10 scale
  riskLevel: RiskLevel;
  calculatedAt: Date;
  breakdown: any; // Json from PillarScore
};

// Dashboard table row data for each client
export type DashboardClient = {
  id: string;
  name: string | null;
  email: string;
  assignedAt: Date;
  latestScore: GovernanceScoreSummary | null;
  assessmentCount: number;
  latestAssessmentDate: Date | null;
};

// Summary metrics for dashboard cards
export type DashboardMetrics = {
  totalClients: number;
  averageScore: number | null;
  highRiskCount: number;
  assessedCount: number; // clients with at least one completed assessment
};

// Risk distribution counts
export type RiskDistribution = {
  low: number;
  medium: number;
  high: number;
  critical: number;
};