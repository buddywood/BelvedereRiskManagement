/**
 * Cyber Risk Scoring Engine
 *
 * Thin wrapper around existing assessment scoring system for cyber risk pillar.
 * Delegates to proven calculatePillarScore engine to ensure consistent scoring
 * across all assessment domains.
 */

import { calculatePillarScore } from '../assessment/scoring';
import { cyberRiskPillar, cyberRiskQuestions } from './questions';
import { ScoreResult } from '../assessment/types';

/**
 * Calculate cyber risk score from user answers
 *
 * Delegates to existing calculatePillarScore engine to ensure consistency
 * with family governance scoring methodology.
 *
 * @param answers - User answers keyed by questionId
 * @param visibleQuestionIds - Optional array of question IDs to include in scoring
 * @returns ScoreResult with score (0-10), risk level, breakdown, and missing controls
 */
export function calculateCyberRiskScore(
  answers: Record<string, unknown>,
  visibleQuestionIds?: string[]
): ScoreResult {
  return calculatePillarScore(
    answers,
    cyberRiskPillar,
    cyberRiskQuestions,
    visibleQuestionIds
  );
}