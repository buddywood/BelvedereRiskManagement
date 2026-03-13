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
  const riskLevelConfig = {
    LOW: {
      badge: "success" as const,
      label: "Low Risk",
      progressColor: "bg-green-600",
    },
    MEDIUM: {
      badge: "warning" as const,
      label: "Moderate Risk",
      progressColor: "bg-amber-500",
    },
    HIGH: {
      badge: "warning" as const,
      label: "High Risk",
      progressColor: "bg-orange-600",
    },
    CRITICAL: {
      badge: "outline" as const,
      label: "Critical Risk",
      progressColor: "bg-red-600",
    },
  };

  const config = riskLevelConfig[riskLevel];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <p className="editorial-kicker">Assessment Summary</p>
        <div>
          <div className="text-5xl font-bold text-foreground sm:text-6xl">
            {score.toFixed(1)}
            <span className="text-3xl text-muted-foreground"> / 10</span>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">Governance Maturity Score</p>
        </div>

        <div className="flex justify-center">
          <Badge variant={config.badge} className="px-4 py-2 text-sm font-medium">
            {config.label}
          </Badge>
        </div>

        <div className="max-w-2xl mx-auto">
          <Progress
            value={(score / 10) * 100}
            className="h-3"
            indicatorClassName={config.progressColor}
          />
        </div>

        {answeredPercentage < 100 && (
          <p className="text-sm italic text-muted-foreground">
            Based on {Math.round(answeredPercentage)}% of questions answered.
            Complete remaining questions for full accuracy.
          </p>
        )}
      </div>

      <div className="border-t section-divider pt-6">
        <h3 className="text-2xl font-semibold text-foreground mb-4">
          Governance Category Assessment
        </h3>
        <div className="space-y-4">
          {breakdown.map((category) => (
            <div key={category.categoryId} className="space-y-2 rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-foreground">
                  {category.categoryName}
                </span>
                <span className="text-sm font-semibold text-foreground">
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
