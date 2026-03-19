/**
 * AI-Powered Identity Risk Recommendation Engine
 *
 * Generates personalized identity protection recommendations based on assessment results.
 * Uses OpenAI for contextual advice with fallback to static recommendations.
 */

import { getOpenAIClient } from '@/lib/openai';
import { ScoreResult, MissingControl } from '@/lib/assessment/types';

export interface IdentityRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * Generate AI-powered identity risk recommendations
 *
 * @param scoreResult - Assessment scoring results with breakdown and missing controls
 * @param answers - User responses from the identity risk assessment
 * @returns Promise resolving to array of personalized recommendations
 */
export async function generateIdentityRecommendations(
  scoreResult: ScoreResult,
  answers: Record<string, unknown>
): Promise<IdentityRecommendation[]> {
  try {
    const client = getOpenAIClient();

    // Build structured prompt from assessment data
    const prompt = buildRecommendationPrompt(scoreResult, answers);

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an identity protection and privacy advisor for high-net-worth families. Generate specific, actionable recommendations based on their identity risk assessment. Focus on practical steps to reduce exposure and protect privacy. Each recommendation should be something the family can implement within a week.

Return recommendations as a JSON array with this exact structure:
[
  {
    "title": "Brief action-oriented title",
    "description": "Specific implementation steps",
    "priority": "high" | "medium" | "low",
    "category": "Social Exposure" | "Public Information" | "Digital Footprint" | "Family Visibility"
  }
]

Provide 3-5 recommendations prioritized by impact and urgency.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse and validate the JSON response
    const recommendations = JSON.parse(content) as IdentityRecommendation[];

    if (!Array.isArray(recommendations)) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate structure and return
    return recommendations.filter(isValidRecommendation);
  } catch (error) {
    console.warn('OpenAI recommendation generation failed:', error);

    // Fallback to static recommendations based on missing controls
    return generateFallbackRecommendations(scoreResult);
  }
}

/**
 * Build structured prompt from assessment results and answers
 */
function buildRecommendationPrompt(scoreResult: ScoreResult, answers: Record<string, unknown>): string {
  const { score, riskLevel, breakdown, missingControls } = scoreResult;

  // Extract key answer patterns for context
  const answerPatterns = extractAnswerPatterns(answers);

  // Find lowest scoring categories for targeted advice
  const weakestAreas = breakdown
    .map(cat => ({ name: cat.categoryName, score: (cat.score / cat.maxScore) * 10 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  return `Family Identity Risk Assessment Results:

OVERALL SCORE: ${score.toFixed(1)}/10 (${riskLevel.toUpperCase()} risk)

WEAKEST AREAS:
${weakestAreas.map(area => `- ${area.name}: ${area.score.toFixed(1)}/10`).join('\n')}

MISSING CONTROLS IDENTIFIED:
${missingControls.map(control => `- ${control.description} (${control.severity})`).join('\n')}

KEY ASSESSMENT INSIGHTS:
${answerPatterns.join('\n')}

Please provide specific, actionable recommendations to reduce identity exposure and improve privacy protection. Focus on the weakest areas and missing controls identified above.`;
}

/**
 * Extract meaningful patterns from user answers for contextual recommendations
 */
function extractAnswerPatterns(answers: Record<string, unknown>): string[] {
  const patterns: string[] = [];

  // Check for common identity risk patterns based on question IDs
  // Note: These would be based on actual question IDs from identity risk assessment

  // Social media privacy patterns
  if (answers['identity-social-privacy'] === 'public' || answers['identity-social-privacy'] === 'friends') {
    patterns.push('- Social media profiles have loose privacy settings');
  }

  // Public information exposure patterns
  if (answers['identity-public-search'] === 'extensive' || answers['identity-public-search'] === 'moderate') {
    patterns.push('- Family information appears in public search results and data broker sites');
  }

  // Digital footprint patterns
  if (answers['identity-digital-accounts'] === 'many' || answers['identity-digital-accounts'] === 'unknown') {
    patterns.push('- Large or untracked digital footprint across online services');
  }

  // Family visibility patterns
  if (answers['identity-family-sharing'] === 'frequent' || answers['identity-family-sharing'] === 'unrestricted') {
    patterns.push('- Family shares personal information freely on social platforms');
  }

  // Location sharing patterns
  if (answers['identity-location-sharing'] === 'enabled' || answers['identity-location-sharing'] === 'always') {
    patterns.push('- Location sharing enabled on social media and mobile apps');
  }

  return patterns.length > 0 ? patterns : ['- No specific risk patterns identified'];
}

/**
 * Generate fallback recommendations when OpenAI is unavailable
 *
 * Maps missing controls to static, proven recommendations.
 */
export function generateFallbackRecommendations(scoreResult: ScoreResult): IdentityRecommendation[] {
  const { missingControls, riskLevel } = scoreResult;
  const recommendations: IdentityRecommendation[] = [];

  // High priority recommendations based on missing controls
  const highPriorityControls = missingControls.filter(c => c.severity === 'high');

  highPriorityControls.forEach(control => {
    const rec = mapControlToRecommendation(control, 'high');
    if (rec) recommendations.push(rec);
  });

  // Add medium priority recommendations if we have fewer than 3
  if (recommendations.length < 3) {
    const mediumPriorityControls = missingControls.filter(c => c.severity === 'medium');

    mediumPriorityControls.slice(0, 3 - recommendations.length).forEach(control => {
      const rec = mapControlToRecommendation(control, 'medium');
      if (rec) recommendations.push(rec);
    });
  }

  // Add general recommendations based on risk level if still low count
  if (recommendations.length < 2) {
    recommendations.push(...getGeneralRecommendationsByRiskLevel(riskLevel));
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
}

/**
 * Map a missing control to a specific recommendation
 */
function mapControlToRecommendation(control: MissingControl, priority: 'high' | 'medium' | 'low'): IdentityRecommendation | null {
  // Map common control patterns to recommendations
  const controlMappings: Record<string, Omit<IdentityRecommendation, 'priority'>> = {
    'social-exposure': {
      title: 'Review and Restrict Social Media Privacy Settings',
      description: 'Audit all social media accounts and set profiles to private. Remove or hide personal information like location, workplace, and family details from public view.',
      category: 'Social Exposure',
    },
    'public-information': {
      title: 'Submit Data Broker Opt-Out Requests',
      description: 'Submit opt-out requests to major data broker sites including Spokeo, Whitepages, BeenVerified, Intelius, and PeopleFinder. Use DeleteMe or Privacy Bee for automated removal.',
      category: 'Public Information',
    },
    'digital-footprint': {
      title: 'Audit and Close Unused Online Accounts',
      description: 'Review and close unused online accounts, use unique email aliases for different services, and remove personal information from old profiles and registrations.',
      category: 'Digital Footprint',
    },
    'family-visibility': {
      title: 'Establish Family Social Media Guidelines',
      description: 'Create family guidelines for social media use, including restrictions on tagging family members, sharing location information, and posting about family activities or wealth.',
      category: 'Family Visibility',
    },
  };

  // Simple keyword matching to find appropriate recommendation
  const controlText = control.description.toLowerCase();

  for (const [key, template] of Object.entries(controlMappings)) {
    if (controlText.includes(key.replace('-', ' ')) || controlText.includes(key)) {
      return { ...template, priority };
    }
  }

  return null;
}

/**
 * Get general recommendations based on overall risk level
 */
function getGeneralRecommendationsByRiskLevel(riskLevel: string): IdentityRecommendation[] {
  const general: Record<string, IdentityRecommendation[]> = {
    high: [
      {
        title: 'Immediate Privacy Audit',
        description: 'Conduct an urgent review of all online presence including social media, professional profiles, and public records. Remove sensitive information immediately.',
        priority: 'high',
        category: 'Social Exposure',
      },
    ],
    medium: [
      {
        title: 'Regular Privacy Maintenance',
        description: 'Schedule quarterly reviews of social media privacy settings and annual checks for new data broker listings. Monitor family online activity regularly.',
        priority: 'medium',
        category: 'Digital Footprint',
      },
    ],
    low: [
      {
        title: 'Maintain Privacy Best Practices',
        description: 'Continue current privacy practices and educate family members about safe social media use. Consider annual privacy posture reviews.',
        priority: 'low',
        category: 'Family Visibility',
      },
    ],
  };

  return general[riskLevel] || general['medium'];
}

/**
 * Validate recommendation structure
 */
function isValidRecommendation(rec: any): rec is IdentityRecommendation {
  return (
    typeof rec === 'object' &&
    typeof rec.title === 'string' &&
    typeof rec.description === 'string' &&
    ['high', 'medium', 'low'].includes(rec.priority) &&
    typeof rec.category === 'string'
  );
}