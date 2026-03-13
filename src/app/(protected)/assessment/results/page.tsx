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
import { DownloadSection } from "@/components/reports/DownloadSection";
import { TemplateList } from "@/components/reports/TemplateList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

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
  const [isReadyForRedirects, setIsReadyForRedirects] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReadyForRedirects(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReadyForRedirects) {
      return;
    }

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
  }, [assessmentId, router, markPillarComplete, isReadyForRedirects]);

  if (isLoading || !isReadyForRedirects) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground">Calculating your governance assessment results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Unable to load results</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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

  if (!scoreData || !assessmentId) {
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
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="hero-surface rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-3">
            <p className="editorial-kicker">Assessment Complete</p>
            <h1 className="text-4xl font-semibold text-balance sm:text-5xl">
              Family Governance Assessment Results
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Completed on {format(new Date(scoreData.completedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>

          <Card className="bg-background/60">
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div>
                <p className="editorial-kicker">Overall Score</p>
                <p className="mt-2 text-3xl font-semibold">{scoreData.score.toFixed(1)} / 10</p>
              </div>
              <div>
                <p className="editorial-kicker">Completion</p>
                <p className="mt-2 text-3xl font-semibold">{Math.round(answeredPercentage)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardContent className="pt-8">
          <ScoreDisplay
            score={scoreData.score}
            riskLevel={scoreData.riskLevel}
            breakdown={scoreData.breakdown}
            answeredPercentage={answeredPercentage}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardContent className="pt-8">
            <RiskDrivers
              missingControls={scoreData.missingControls}
              riskLevel={scoreData.riskLevel}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-8">
            <ActionPlan
              missingControls={scoreData.missingControls}
              pillarName="Family Governance"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-8">
            <DownloadSection assessmentId={assessmentId} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-8">
            <TemplateList assessmentId={assessmentId} />
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 border-t section-divider pt-6 sm:flex-row sm:items-center sm:justify-between">
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
      </section>
    </div>
  );
}
