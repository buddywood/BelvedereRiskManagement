import { TemplateId, TemplateData, TEMPLATE_REGISTRY } from './types';
import { ScoreResult, MissingControl, CategoryScore } from '../assessment/types';
import { getRiskLevel } from '../assessment/scoring';

/**
 * Map assessment data to template data for document generation
 * @param templateId - Template to generate data for
 * @param scoreData - Assessment score result
 * @param userEmail - User email for family name derivation
 * @returns Template data with placeholder values
 */
export function mapAssessmentToTemplate(
  templateId: TemplateId,
  scoreData: ScoreResult,
  userEmail: string
): TemplateData {
  // Find template metadata
  const template = TEMPLATE_REGISTRY.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found in registry`);
  }

  // Extract family name from email (prefix before @, fallback to "Your Family")
  const familyName = userEmail.split('@')[0] || 'Your Family';

  // Format assessment date as "Month Day, Year"
  const assessmentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Find category score for this template's sub-categories
  const categoryScore = findCategoryScore(scoreData, template.applicableSubCategories);
  const categoryRiskLevel = getRiskLevel(categoryScore);

  // Filter gaps to template's sub-categories
  const gaps = scoreData.missingControls
    .filter((control: MissingControl) => template.applicableSubCategories.includes(control.category))
    .map((control: MissingControl) => ({
      description: control.description || '',
      severity: control.severity || 'medium',
      recommendation: control.recommendation || ''
    }));

  // Identify strengths from categories with score >= 7.5 in relevant areas
  const strengths = scoreData.breakdown
    .filter((cat: CategoryScore) =>
      template.applicableSubCategories.includes(cat.categoryId) && cat.score >= 7.5
    )
    .map((cat: CategoryScore) => cat.categoryName || cat.categoryId);

  // Extract recommendations from missing controls
  const recommendations = scoreData.missingControls
    .filter((control: MissingControl) => template.applicableSubCategories.includes(control.category))
    .map((control: MissingControl) => control.recommendation || '')
    .filter((rec: string) => rec.length > 0);

  return {
    familyName,
    assessmentDate,
    overallScore: scoreData.score || 0,
    riskLevel: scoreData.riskLevel || 'medium',
    categoryScore: categoryScore,
    categoryRiskLevel,
    gaps,
    strengths,
    recommendations
  };
}

/**
 * Find the category score for template's applicable sub-categories
 * @param scoreData - Score result data
 * @param applicableSubCategories - Sub-categories for this template
 * @returns Average score across applicable sub-categories
 */
function findCategoryScore(scoreData: ScoreResult, applicableSubCategories: string[]): number {
  const relevantCategories = scoreData.breakdown.filter((cat: CategoryScore) =>
    applicableSubCategories.includes(cat.categoryId)
  );

  if (relevantCategories.length === 0) {
    return 0;
  }

  // Calculate weighted average of relevant categories
  const totalWeightedScore = relevantCategories.reduce((sum: number, cat: CategoryScore) =>
    sum + (cat.score * cat.weight), 0
  );
  const totalWeight = relevantCategories.reduce((sum: number, cat: CategoryScore) => sum + cat.weight, 0);

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}