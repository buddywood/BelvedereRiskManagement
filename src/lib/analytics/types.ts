// Analytics data types for governance charts and visualizations

export interface GovernanceTrendPoint {
  date: string;
  overallScore: number;
  assessmentId: string;
}

export interface CategoryBreakdownPoint {
  categoryId: string;
  categoryName: string;
  score: number;
  weight: number;
}

export interface AssessmentComparison {
  assessmentId: string;
  completedAt: string;
  overallScore: number;
  categories: CategoryBreakdownPoint[];
  trendDirection: 'improving' | 'declining' | 'stable' | 'new';
}

export interface FamilyAnalyticsData {
  clientId: string;
  clientName: string;
  trendData: GovernanceTrendPoint[];
  latestBreakdown: CategoryBreakdownPoint[];
  assessments: AssessmentComparison[];
}