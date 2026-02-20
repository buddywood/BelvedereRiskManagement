/**
 * ScoreDisplay Component
 *
 * Displays numeric governance score with risk level, severity bar, and category breakdown.
 * Professional advisory tone with clean visualization (no gamification).
 */

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryScore } from "@/lib/assessment/types";

interface ScoreDisplayProps {
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  breakdown: CategoryScore[];
  answeredPercentage: number;
}

export function ScoreDisplay({
  score,
  riskLevel,
  breakdown,
  answeredPercentage,
}: ScoreDisplayProps) {
  // Map risk level to color and label
  const riskLevelConfig = {
    LOW: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Low Risk",
      progressColor: "bg-green-600",
    },
    MEDIUM: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      label: "Moderate Risk",
      progressColor: "bg-amber-500",
    },
    HIGH: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "High Risk",
      progressColor: "bg-orange-600",
    },
    CRITICAL: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Critical Risk",
      progressColor: "bg-red-600",
    },
  };

  const config = riskLevelConfig[riskLevel];

  return (
    <div className="space-y-8">
      {/* Score and Risk Level */}
      <div className="text-center space-y-4">
        <div>
          <div className="text-5xl font-bold text-zinc-900">
            {score.toFixed(1)}
            <span className="text-3xl text-zinc-500"> / 10</span>
          </div>
          <p className="text-lg text-zinc-600 mt-2">Governance Maturity Score</p>
        </div>

        <div className="flex justify-center">
          <Badge variant="outline" className={`${config.color} px-4 py-2 text-sm font-medium`}>
            {config.label}
          </Badge>
        </div>

        {/* Severity Bar */}
        <div className="max-w-2xl mx-auto">
          <Progress
            value={(score / 10) * 100}
            className="h-3"
            indicatorClassName={config.progressColor}
          />
        </div>

        {/* Completion Note */}
        {answeredPercentage < 100 && (
          <p className="text-sm text-zinc-500 italic">
            Based on {Math.round(answeredPercentage)}% of questions answered.
            Complete remaining questions for full accuracy.
          </p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          Governance Category Assessment
        </h3>
        <div className="space-y-4">
          {breakdown.map((category) => (
            <div key={category.categoryId} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-zinc-700">
                  {category.categoryName}
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {category.score.toFixed(1)} / {category.maxScore}
                </span>
              </div>
              <Progress
                value={(category.score / category.maxScore) * 100}
                className="h-2"
                indicatorClassName={
                  category.score >= 7.5
                    ? "bg-green-600"
                    : category.score >= 5.0
                    ? "bg-amber-500"
                    : category.score >= 2.5
                    ? "bg-orange-600"
                    : "bg-red-600"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
