"use client";

/**
 * Assessment Results Page
 *
 * Displays completed assessment results with score, risk drivers, and action plan.
 * Calculates score on first visit if not already computed.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/assessment/store";
import { ScoreDisplay } from "@/components/assessment/ScoreDisplay";
import { RiskDrivers } from "@/components/assessment/RiskDrivers";
import { ActionPlan } from "@/components/assessment/ActionPlan";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ScoreData {
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  breakdown: Array<{
    categoryId: string;
    categoryName: string;
    score: number;
    weight: number;
    maxScore: number;
  }>;
  missingControls: Array<{
    questionId: string;
    category: string;
    description: string;
    severity: "high" | "medium" | "low";
    recommendation: string;
  }>;
  completedAt: string;
}

export default function AssessmentResultsPage() {
  const router = useRouter();
  const { assessmentId, markPillarComplete } = useAssessmentStore();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScore() {
      if (!assessmentId) {
        router.push("/assessment");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch existing score
        let response = await fetch(`/api/assessment/${assessmentId}/score`);

        if (response.status === 404) {
          // No score exists yet, trigger calculation
          response = await fetch(`/api/assessment/${assessmentId}/score`, {
            method: "POST",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to calculate score");
          }
        } else if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load score");
        }

        const data = await response.json();
        setScoreData(data);

        // Mark pillar as complete in store
        markPillarComplete("family-governance");
      } catch (err) {
        console.error("Error loading score:", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    }

    loadScore();
  }, [assessmentId, router, markPillarComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-600 mx-auto" />
          <p className="text-zinc-600">Calculating your governance assessment results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-900">Unable to Load Results</h2>
          <p className="text-sm text-red-700">{error}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/assessment")}
              variant="outline"
              className="flex-1"
            >
              Return to Assessment
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!scoreData) {
    return null;
  }

  // Calculate answered percentage from breakdown
  const totalQuestions = scoreData.breakdown.reduce(
    (sum, cat) => sum + cat.weight,
    0
  );
  const answeredCount = scoreData.breakdown.reduce(
    (sum, cat) => sum + (cat.score > 0 ? cat.weight : 0),
    0
  );
  const answeredPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900">
            Family Governance Assessment Results
          </h1>
          <p className="text-sm text-zinc-600">
            Completed on {format(new Date(scoreData.completedAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-lg border border-zinc-200 p-8">
          <ScoreDisplay
            score={scoreData.score}
            riskLevel={scoreData.riskLevel}
            breakdown={scoreData.breakdown}
            answeredPercentage={answeredPercentage}
          />
        </div>

        {/* Risk Drivers */}
        <div className="bg-white rounded-lg border border-zinc-200 p-8">
          <RiskDrivers
            missingControls={scoreData.missingControls}
            riskLevel={scoreData.riskLevel}
          />
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-lg border border-zinc-200 p-8">
          <ActionPlan
            missingControls={scoreData.missingControls}
            pillarName="Family Governance"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            onClick={() => router.push("/assessment")}
            variant="outline"
          >
            Review Answers
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
