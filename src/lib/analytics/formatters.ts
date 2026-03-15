import { format } from 'date-fns';

/**
 * Formats ISO date string to "MMM yyyy" format for chart axes
 */
export function formatChartDate(dateString: string): string {
  return format(new Date(dateString), 'MMM yyyy');
}

/**
 * Formats score to 1 decimal place
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Maps pillar subcategory IDs to display names for chart labels
 */
export const CATEGORY_LABELS: Record<string, string> = {
  'decision-making-authority': 'Decision-Making',
  'access-controls': 'Access Controls',
  'trust-estate-governance': 'Trust & Estate',
  'marriage-relationship-risk': 'Marriage Risk',
  'succession-planning': 'Succession',
  'behavior-standards': 'Behavior Standards',
  'business-involvement': 'Business',
  'documentation-communication': 'Documentation',
};

/**
 * Distinct colors for category chart series plus primary color for overall score
 */
export const CHART_COLORS: Record<string, string> = {
  primary: '#3b82f6',
  'decision-making-authority': '#ef4444',
  'access-controls': '#f97316',
  'trust-estate-governance': '#eab308',
  'marriage-relationship-risk': '#22c55e',
  'succession-planning': '#06b6d4',
  'behavior-standards': '#8b5cf6',
  'business-involvement': '#ec4899',
  'documentation-communication': '#6b7280',
};