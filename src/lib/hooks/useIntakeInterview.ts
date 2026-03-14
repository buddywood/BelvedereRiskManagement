import { useMemo } from 'react';
import { useIntakeStore, type InterviewResponse } from '@/lib/intake/store';
import { INTAKE_QUESTIONS, type IntakeQuestion } from '@/lib/intake/questions';

/**
 * Intake Interview Navigation Hook
 *
 * Orchestration hook that combines store state with navigation logic.
 * Follows the pattern established by useAssessmentNavigation.
 */

// IntakeQuestion interface is now imported from intake/questions.ts

export interface UseIntakeInterviewReturn {
  currentQuestion: IntakeQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToNext: () => void;
  goToPrev: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  getResponseForQuestion: (questionId: string) => InterviewResponse | undefined;
}

export function useIntakeInterview(interviewId: string): UseIntakeInterviewReturn {
  const {
    currentQuestionIndex,
    responses,
    setCurrentQuestion,
    setInterviewId,
    setStatus,
  } = useIntakeStore();

  // Initialize interview ID if provided and different from current
  const currentInterviewId = useIntakeStore(state => state.interviewId);
  if (interviewId && interviewId !== currentInterviewId) {
    setInterviewId(interviewId);
    setStatus('in_progress');
  }

  // Get current question
  const currentQuestion = INTAKE_QUESTIONS[currentQuestionIndex] || null;

  // Calculate progress
  const progress = Math.round((currentQuestionIndex / INTAKE_QUESTIONS.length) * 100);

  // Navigation state
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex >= INTAKE_QUESTIONS.length - 1;

  // Check if current question has a response
  const currentQuestionResponse = currentQuestion
    ? responses[currentQuestion.id]
    : undefined;

  const hasCurrentResponse = Boolean(currentQuestionResponse?.audioUrl &&
    currentQuestionResponse?.status === 'completed');

  // Navigation conditions
  const canGoNext = currentQuestionIndex < INTAKE_QUESTIONS.length - 1 ||
    (isLastQuestion && hasCurrentResponse);

  const canGoPrev = currentQuestionIndex > 0;

  // Navigation functions
  const goToNext = () => {
    if (isLastQuestion && hasCurrentResponse) {
      // On last question with response - signals ready to submit
      // UI component in Plan 05 will handle actual submission
      return;
    }

    if (currentQuestionIndex < INTAKE_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestion(nextIndex);
    }
  };

  const goToPrev = () => {
    if (canGoPrev) {
      const prevIndex = Math.max(0, currentQuestionIndex - 1);
      setCurrentQuestion(prevIndex);
    }
  };

  // Response lookup function
  const getResponseForQuestion = (questionId: string): InterviewResponse | undefined => {
    return responses[questionId];
  };

  return {
    currentQuestion,
    currentIndex: currentQuestionIndex,
    totalQuestions: INTAKE_QUESTIONS.length,
    progress,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    isFirstQuestion,
    isLastQuestion,
    getResponseForQuestion,
  };
}