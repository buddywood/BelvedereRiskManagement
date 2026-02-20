/**
 * Assessment Scoring Engine
 *
 * Implements hierarchical weighted scoring for assessment results.
 * Calculates pillar scores by aggregating sub-category scores, which
 * aggregate question scores. Unanswered questions are excluded from
 * calculations (not treated as 0).
 */

import {
  Question,
  Pillar,
  ScoreResult,
  CategoryScore,
  MissingControl,
  RiskLevel,
} from './types';

/**
 * Calculate pillar score from user answers
 *
 * Algorithm:
 * 1. For each sub-category, calculate weighted average of answered questions only
 * 2. Aggregate sub-categories using their weights
 * 3. Unanswered questions are excluded (not treated as 0)
 * 4. Track percentage answered for completeness indicator
 *
 * @param answers - User answers keyed by questionId
 * @param pillar - Pillar definition with sub-categories
 * @param allQuestions - All question definitions
 * @returns ScoreResult with score (0-10), risk level, breakdown, and missing controls
 */
export function calculatePillarScore(
  answers: Record<string, unknown>,
  pillar: Pillar,
  allQuestions: Question[]
): ScoreResult {
  const categoryScores: CategoryScore[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Calculate score for each sub-category
  for (const subCategory of pillar.subCategories) {
    const categoryQuestions = allQuestions.filter(
      q => q.subCategory === subCategory.id
    );

    let categoryWeightedScore = 0;
    let categoryWeight = 0;

    // Calculate weighted average for this category (answered questions only)
    for (const question of categoryQuestions) {
      const answer = answers[question.id];

      // Skip unanswered questions
      if (answer === undefined || answer === null) {
        continue;
      }

      // Get score from scoreMap
      const answerKey = String(answer);
      const questionScore = question.scoreMap[answerKey];

      if (questionScore !== undefined) {
        categoryWeightedScore += questionScore * question.weight;
        categoryWeight += question.weight;
      }
    }

    // Calculate category score (0 if no questions answered)
    const categoryScore = categoryWeight > 0
      ? categoryWeightedScore / categoryWeight
      : 0;

    categoryScores.push({
      categoryId: subCategory.id,
      categoryName: subCategory.name,
      score: Math.round(categoryScore * 100) / 100, // Round to 2 decimals
      weight: subCategory.weight,
      maxScore: 10,
    });

    // Accumulate for pillar score
    totalWeightedScore += categoryScore * subCategory.weight;
    totalWeight += subCategory.weight;
  }

  // Calculate overall pillar score
  const pillarScore = totalWeight > 0
    ? totalWeightedScore / totalWeight
    : 0;

  // Determine risk level
  const riskLevel = getRiskLevel(pillarScore);

  // Identify missing controls
  const missingControls = identifyMissingControls(answers, allQuestions);

  return {
    score: Math.round(pillarScore * 100) / 100, // Round to 2 decimals
    riskLevel,
    breakdown: categoryScores,
    missingControls,
  };
}

/**
 * Map numeric score to risk level
 *
 * Score is 0-10 where 10 = excellent governance, 0 = no governance.
 * This inverts the "risk" mental model: LOW risk = HIGH governance score.
 *
 * @param score - Numeric score (0-10 scale)
 * @returns RiskLevel classification
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 7.5) {
    return 'low';
  }
  if (score >= 5.0) {
    return 'medium';
  }
  if (score >= 2.5) {
    return 'high';
  }
  return 'critical';
}

/**
 * Identify missing controls from answered questions
 *
 * Finds questions where answer indicates absence of control (score <= 2 on 0-10 scale).
 * Returns top 5 sorted by severity (weight * deficit).
 *
 * @param answers - User answers keyed by questionId
 * @param questions - Question definitions to check
 * @returns Array of missing controls sorted by severity
 */
export function identifyMissingControls(
  answers: Record<string, unknown>,
  questions: Question[]
): MissingControl[] {
  const controls: Array<MissingControl & { severityScore: number }> = [];

  for (const question of questions) {
    const answer = answers[question.id];

    // Skip unanswered questions
    if (answer === undefined || answer === null) {
      continue;
    }

    // Get score from scoreMap
    const answerKey = String(answer);
    const questionScore = question.scoreMap[answerKey];

    // Identify low scores as missing controls (score <= 2 out of 10)
    if (questionScore !== undefined && questionScore <= 2) {
      const deficit = 10 - questionScore;
      const severityScore = question.weight * deficit;

      // Determine severity level
      let severity: 'high' | 'medium' | 'low';
      if (severityScore >= 30) {
        severity = 'high';
      } else if (severityScore >= 15) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      controls.push({
        questionId: question.id,
        category: question.subCategory,
        description: question.text,
        severity,
        recommendation: generateRecommendation(question),
        severityScore,
      });
    }
  }

  // Sort by severity score (descending) and take top 5
  controls.sort((a, b) => b.severityScore - a.severityScore);

  // Remove severityScore from output (internal calculation only)
  return controls.slice(0, 5).map(({ severityScore, ...control }) => control);
}

/**
 * Generate recommendation based on question context
 *
 * Uses question's learnMore if available, otherwise constructs
 * recommendation from help text.
 *
 * @param question - Question definition
 * @returns Recommendation text
 */
function generateRecommendation(question: Question): string {
  if (question.learnMore) {
    return question.learnMore;
  }

  if (question.helpText) {
    return `Consider implementing: ${question.helpText}`;
  }

  return 'Review and strengthen this control to reduce risk exposure.';
}
