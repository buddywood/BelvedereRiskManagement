// Family dashboard data types for self-service family portal

export interface FamilyHouseholdMember {
  fullName: string;
  relationship: string;
  governanceRoles: string[];
}

export interface FamilyPillarScore {
  pillar: string;
  pillarName: string;
  score: number;
  weight: number;
  riskLevel: string;
}

export interface FamilyHistoricalAssessment {
  assessmentId: string;
  completedAt: string;
  overallScore: number;
  pillarScores: FamilyPillarScore[];
  trendDirection: 'improving' | 'declining' | 'stable' | 'new';
}

export interface FamilyDashboardData {
  householdMembers: FamilyHouseholdMember[];
  currentScore: number | null;
  currentPillarScores: FamilyPillarScore[];
  historicalAssessments: FamilyHistoricalAssessment[];
  advisorEmphasis: string[];
  hasMultipleAssessments: boolean;
}