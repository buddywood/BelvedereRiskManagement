'use client';

import { use, useEffect } from 'react';
import { useAssessmentStore } from '@/lib/assessment/store';
import { useAssessmentNavigation } from '@/lib/hooks/useAssessmentNavigation';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { NavigationButtons } from '@/components/assessment/NavigationButtons';
import { SectionProgress } from '@/components/assessment/ProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

/**
 * Dynamic Question Route Page
 *
 * One-question-per-screen assessment flow.
 * URL pattern: /assessment/family-governance/0
 *
 * Handles:
 * - Question display with answer options
 * - Auto-save with debouncing
 * - Navigation with branching logic
 * - Progress tracking
 * - Validation
 */

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
  const { assessmentId, answers } = useAssessmentStore();

  // Navigation logic
  const {
    currentQuestion,
    goNext,
    goBack,
    canGoBack,
    isLastQuestion,
    progress,
    visibleQuestions,
    branchingChange,
  } = useAssessmentNavigation(pillarSlug, questionIndex);

  // Auto-save
  const { saveAnswer, isSaving } = useAutoSave(assessmentId);

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

  // Auto-navigation on branching changes
  useEffect(() => {
    if (branchingChange && branchingChange.newlyVisible.length > 0) {
      // Find the first newly-visible question in the current pillar's visible questions
      const firstNewlyVisibleId = branchingChange.newlyVisible[0];
      const newlyVisibleIndex = visibleQuestions.findIndex(q => q.id === firstNewlyVisibleId);

      if (newlyVisibleIndex !== -1) {
        // Navigate to the first newly-visible question
        router.push(`/assessment/${pillarSlug}/${newlyVisibleIndex}`);
      }
    }
  }, [branchingChange, visibleQuestions, pillarSlug, router]);

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
      <section className="hero-surface rounded-[1.75rem] p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionProgress
            answeredCount={progress.answered}
            totalCount={progress.total}
            pillarName="Family Governance"
          />

          <Card className="bg-background/60">
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
        <CardContent className="space-y-8 pt-8">
          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
            onSkip={!currentQuestion.required ? handleSkip : undefined}
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
