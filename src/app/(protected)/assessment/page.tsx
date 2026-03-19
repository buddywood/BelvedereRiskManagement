"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAssessmentStore } from "@/lib/assessment/store";
import { useHouseholdProfile } from "@/lib/hooks/useHouseholdProfile";
import { PillarCard } from "@/components/assessment/PillarCard";
import { OverallProgress } from "@/components/assessment/ProgressBar";
import { CustomizationBanner } from "@/components/assessment/CustomizationBanner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import type { Pillar } from "@/lib/assessment/types";
import { getVisibleQuestions } from "@/lib/assessment/branching";
import { allQuestions } from "@/lib/assessment/questions";
import { cyberRiskPillar, allCyberQuestions } from "@/lib/cyber-risk/questions";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomizationConfig } from "@/lib/assessment/customization";
import {
  getVisibleQuestionIds,
  estimateCompletionMinutes,
} from "@/lib/assessment/customization";

/**
 * Assessment Hub Page
 *
 * Entry point for starting or resuming family governance assessments.
 * Implements server rehydration on mount for save/resume functionality.
 * Enhanced with smart resume to navigate to exact next required question.
 */

// Pillar configurations for multi-pillar assessment hub
const ASSESSMENT_PILLARS = [
  {
    pillar: {
      id: "family-governance",
      name: "Family Governance",
      slug: "family-governance",
      description:
        "Evaluate your family's governance structures, decision-making processes, and succession planning.",
      estimatedMinutes: 25,
      subCategories: [
        {
          id: "governance-structure",
          name: "Governance Structure",
          description: "Family councils and decision-making bodies",
          weight: 1,
          questionIds: [],
        },
        {
          id: "decision-making",
          name: "Decision Making",
          description: "Processes and protocols",
          weight: 1,
          questionIds: [],
        },
        {
          id: "conflict-resolution",
          name: "Conflict Resolution",
          description: "Dispute handling mechanisms",
          weight: 1,
          questionIds: [],
        },
        {
          id: "succession-planning",
          name: "Succession Planning",
          description: "Leadership transition strategies",
          weight: 1,
          questionIds: [],
        },
        {
          id: "communication",
          name: "Communication",
          description: "Family communication frameworks",
          weight: 1,
          questionIds: [],
        },
        {
          id: "education",
          name: "Education",
          description: "Next generation preparation",
          weight: 1,
          questionIds: [],
        },
        {
          id: "values-mission",
          name: "Values & Mission",
          description: "Family purpose and principles",
          weight: 1,
          questionIds: [],
        },
        {
          id: "documentation",
          name: "Documentation",
          description: "Policies and formal agreements",
          weight: 1,
          questionIds: [],
        },
      ],
    },
    questions: allQuestions,
  },
  {
    pillar: cyberRiskPillar,
    questions: allCyberQuestions,
  },
];

// Legacy constant for backwards compatibility
const FAMILY_GOVERNANCE_PILLAR: Pillar = ASSESSMENT_PILLARS[0].pillar;

export default function AssessmentHubPage() {
  const router = useRouter();
  const store = useAssessmentStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Household profile for personalization
  const { profile } = useHouseholdProfile();

  // Fetch assessment data from server for rehydration (with timeout to avoid hanging)
  const FETCH_TIMEOUT_MS = 12_000;
  const { data: assessmentData, isError: assessmentFetchError } = useQuery({
    queryKey: ["assessment", store.assessmentId],
    queryFn: async () => {
      if (!store.assessmentId) return null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(`/api/assessment/${store.assessmentId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          store.resetAssessment();
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch assessment");
        }

        return response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: !!store.assessmentId && !store.isHydrated,
    retry: 1,
  });

  // Fetch customization configuration
  const { data: customizationConfig, isLoading: customizationLoading } =
    useQuery<CustomizationConfig>({
      queryKey: ["assessment-customization"],
      queryFn: async () => {
        const response = await fetch("/api/assessment/customization");

        if (!response.ok) {
          throw new Error("Failed to fetch customization config");
        }

        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Rehydrate store from server data
  useEffect(() => {
    if (assessmentData && !store.isHydrated) {
      store.loadFromServer(assessmentData);
      store.setHydrated(true);
    }

    // If no assessmentId, mark as hydrated (nothing to load)
    if (!store.assessmentId && !store.isHydrated) {
      store.setHydrated(true);
    }

    // If fetch failed or timed out, stop waiting so the page can render
    if (assessmentFetchError && store.assessmentId && !store.isHydrated) {
      store.setHydrated(true);
    }

    // Defer to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
    const t = setTimeout(() => setIsInitializing(false), 0);
    return () => clearTimeout(t);
  }, [assessmentData, assessmentFetchError, store]);

  // Safety: stop showing loading after max time so the page never hangs
  const LOADING_MAX_MS = 15_000;
  useEffect(() => {
    const id = setTimeout(() => {
      store.setHydrated(true);
      setIsInitializing(false);
    }, LOADING_MAX_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // Create new assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create assessment");
      }

      return response.json();
    },
    onSuccess: (data) => {
      store.setAssessmentId(data.id);
      // Will be set by handleStartAssessment based on pillar
      toast.success("Assessment started");
    },
    onError: () => {
      toast.error("Failed to start assessment");
    },
  });

  const handleStartAssessment = (pillarSlug: string) => {
    createAssessmentMutation.mutate(undefined, {
      onSuccess: (data) => {
        store.setCurrentPosition(pillarSlug, 0);
        router.push(`/assessment/${pillarSlug}/0`);
      },
    });
  };

  const handleContinueAssessment = (pillarSlug: string) => {
    // Clean orphaned answers before resuming
    store.cleanOrphanedAnswers();

    // Find the pillar config
    const pillarConfig = ASSESSMENT_PILLARS.find(p => p.pillar.slug === pillarSlug);
    if (!pillarConfig) {
      toast.error("Pillar configuration not found");
      return;
    }

    // Smart resume: Find next unanswered question using branching logic
    const pillarQuestions = pillarConfig.questions.filter(
      (q) => q.pillar === pillarSlug,
    );
    const visibleQuestions = getVisibleQuestions(
      store.answers,
      pillarQuestions,
      profile,
    );

    // Find first unanswered question
    let nextQuestionIndex = 0;
    for (let i = 0; i < visibleQuestions.length; i++) {
      const question = visibleQuestions[i];
      const answer = store.answers[question.id];
      if (answer === undefined || answer === null) {
        nextQuestionIndex = i;
        break;
      }
      // If all questions answered, go to last question (for review)
      if (i === visibleQuestions.length - 1) {
        nextQuestionIndex = i;
      }
    }

    router.push(`/assessment/${pillarSlug}/${nextQuestionIndex}`);
  };

  // Calculate pillar statistics for each pillar
  const pillarStats = ASSESSMENT_PILLARS.map(({ pillar, questions }) => {
    const pillarSlug = pillar.slug;

    // Determine pillar status
    const getPillarStatus = () => {
      if (!store.assessmentId) return "not-started";
      if (store.completedPillars.includes(pillarSlug)) return "completed";

      // Check if any questions from this pillar have been answered
      const pillarQuestions = questions.filter((q) => q.pillar === pillarSlug);
      const answeredQuestions = pillarQuestions.filter((q) => {
        const answer = store.answers[q.id];
        return answer !== undefined && answer !== null;
      });

      return answeredQuestions.length > 0 ? "in-progress" : "not-started";
    };

    // Calculate question counts using branching logic and customization
    const pillarQuestions = questions.filter((q) => q.pillar === pillarSlug);

    // Apply customization filtering only for governance pillar (cyber risk doesn't have customization yet)
    const baseQuestions = pillarSlug === "family-governance" &&
      customizationConfig?.isCustomized &&
      customizationConfig.visibleSubCategories.length > 0
        ? pillarQuestions.filter((q) =>
            customizationConfig.visibleSubCategories.includes(q.subCategory),
          )
        : pillarQuestions;

    const visibleQuestions = getVisibleQuestions(
      store.answers,
      baseQuestions,
      profile,
    );
    const questionsAnswered = visibleQuestions.filter((q) => {
      const answer = store.answers[q.id];
      return answer !== undefined && answer !== null;
    }).length;
    const totalQuestions = visibleQuestions.length || baseQuestions.length;

    // Calculate customized duration if applicable (governance only)
    const estimatedDuration = pillarSlug === "family-governance" &&
      customizationConfig?.isCustomized &&
      customizationConfig.visibleSubCategories.length > 0
        ? estimateCompletionMinutes(
            customizationConfig.visibleSubCategories,
            allQuestions,
          )
        : pillar.estimatedMinutes;

    return {
      pillar,
      status: getPillarStatus(),
      questionsAnswered,
      totalQuestions,
      estimatedDuration,
    };
  });

  // Calculate focus area count for customization banner (governance only)
  const focusAreaCount = customizationConfig?.visibleSubCategories.length || 0;

  // Show loading skeleton until hydrated
  if (isInitializing || (store.assessmentId && !store.isHydrated)) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-64 rounded bg-secondary animate-pulse" />
          <div className="h-4 w-96 rounded bg-secondary animate-pulse" />
        </div>
        <div className="h-24 rounded-[1.5rem] bg-secondary animate-pulse" />
        <div className="h-64 rounded-[1.5rem] bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="rounded-full border section-divider bg-background/65 px-3 py-1.5">
                Personalized recommendations
              </div>
              <div className="rounded-full border section-divider bg-background/65 px-3 py-1.5">
                Autosave enabled
              </div>
              <div className="rounded-full border section-divider bg-background/65 px-3 py-1.5">
                Advisory-style results
              </div>
            </div>
          </div>
        </div>
      </section>

      {store.assessmentId && pillarStats.some(p => p.status === "in-progress") && (
        <Alert variant="info">
          <AlertTitle className="text-lg font-semibold">
            Welcome back
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Continue your assessment from where you left off. Progress is saved automatically.
            </p>
            {store.lastSaved && (
              <p className="text-sm flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Last saved{" "}
                {formatDistanceToNow(new Date(store.lastSaved), {
                  addSuffix: true,
                })}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {store.assessmentId && (
        <Card className="bg-background/55">
          <CardContent className="pt-6">
            <OverallProgress
              completedPillars={store.completedPillars}
              totalPillars={2}
              currentPillar={store.currentPillar || undefined}
            />
          </CardContent>
        </Card>
      )}

      {customizationConfig?.isCustomized && (
        <CustomizationBanner
          advisorName={customizationConfig.advisorName}
          focusAreaCount={focusAreaCount}
          estimatedMinutes={pillarStats.find(p => p.pillar.slug === "family-governance")?.estimatedDuration || 25}
        />
      )}

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="editorial-kicker">Assessment Section</p>
          <h2 className="text-3xl font-semibold">Structured review</h2>
        </div>

        <div className="grid gap-4">
          {pillarStats.map(({ pillar, status, questionsAnswered, totalQuestions }) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              status={status}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
              onClick={
                status === "not-started"
                  ? () => handleStartAssessment(pillar.slug)
                  : () => handleContinueAssessment(pillar.slug)
              }
            />
          ))}
        </div>
      </section>

      <section className="hero-surface rounded-[1.75rem] border-t section-divider p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="editorial-kicker">Next Step</p>
            {(() => {
              const completedCount = pillarStats.filter(p => p.status === "completed").length;
              const inProgressCount = pillarStats.filter(p => p.status === "in-progress").length;
              const notStartedCount = pillarStats.filter(p => p.status === "not-started").length;

              if (completedCount === pillarStats.length) {
                return (
                  <p className="text-base leading-7 text-muted-foreground">
                    All assessments complete! Review your results, risk drivers,
                    and recommended actions for each area.
                  </p>
                );
              } else if (inProgressCount > 0) {
                return (
                  <p className="text-base leading-7 text-muted-foreground">
                    Continue your assessment to receive tailored recommendations
                    and scored summaries for each risk area.
                  </p>
                );
              } else {
                return (
                  <p className="text-base leading-7 text-muted-foreground">
                    Ready to begin? Start with either assessment pillar. Each takes 15-25 minutes and saves progress automatically.
                  </p>
                );
              }
            })()}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {(() => {
              const completedCount = pillarStats.filter(p => p.status === "completed").length;
              const inProgressPillar = pillarStats.find(p => p.status === "in-progress");

              if (completedCount === pillarStats.length) {
                return (
                  <>
                    <Button
                      size="lg"
                      onClick={() => router.push("/assessment/results")}
                    >
                      View Results
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push("/dashboard")}
                    >
                      Return to Dashboard
                    </Button>
                  </>
                );
              } else if (inProgressPillar) {
                return (
                  <>
                    <Button
                      size="lg"
                      onClick={() => handleContinueAssessment(inProgressPillar.pillar.slug)}
                    >
                      Continue {inProgressPillar.pillar.name}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push(`/assessment/${inProgressPillar.pillar.slug}/0`)}
                    >
                      Review from Start
                    </Button>
                  </>
                );
              } else {
                const governancePillar = pillarStats.find(p => p.pillar.slug === "family-governance");
                return (
                  <Button
                    size="lg"
                    onClick={() => governancePillar ? handleStartAssessment(governancePillar.pillar.slug) : undefined}
                    disabled={createAssessmentMutation.isPending}
                  >
                    {createAssessmentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Starting...
                      </>
                    ) : (
                      "Begin Assessment"
                    )}
                  </Button>
                );
              }
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
