"use client";

import { format } from 'date-fns';
import { TrendIndicator } from './TrendIndicator';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import type { AssessmentComparison } from '@/lib/analytics/types';

interface AssessmentComparisonViewProps {
  assessments: AssessmentComparison[];
}

export function AssessmentComparisonView({ assessments }: AssessmentComparisonViewProps) {
  if (assessments.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Complete another assessment to compare periods
      </div>
    );
  }

  // Get the two most recent assessments
  const [previousAssessment, currentAssessment] = assessments.slice(-2);
  const scoreDelta = currentAssessment.overallScore - previousAssessment.overallScore;

  const getTrendDirection = (): 'improving' | 'declining' | 'stable' => {
    if (scoreDelta > 0.3) return 'improving';
    if (scoreDelta < -0.3) return 'declining';
    return 'stable';
  };

  return (
    <div className="space-y-6">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Previous Assessment */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Previous Assessment</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(previousAssessment.completedAt), 'MMM d, yyyy')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">{previousAssessment.overallScore.toFixed(1)}</span>
              <TrendIndicator direction={previousAssessment.trendDirection} />
            </div>
          </div>
          <CategoryBreakdownChart
            data={previousAssessment.categories}
            title="Previous Scores"
          />
        </div>

        {/* Current Assessment */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Latest Assessment</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(currentAssessment.completedAt), 'MMM d, yyyy')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">{currentAssessment.overallScore.toFixed(1)}</span>
              <TrendIndicator direction={currentAssessment.trendDirection} />
            </div>
          </div>
          <CategoryBreakdownChart
            data={currentAssessment.categories}
            title="Current Scores"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">
            Score changed from {previousAssessment.overallScore.toFixed(1)} to {currentAssessment.overallScore.toFixed(1)}
          </span>
          <TrendIndicator
            direction={getTrendDirection()}
            scoreDelta={Math.abs(scoreDelta)}
          />
        </div>
      </div>
    </div>
  );
}