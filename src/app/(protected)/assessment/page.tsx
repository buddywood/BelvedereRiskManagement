'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAssessmentStore } from '@/lib/assessment/store';
import { useHouseholdProfile } from '@/lib/hooks/useHouseholdProfile';
import { PillarCard } from '@/components/assessment/PillarCard';
import { OverallProgress } from '@/components/assessment/ProgressBar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Pillar } from '@/lib/assessment/types';
import { getVisibleQuestions } from '@/lib/assessment/branching';
import { allQuestions } from '@/lib/assessment/questions';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Assessment Hub Page
 *
 * Entry point for starting or resuming family governance assessments.
 * Implements server rehydration on mount for save/resume functionality.
 * Enhanced with smart resume to navigate to exact next required question.
 */

// MVP: Single pillar with 8 sub-categories (will expand in future phases)
const FAMILY_GOVERNANCE_PILLAR: Pillar = {
  id: 'family-governance',
  name: 'Family Governance',
  slug: 'family-governance',
  description: 'Evaluate your family\'s governance structures, decision-making processes, and succession planning.',
  estimatedMinutes: 25,
  subCategories: [
    { id: 'governance-structure', name: 'Governance Structure', description: 'Family councils and decision-making bodies', weight: 1, questionIds: [] },
    { id: 'decision-making', name: 'Decision Making', description: 'Processes and protocols', weight: 1, questionIds: [] },
    { id: 'conflict-resolution', name: 'Conflict Resolution', description: 'Dispute handling mechanisms', weight: 1, questionIds: [] },
    { id: 'succession-planning', name: 'Succession Planning', description: 'Leadership transition strategies', weight: 1, questionIds: [] },
    { id: 'communication', name: 'Communication', description: 'Family communication frameworks', weight: 1, questionIds: [] },
    { id: 'education', name: 'Education', description: 'Next generation preparation', weight: 1, questionIds: [] },
    { id: 'values-mission', name: 'Values & Mission', description: 'Family purpose and principles', weight: 1, questionIds: [] },
    { id: 'documentation', name: 'Documentation', description: 'Policies and formal agreements', weight: 1, questionIds: [] },
  ],
};

export default function AssessmentHubPage() {
  const router = useRouter();
  const store = useAssessmentStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Household profile for personalization
  const { profile } = useHouseholdProfile();

  // Fetch assessment data from server for rehydration (with timeout to avoid hanging)
  const FETCH_TIMEOUT_MS = 12_000;
  const { data: assessmentData, isError: assessmentFetchError } = useQuery({
    queryKey: ['assessment', store.assessmentId],
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
          throw new Error('Failed to fetch assessment');
        }

        return response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: !!store.assessmentId && !store.isHydrated,
    retry: 1,
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
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      store.setAssessmentId(data.id);
      store.setCurrentPosition('family-governance', 0);
      toast.success('Assessment started');
      router.push('/assessment/family-governance/0');
    },
    onError: () => {
      toast.error('Failed to start assessment');
    },
  });

  const handleStartAssessment = () => {
    createAssessmentMutation.mutate();
  };

  const handleContinueAssessment = () => {
    // Clean orphaned answers before resuming
    store.cleanOrphanedAnswers();

    // Smart resume: Find next unanswered question using branching logic
    const pillarQuestions = allQuestions.filter((q) => q.pillar === 'family-governance');
    const visibleQuestions = getVisibleQuestions(store.answers, pillarQuestions, profile);

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

    const pillar = store.currentPillar || 'family-governance';
    router.push(`/assessment/${pillar}/${nextQuestionIndex}`);
  };

  // Determine pillar status
  const getPillarStatus = () => {
    if (!store.assessmentId) return 'not-started';
    if (store.completedPillars.includes('family-governance')) return 'completed';
    return 'in-progress';
  };

  const pillarStatus = getPillarStatus();

  // Calculate accurate question count using branching logic
  const pillarQuestions = allQuestions.filter((q) => q.pillar === 'family-governance');
  const visibleQuestions = getVisibleQuestions(store.answers, pillarQuestions, profile);
  const questionsAnswered = visibleQuestions.filter((q) => {
    const answer = store.answers[q.id];
    return answer !== undefined && answer !== null;
  }).length;
  const totalQuestions = visibleQuestions.length || pillarQuestions.length;

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
            <div className="space-y-2 sm:space-y-3">
              <p className="editorial-kicker">Assessment Workspace</p>
              <h1 className="text-3xl font-semibold text-balance sm:text-5xl">
                Family Governance Assessment
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                A guided evaluation of governance structure, succession planning,
                communication, and decision-making practices designed for families
                operating with institutional rigor.
              </p>
            </div>

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

          <Card className="bg-background/60">
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-3 sm:pt-6">
              <div>
                <p className="editorial-kicker">Section</p>
                <p className="mt-2 text-xl font-semibold">1 Pillar</p>
              </div>
              <div>
                <p className="editorial-kicker">Duration</p>
                <p className="mt-2 text-xl font-semibold">~25 min</p>
              </div>
              <div>
                <p className="editorial-kicker">Status</p>
                <p className="mt-2 text-xl font-semibold">
                  {pillarStatus === 'not-started'
                    ? 'Ready'
                    : pillarStatus === 'in-progress'
                      ? 'In Progress'
                      : 'Completed'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {pillarStatus === 'in-progress' && store.assessmentId && (
        <Alert variant="info">
          <AlertTitle className="text-lg font-semibold">
            Welcome back
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              You&apos;ve completed <strong>{questionsAnswered}</strong> of <strong>{totalQuestions}</strong> visible questions.
              Continue from where you left off.
            </p>
            {store.lastSaved && (
              <p className="text-sm flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Last saved {formatDistanceToNow(new Date(store.lastSaved), { addSuffix: true })}
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
              totalPillars={1}
              currentPillar={store.currentPillar || undefined}
            />
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="editorial-kicker">Assessment Section</p>
          <h2 className="text-3xl font-semibold">Structured review</h2>
        </div>

        <div className="grid gap-4">
          <PillarCard
            pillar={FAMILY_GOVERNANCE_PILLAR}
            status={pillarStatus}
            questionsAnswered={questionsAnswered}
            totalQuestions={totalQuestions}
            onClick={pillarStatus === 'not-started' ? handleStartAssessment : handleContinueAssessment}
          />
        </div>
      </section>

      <section className="hero-surface rounded-[1.75rem] border-t section-divider p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="editorial-kicker">Next Step</p>
            {pillarStatus === 'not-started' ? (
              <p className="text-base leading-7 text-muted-foreground">
                Ready to begin? This assessment will take approximately {FAMILY_GOVERNANCE_PILLAR.estimatedMinutes} minutes and saves progress automatically.
              </p>
            ) : pillarStatus === 'in-progress' ? (
              <p className="text-base leading-7 text-muted-foreground">
                Continue your assessment to receive tailored governance recommendations and a scored summary.
              </p>
            ) : (
              <p className="text-base leading-7 text-muted-foreground">
                Your assessment is complete. Review your results, risk drivers, and recommended actions.
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {pillarStatus === 'not-started' ? (
              <Button
                size="lg"
                onClick={handleStartAssessment}
                disabled={createAssessmentMutation.isPending}
              >
                {createAssessmentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  'Begin Assessment'
                )}
              </Button>
            ) : pillarStatus === 'in-progress' ? (
              <>
                <Button size="lg" onClick={handleContinueAssessment}>
                  Continue Assessment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/assessment/family-governance/0')}
                >
                  Review from Start
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => router.push('/assessment/results')}>
                  View Results
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  Return to Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
