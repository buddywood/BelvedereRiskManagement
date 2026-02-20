import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/assessment/store';
import { getVisibleQuestions } from '@/lib/assessment/branching';
import { allQuestions } from '@/lib/assessment/questions';
import { Question } from '@/lib/assessment/types';

/**
 * Assessment Navigation Hook
 *
 * Navigation logic with branching support.
 * Handles question flow, visibility, and progress tracking.
 */

export interface NavigationProgress {
  answered: number;
  total: number;
  percentage: number;
}

export interface UseAssessmentNavigationReturn {
  currentQuestion: Question | null;
  currentIndex: number;
  goNext: () => void;
  goBack: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
  progress: NavigationProgress;
  visibleQuestions: Question[];
}

export function useAssessmentNavigation(
  pillarSlug: string,
  questionIndex: number
): UseAssessmentNavigationReturn {
  const router = useRouter();
  const { answers, setCurrentPosition } = useAssessmentStore();

  // Filter questions for current pillar
  const pillarQuestions = allQuestions.filter((q) => q.pillar === pillarSlug);

  // Get visible questions based on branching rules
  const visibleQuestions = getVisibleQuestions(answers, pillarQuestions);

  // Get current question by index
  const currentQuestion = visibleQuestions[questionIndex] || null;

  // Calculate progress
  const answeredCount = visibleQuestions.filter((q) => {
    const answer = answers[q.id];
    return answer !== undefined && answer !== null;
  }).length;

  const progress: NavigationProgress = {
    answered: answeredCount,
    total: visibleQuestions.length,
    percentage: visibleQuestions.length > 0
      ? Math.round((answeredCount / visibleQuestions.length) * 100)
      : 0,
  };

  // Navigation state
  const canGoBack = questionIndex > 0;
  const isLastQuestion = questionIndex >= visibleQuestions.length - 1;

  // Navigation functions
  const goNext = () => {
    if (!currentQuestion) return;

    // Update store position
    setCurrentPosition(pillarSlug, questionIndex + 1);

    if (isLastQuestion) {
      // Last question in pillar - navigate to completion page
      router.push('/assessment/complete');
    } else {
      // Navigate to next visible question
      const nextIndex = questionIndex + 1;
      router.push(`/assessment/${pillarSlug}/${nextIndex}`);
    }
  };

  const goBack = () => {
    if (!canGoBack) return;

    const prevIndex = questionIndex - 1;

    // Update store position
    setCurrentPosition(pillarSlug, prevIndex);

    // Navigate to previous question
    router.push(`/assessment/${pillarSlug}/${prevIndex}`);
  };

  return {
    currentQuestion,
    currentIndex: questionIndex,
    goNext,
    goBack,
    canGoBack,
    isLastQuestion,
    progress,
    visibleQuestions,
  };
}
