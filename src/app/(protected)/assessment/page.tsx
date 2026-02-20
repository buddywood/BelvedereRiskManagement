'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAssessmentStore } from '@/lib/assessment/store';
import { PillarCard } from '@/components/assessment/PillarCard';
import { OverallProgress } from '@/components/assessment/ProgressBar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Pillar } from '@/lib/assessment/types';

/**
 * Assessment Hub Page
 *
 * Entry point for starting or resuming family governance assessments.
 * Implements server rehydration on mount for save/resume functionality.
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

  // Fetch assessment data from server for rehydration
  const { data: assessmentData, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', store.assessmentId],
    queryFn: async () => {
      if (!store.assessmentId) return null;

      const response = await fetch(`/api/assessment/${store.assessmentId}`);

      if (response.status === 404) {
        // Assessment not found (deleted/expired), reset store
        store.resetAssessment();
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }

      return response.json();
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

    setIsInitializing(false);
  }, [assessmentData, store]);

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
    const pillar = store.currentPillar || 'family-governance';
    const questionIndex = store.currentQuestionIndex || 0;
    router.push(`/assessment/${pillar}/${questionIndex}`);
  };

  // Determine pillar status
  const getPillarStatus = () => {
    if (!store.assessmentId) return 'not-started';
    if (store.completedPillars.includes('family-governance')) return 'completed';
    return 'in-progress';
  };

  const pillarStatus = getPillarStatus();
  const questionsAnswered = Object.keys(store.answers).length;
  const totalQuestions = 40; // MVP: approximate count for Family Governance pillar

  // Show loading skeleton until hydrated
  if (isInitializing || (store.assessmentId && !store.isHydrated)) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Family Governance Assessment
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A guided evaluation of your family's governance structures and risk management practices.
          Complete the assessment to receive personalized recommendations.
        </p>
      </div>

      {/* Overall Progress */}
      {store.assessmentId && (
        <OverallProgress
          completedPillars={store.completedPillars}
          totalPillars={1}
          currentPillar={store.currentPillar || undefined}
        />
      )}

      {/* Pillar Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Assessment Sections
        </h2>
        <div className="grid gap-4">
          <PillarCard
            pillar={FAMILY_GOVERNANCE_PILLAR}
            status={pillarStatus}
            questionsAnswered={questionsAnswered}
            totalQuestions={totalQuestions}
            onClick={pillarStatus === 'not-started' ? handleStartAssessment : handleContinueAssessment}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col items-center gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-700">
        {pillarStatus === 'not-started' ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              Ready to begin? This assessment will take approximately {FAMILY_GOVERNANCE_PILLAR.estimatedMinutes} minutes.
              Your progress will be saved automatically.
            </p>
            <Button
              size="lg"
              onClick={handleStartAssessment}
              disabled={createAssessmentMutation.isPending}
            >
              {createAssessmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Begin Assessment'
              )}
            </Button>
          </>
        ) : pillarStatus === 'in-progress' ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              You have answered {questionsAnswered} of {totalQuestions} questions.
              Pick up where you left off.
            </p>
            <Button size="lg" onClick={handleContinueAssessment}>
              Continue Assessment
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              Assessment complete! View your results and recommendations.
            </p>
            <Button size="lg" onClick={() => router.push('/assessment/results')}>
              View Results
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
