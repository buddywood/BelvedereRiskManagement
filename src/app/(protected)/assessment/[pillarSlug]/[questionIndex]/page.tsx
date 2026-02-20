'use client';

import { use, useEffect } from 'react';
import { useAssessmentStore } from '@/lib/assessment/store';
import { useAssessmentNavigation } from '@/lib/hooks/useAssessmentNavigation';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { NavigationButtons } from '@/components/assessment/NavigationButtons';
import { SectionProgress } from '@/components/assessment/ProgressBar';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-zinc-500">Loading question...</div>
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Section Progress */}
        <div className="mb-8">
          <SectionProgress
            answeredCount={progress.answered}
            totalCount={progress.total}
            pillarName="Family Governance"
          />
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
            onSkip={!currentQuestion.required ? handleSkip : undefined}
          />

          {/* Navigation */}
          <NavigationButtons
            onBack={goBack}
            onNext={handleNext}
            canGoBack={canGoBack}
            isLastQuestion={isLastQuestion}
            isValid={isValid}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
