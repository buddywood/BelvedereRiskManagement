/**
 * Branching Logic for Assessment Questions
 *
 * Implements conditional question display based on prerequisite answers.
 * Start simple with 1-level branching:
 * - Trust questions skip if no trusts
 * - Business questions skip if no family business
 * - Succession questions skip if no heirs
 */

import { Question } from './types';

/**
 * Determine if a question should be shown based on current answers
 *
 * @param question - Question to evaluate
 * @param answers - Current user answers
 * @returns true if question should be shown, false if skipped
 */
export function shouldShowQuestion(
  question: Question,
  answers: Record<string, unknown>
): boolean {
  // If no branching rule, always show
  if (!question.branchingRule) {
    return true;
  }

  const { dependsOn, showIf } = question.branchingRule;
  const dependencyAnswer = answers[dependsOn];

  // If dependency not answered yet, don't show this question
  if (dependencyAnswer === undefined || dependencyAnswer === null) {
    return false;
  }

  // Evaluate showIf condition
  return showIf(dependencyAnswer);
}

/**
 * Get next visible question in sequence
 *
 * @param currentId - Current question ID (or null for first question)
 * @param answers - Current user answers
 * @param allQuestions - All questions in order
 * @returns Next visible question ID, or null if end of assessment
 */
export function getNextQuestion(
  currentId: string | null,
  answers: Record<string, unknown>,
  allQuestions: Question[]
): string | null {
  // If no current question, return first question
  if (currentId === null) {
    if (allQuestions.length === 0) {
      return null;
    }
    return allQuestions[0].id;
  }

  // Find current question index
  const currentIndex = allQuestions.findIndex(q => q.id === currentId);

  // If not found or at end, return null
  if (currentIndex === -1 || currentIndex >= allQuestions.length - 1) {
    return null;
  }

  // Find next visible question
  for (let i = currentIndex + 1; i < allQuestions.length; i++) {
    const question = allQuestions[i];
    if (shouldShowQuestion(question, answers)) {
      return question.id;
    }
  }

  // No more visible questions
  return null;
}

/**
 * Get previous visible question in sequence
 *
 * Allows users to go back and change answers.
 *
 * @param currentId - Current question ID
 * @param answers - Current user answers
 * @param allQuestions - All questions in order
 * @returns Previous visible question ID, or null if at beginning
 */
export function getPreviousQuestion(
  currentId: string,
  answers: Record<string, unknown>,
  allQuestions: Question[]
): string | null {
  // Find current question index
  const currentIndex = allQuestions.findIndex(q => q.id === currentId);

  // If not found or at beginning, return null
  if (currentIndex <= 0) {
    return null;
  }

  // Find previous visible question
  for (let i = currentIndex - 1; i >= 0; i--) {
    const question = allQuestions[i];
    if (shouldShowQuestion(question, answers)) {
      return question.id;
    }
  }

  // No previous visible question
  return null;
}

/**
 * Filter questions to only those that should be visible
 *
 * @param answers - Current user answers
 * @param allQuestions - All questions
 * @returns Filtered array of visible questions
 */
export function getVisibleQuestions(
  answers: Record<string, unknown>,
  allQuestions: Question[]
): Question[] {
  return allQuestions.filter(question => shouldShowQuestion(question, answers));
}

/**
 * Calculate assessment completion percentage
 *
 * @param answers - Current user answers
 * @param allQuestions - All questions
 * @returns Percentage complete (0-100)
 */
export function calculateCompletionPercentage(
  answers: Record<string, unknown>,
  allQuestions: Question[]
): number {
  const visibleQuestions = getVisibleQuestions(answers, allQuestions);

  if (visibleQuestions.length === 0) {
    return 0;
  }

  const answeredCount = visibleQuestions.filter(q => {
    const answer = answers[q.id];
    return answer !== undefined && answer !== null;
  }).length;

  return Math.round((answeredCount / visibleQuestions.length) * 100);
}

/**
 * Get all required questions that are unanswered
 *
 * Used for validation before allowing submission.
 *
 * @param answers - Current user answers
 * @param allQuestions - All questions
 * @returns Array of required question IDs that are unanswered
 */
export function getUnansweredRequiredQuestions(
  answers: Record<string, unknown>,
  allQuestions: Question[]
): string[] {
  const visibleQuestions = getVisibleQuestions(answers, allQuestions);

  return visibleQuestions
    .filter(q => {
      if (!q.required) {
        return false;
      }

      const answer = answers[q.id];
      return answer === undefined || answer === null;
    })
    .map(q => q.id);
}

/**
 * Compare visible question sets before and after an answer change
 *
 * Used by the UI to know when to auto-navigate to newly-relevant questions
 * when user changes answers that previously triggered skips.
 *
 * @param previousAnswers - Answer state before the change
 * @param currentAnswers - Answer state after the change
 * @param allQuestions - All question definitions
 * @returns Object with newly visible, newly hidden, and unchanged question IDs
 */
export function detectBranchingChanges(
  previousAnswers: Record<string, unknown>,
  currentAnswers: Record<string, unknown>,
  allQuestions: Question[]
): {
  newlyVisible: string[];
  newlyHidden: string[];
  unchanged: string[];
} {
  const previousVisible = new Set(
    getVisibleQuestions(previousAnswers, allQuestions).map(q => q.id)
  );
  const currentVisible = new Set(
    getVisibleQuestions(currentAnswers, allQuestions).map(q => q.id)
  );

  const newlyVisible: string[] = [];
  const newlyHidden: string[] = [];
  const unchanged: string[] = [];

  // Find all question IDs that could be affected
  const allQuestionIds = new Set([
    ...allQuestions.map(q => q.id),
    ...Array.from(previousVisible),
    ...Array.from(currentVisible),
  ]);

  for (const questionId of allQuestionIds) {
    const wasVisible = previousVisible.has(questionId);
    const isVisible = currentVisible.has(questionId);

    if (!wasVisible && isVisible) {
      newlyVisible.push(questionId);
    } else if (wasVisible && !isVisible) {
      newlyHidden.push(questionId);
    } else if (wasVisible && isVisible) {
      unchanged.push(questionId);
    }
    // Questions that were not visible before and are still not visible are ignored
  }

  return {
    newlyVisible: newlyVisible.sort(),
    newlyHidden: newlyHidden.sort(),
    unchanged: unchanged.sort(),
  };
}

/**
 * Get question IDs that have answers but are currently NOT visible (hidden by branching)
 *
 * These orphaned answers must be excluded from scoring to prevent skipped sections
 * from affecting the score calculation.
 *
 * @param answers - Current user answers
 * @param allQuestions - All question definitions
 * @returns Array of question IDs that are answered but currently hidden
 */
export function getOrphanedAnswerIds(
  answers: Record<string, unknown>,
  allQuestions: Question[]
): string[] {
  const visibleQuestionIds = new Set(
    getVisibleQuestions(answers, allQuestions).map(q => q.id)
  );

  const orphanedIds: string[] = [];

  for (const [questionId, answer] of Object.entries(answers)) {
    // Skip questions with no answer
    if (answer === undefined || answer === null) {
      continue;
    }

    // If question has an answer but is not currently visible, it's orphaned
    if (!visibleQuestionIds.has(questionId)) {
      orphanedIds.push(questionId);
    }
  }

  return orphanedIds.sort();
}
