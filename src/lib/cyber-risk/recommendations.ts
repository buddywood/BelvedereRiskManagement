/**
 * AI-Powered Cyber Risk Recommendation Engine
 *
 * Generates personalized cybersecurity recommendations based on assessment results.
 * Uses OpenAI for contextual advice with fallback to static recommendations.
 */

import { getOpenAIClient } from '@/lib/openai';
import { ScoreResult, MissingControl } from '@/lib/assessment/types';

export interface CyberRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * Generate AI-powered cyber risk recommendations
 *
 * @param scoreResult - Assessment scoring results with breakdown and missing controls
 * @param answers - User responses from the cyber risk assessment
 * @returns Promise resolving to array of personalized recommendations
 */
export async function generateCyberRecommendations(
  scoreResult: ScoreResult,
  answers: Record<string, unknown>
): Promise<CyberRecommendation[]> {
  try {
    const client = getOpenAIClient();

    // Build structured prompt from assessment data
    const prompt = buildRecommendationPrompt(scoreResult, answers);

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a cybersecurity advisor for high-net-worth families. Generate specific, actionable recommendations based on their cyber risk assessment. Focus on practical steps, not technical jargon. Each recommendation should be something the family can implement within a week.

Return recommendations as a JSON array with this exact structure:
[
  {
    "title": "Brief action-oriented title",
    "description": "Specific implementation steps",
    "priority": "high" | "medium" | "low",
    "category": "Digital Hygiene" | "Identity Protection" | "Banking Security" | "Payment Risk"
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
    const recommendations = JSON.parse(content) as CyberRecommendation[];

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

  return `Family Cyber Risk Assessment Results:

OVERALL SCORE: ${score.toFixed(1)}/10 (${riskLevel.toUpperCase()} risk)

WEAKEST AREAS:
${weakestAreas.map(area => `- ${area.name}: ${area.score.toFixed(1)}/10`).join('\n')}

MISSING CONTROLS IDENTIFIED:
${missingControls.map(control => `- ${control.description} (${control.severity})`).join('\n')}

KEY ASSESSMENT INSIGHTS:
${answerPatterns.join('\n')}

Please provide specific, actionable recommendations to improve their cyber security posture. Focus on the weakest areas and missing controls identified above.`;
}

/**
 * Extract meaningful patterns from user answers for contextual recommendations
 */
function extractAnswerPatterns(answers: Record<string, unknown>): string[] {
  const patterns: string[] = [];

  // Check for common security patterns based on question IDs
  // Note: These would be based on actual question IDs from cyber risk assessment

  // MFA usage patterns
  if (answers['cyber-identity-mfa'] === 'none') {
    patterns.push('- Family does not use multi-factor authentication');
  } else if (answers['cyber-identity-mfa'] === 'sms') {
    patterns.push('- Family uses SMS-based MFA (vulnerable to SIM swapping)');
  }

  // Password management
  if (answers['cyber-digital-passwords'] === 'reuse' || answers['cyber-digital-passwords'] === 'simple') {
    patterns.push('- Password security practices need improvement');
  }

  // Banking security
  if (answers['cyber-banking-monitoring'] === 'never' || answers['cyber-banking-monitoring'] === 'rarely') {
    patterns.push('- Banking account monitoring is infrequent');
  }

  // Device security
  if (answers['cyber-digital-devices'] === 'shared' || answers['cyber-digital-devices'] === 'unmanaged') {
    patterns.push('- Device security practices need attention');
  }

  return patterns.length > 0 ? patterns : ['- No specific risk patterns identified'];
}

/**
 * Generate fallback recommendations when OpenAI is unavailable
 *
 * Maps missing controls to static, proven recommendations.
 */
export function generateFallbackRecommendations(scoreResult: ScoreResult): CyberRecommendation[] {
  const { missingControls, riskLevel } = scoreResult;
  const recommendations: CyberRecommendation[] = [];

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
function mapControlToRecommendation(control: MissingControl, priority: 'high' | 'medium' | 'low'): CyberRecommendation | null {
  // Map common control patterns to recommendations
  const controlMappings: Record<string, Omit<CyberRecommendation, 'priority'>> = {
    'mfa': {
      title: 'Enable Multi-Factor Authentication',
      description: 'Set up app-based MFA (like Authy or 1Password) on all important accounts including banking, email, and investment platforms. Avoid SMS-based codes when possible.',
      category: 'Identity Protection',
    },
    'password': {
      title: 'Implement Password Manager',
      description: 'Install a reputable password manager (1Password, Bitwarden) and generate unique, strong passwords for every account. Enable the browser extension for easy access.',
      category: 'Digital Hygiene',
    },
    'banking': {
      title: 'Enhance Banking Security',
      description: 'Enable account alerts for all transactions, use dedicated devices for banking, and review statements weekly for unauthorized activity.',
      category: 'Banking Security',
    },
    'monitoring': {
      title: 'Set Up Account Monitoring',
      description: 'Configure real-time alerts for bank accounts, credit cards, and investment accounts. Review all statements within 48 hours of receipt.',
      category: 'Banking Security',
    },
  };

  // Simple keyword matching to find appropriate recommendation
  const controlText = control.description.toLowerCase();

  for (const [key, template] of Object.entries(controlMappings)) {
    if (controlText.includes(key)) {
      return { ...template, priority };
    }
  }

  return null;
}

/**
 * Get general recommendations based on overall risk level
 */
function getGeneralRecommendationsByRiskLevel(riskLevel: string): CyberRecommendation[] {
  const general: Record<string, CyberRecommendation[]> = {
    high: [
      {
        title: 'Immediate Security Review',
        description: 'Conduct an urgent review of all financial accounts and online services. Change passwords immediately on any accounts showing suspicious activity.',
        priority: 'high',
        category: 'Digital Hygiene',
      },
    ],
    medium: [
      {
        title: 'Regular Security Maintenance',
        description: 'Schedule monthly reviews of account activity and quarterly password updates. Keep software and apps updated automatically where possible.',
        priority: 'medium',
        category: 'Digital Hygiene',
      },
    ],
    low: [
      {
        title: 'Maintain Good Practices',
        description: 'Continue current security practices and stay informed about emerging threats. Consider annual security posture reviews.',
        priority: 'low',
        category: 'Digital Hygiene',
      },
    ],
  };

  return general[riskLevel] || general['medium'];
}

/**
 * Validate recommendation structure
 */
function isValidRecommendation(rec: any): rec is CyberRecommendation {
  return (
    typeof rec === 'object' &&
    typeof rec.title === 'string' &&
    typeof rec.description === 'string' &&
    ['high', 'medium', 'low'].includes(rec.priority) &&
    typeof rec.category === 'string'
  );
}