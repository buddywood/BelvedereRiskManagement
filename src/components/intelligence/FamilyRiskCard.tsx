"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskIndicator, RiskRecommendation, AssessmentResponseDetail } from "@/lib/intelligence/types";

interface FamilyRiskCardProps {
  risk: RiskIndicator & {
    recommendations: RiskRecommendation[];
    assessmentResponses: AssessmentResponseDetail[];
  };
}

export function FamilyRiskCard({ risk }: FamilyRiskCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Helper to render answer value
  const renderAnswer = (answer: unknown): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    if (answer === null || answer === undefined) {
      return 'No answer provided';
    }
    return JSON.stringify(answer);
  };

  // Score color based on severity
  const scoreColor = risk.severity === 'critical'
    ? 'text-red-600 dark:text-red-400'
    : risk.severity === 'moderate'
    ? 'text-amber-600 dark:text-amber-400'
    : risk.score >= 7
    ? 'text-green-600 dark:text-green-400'
    : 'text-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{risk.categoryName}</CardTitle>
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

        {/* Score display */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {risk.score.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">/10</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Weight: {risk.weight}% of overall score
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recommendations section */}
        <div>
          <h4 className="font-semibold mb-3">Recommendations</h4>
          <div className="space-y-3">
            {risk.recommendations.map((rec, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    rec.priority === 'high'
                      ? 'bg-red-500'
                      : rec.priority === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                />
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-sm">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Responses section (INTEL-04) */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold">Assessment Details</h4>
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3">
              {risk.assessmentResponses.length > 0 ? (
                risk.assessmentResponses.map((response, index) => (
                  <div key={index} className="border-l-2 border-muted pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{response.subCategory}</p>
                      {response.skipped && (
                        <Badge variant="outline" className="text-xs">
                          Skipped
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {renderAnswer(response.answer)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No detailed responses available for this area
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}