'use client';

import { use, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAssessmentStore } from '@/lib/assessment/store';
import { useAssessmentNavigation } from '@/lib/hooks/useAssessmentNavigation';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useHouseholdProfile } from '@/lib/hooks/useHouseholdProfile';
import { getPersonalizedText } from '@/lib/assessment/personalization';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { NavigationButtons } from '@/components/assessment/NavigationButtons';
import { SectionProgress } from '@/components/assessment/ProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import type { CustomizationConfig } from '@/lib/assessment/customization';
import { allQuestions, familyGovernancePillar } from '@/lib/assessment/questions';
import { allIdentityQuestions, identityRiskPillar } from '@/lib/identity-risk/questions';
import { Question, Pillar } from '@/lib/assessment/types';
import type { GovernanceQuestionWire } from '@/lib/assessment/bank/behaviors';
import { wireQuestionsToQuestions } from '@/lib/assessment/bank/behaviors';
import { GOVERNANCE_ASSESSMENT_QUESTIONS_QUERY_KEY } from '@/lib/assessment/bank/query-keys';

/**
 * Dynamic Question Route Page
 *
 * One-question-per-screen assessment flow.
 * URL pattern: /assessment/{pillar-slug}/{question-index}
 *
 * Handles:
 * - Question display with answer options
 * - Auto-save with debouncing
 * - Navigation with branching logic
 * - Progress tracking
 * - Validation
 * - Multi-pillar support (comprehensive + identity-risk)
 */

/**
 * Helper function to get questions and pillar info for a given pillar slug
 */
function getQuestionsForPillar(pillarSlug: string): { questions: Question[]; pillar: Pillar | null } {
  switch (pillarSlug) {
    case 'family-governance':
      return {
        questions: allQuestions,
        pillar: familyGovernancePillar,
      };
    case 'identity-risk':
      return {
        questions: allIdentityQuestions,
        pillar: identityRiskPillar
      };
    default:
      return { questions: [], pillar: null };
  }
}

interface QuestionPageProps {
  params: Promise<{
    pillarSlug: string;
    questionIndex: string;
  }>;
}

export default function QuestionPage({ params }: QuestionPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const pillarSlug = resolvedParams.pillarSlug;
  const questionIndex = parseInt(resolvedParams.questionIndex, 10);

  // Assessment state
  const { assessmentId, answers, setHouseholdProfile, setFamilyGovernanceQuestionBank } =
    useAssessmentStore();

  // Household profile for personalization
  const { profile } = useHouseholdProfile();

  const { data: governanceWireResponse, isLoading: governanceBankLoading } = useQuery<{
    questions: GovernanceQuestionWire[];
  }>({
    queryKey: GOVERNANCE_ASSESSMENT_QUESTIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('/api/assessment/governance-questions');
      if (!response.ok) {
        throw new Error('Failed to fetch governance questions');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: pillarSlug === 'family-governance',
  });

  const effectiveGovernanceQuestions = useMemo(() => {
    if (governanceWireResponse?.questions?.length) {
      return wireQuestionsToQuestions(governanceWireResponse.questions);
    }
    return allQuestions;
  }, [governanceWireResponse]);

  useEffect(() => {
    if (pillarSlug === 'family-governance') {
      setFamilyGovernanceQuestionBank(effectiveGovernanceQuestions);
    }
  }, [pillarSlug, effectiveGovernanceQuestions, setFamilyGovernanceQuestionBank]);

  const pillarPack = getQuestionsForPillar(pillarSlug);
  const pillarQuestions =
    pillarSlug === 'family-governance' ? effectiveGovernanceQuestions : pillarPack.questions;
  const currentPillar = pillarPack.pillar;

  // Fetch customization configuration (only applicable to family-governance pillar)
  const { data: customizationConfig, isLoading: customizationLoading } = useQuery<CustomizationConfig>({
    queryKey: ['assessment-customization'],
    queryFn: async () => {
      const response = await fetch('/api/assessment/customization');

      if (!response.ok) {
        throw new Error('Failed to fetch customization config');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: pillarSlug === 'family-governance', // Only fetch for governance pillar
  });

  // Extract visible subcategories for navigation filtering (governance only)
  const visibleSubCategories = pillarSlug === 'family-governance' &&
    customizationConfig?.isCustomized &&
    customizationConfig.visibleSubCategories.length > 0
    ? customizationConfig.visibleSubCategories
    : undefined;

  // Navigation logic (with customization filtering and pillar-specific questions)
  const {
    currentQuestion,
    goNext,
    goBack,
    canGoBack,
    isLastQuestion,
    progress,
    visibleQuestions,
    branchingChange,
  } = useAssessmentNavigation(pillarSlug, questionIndex, {
    visibleSubCategories,
    questions: pillarQuestions
  });

  // Store profile in zustand on load
  useEffect(() => {
    setHouseholdProfile(profile);
  }, [profile, setHouseholdProfile]);

  // Auto-save
  const { saveAnswer, isSaving } = useAutoSave(assessmentId);

  // Cyber module merged into comprehensive assessment — old URLs go to hub
  useEffect(() => {
    if (pillarSlug === 'cyber-risk') {
      router.replace('/assessment');
    }
  }, [pillarSlug, router]);

  // Redirect if no assessment
  useEffect(() => {
    if (!assessmentId) {
      router.push('/assessment');
    }
  }, [assessmentId, router]);

  // Handle invalid question index
  useEffect(() => {
    if (questionIndex < 0 || questionIndex >= visibleQuestions.length) {
      // Invalid index - redirect to first question or assessment page
      if (visibleQuestions.length > 0) {
        router.push(`/assessment/${pillarSlug}/0`);
      } else {
        router.push('/assessment');
      }
    }
  }, [questionIndex, visibleQuestions.length, pillarSlug, router]);

  // Auto-navigation on branching changes (must stay before any conditional returns)
  useEffect(() => {
    if (branchingChange && branchingChange.newlyVisible.length > 0) {
      const firstNewlyVisibleId = branchingChange.newlyVisible[0];
      const newlyVisibleIndex = visibleQuestions.findIndex((q) => q.id === firstNewlyVisibleId);

      if (newlyVisibleIndex !== -1) {
        router.push(`/assessment/${pillarSlug}/${newlyVisibleIndex}`);
      }
    }
  }, [branchingChange, visibleQuestions, pillarSlug, router]);

  // Show loading while customization config and governance bank are loading (governance only)
  if (pillarSlug === 'family-governance' && (customizationLoading || governanceBankLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">Loading assessment configuration...</div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">Loading question...</div>
        </div>
      </div>
    );
  }

  // Get current answer from store
  const currentAnswer = answers[currentQuestion.id];

  // Compute personalized text for current question
  const personalizedText = currentQuestion
    ? getPersonalizedText(currentQuestion, profile)
    : undefined;

  // Handle answer selection
  const handleAnswer = (answer: unknown) => {
    saveAnswer({
      questionId: currentQuestion.id,
      pillar: currentQuestion.pillar,
      subCategory: currentQuestion.subCategory,
      answer,
      currentQuestionIndex: questionIndex,
    });
  };

  // Handle skip
  const handleSkip = () => {
    saveAnswer({
      questionId: currentQuestion.id,
      pillar: currentQuestion.pillar,
      subCategory: currentQuestion.subCategory,
      answer: null,
      skipped: true,
      currentQuestionIndex: questionIndex,
    });
    goNext();
  };

  // Handle next
  const handleNext = () => {
    // Validate if required
    if (currentQuestion.required && (currentAnswer === null || currentAnswer === undefined)) {
      // Validation error will be shown by QuestionCard
      return;
    }

    goNext();
  };

  // Determine if current answer is valid
  const isValid =
    !currentQuestion.required ||
    (currentAnswer !== null && currentAnswer !== undefined);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionProgress
            answeredCount={progress.answered}
            totalCount={progress.total}
            pillarName={currentPillar?.name || 'Assessment'}
          />

          <div className="flex flex-wrap gap-2 sm:hidden">
            <div className="rounded-full border section-divider bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              Question {questionIndex + 1} / {visibleQuestions.length}
            </div>
            <div className="rounded-full border section-divider bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              {currentQuestion.required ? 'Required' : 'Optional'}
            </div>
            <div className="rounded-full border section-divider bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              {isSaving ? 'Saving...' : 'Autosave active'}
            </div>
          </div>

          <Card className="hidden bg-background/60 sm:block">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
              <div>
                <p className="editorial-kicker">Question</p>
                <p className="mt-2 text-xl font-semibold">
                  {questionIndex + 1} / {visibleQuestions.length}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Status</p>
                <p className="mt-2 text-xl font-semibold">
                  {currentQuestion.required ? 'Required' : 'Optional'}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Autosave</p>
                <p className="mt-2 text-xl font-semibold">
                  {isSaving ? 'Saving' : 'Active'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="space-y-6 pt-6 sm:space-y-8 sm:pt-8">
          <QuestionCard
            question={currentQuestion}
            personalizedText={personalizedText}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
            onSkip={!currentQuestion.required ? handleSkip : undefined}
            questionPosition={{
              index: questionIndex + 1,
              total: visibleQuestions.length,
            }}
            moduleName={currentPillar?.name}
          />

          <NavigationButtons
            onBack={goBack}
            onNext={handleNext}
            canGoBack={canGoBack}
            isLastQuestion={isLastQuestion}
            isValid={isValid}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
