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
  'environmental-geographic-risk': 'Environmental / Geographic',
  'physical-security': 'Physical Security',
  'cybersecurity': 'Cybersecurity',
  'financial-asset-protection': 'Financial / Assets',
  'health-medical-preparedness': 'Health / Medical',
  'lifestyle-behavioral-risk': 'Lifestyle / Behavioral',
  // Legacy governance subcategory IDs (scores stored before six-pillar taxonomy)
  'decision-making-authority': 'Lifestyle / Behavioral',
  'access-controls': 'Cybersecurity',
  'trust-estate-governance': 'Financial / Assets',
  'marriage-relationship-risk': 'Financial / Assets',
  'succession-planning': 'Financial / Assets',
  'behavior-standards': 'Lifestyle / Behavioral',
  'business-involvement': 'Financial / Assets',
  'documentation-communication': 'Lifestyle / Behavioral',
};

/**
 * Distinct colors for category chart series plus primary color for overall score
 */
export const CHART_COLORS: Record<string, string> = {
  primary: '#3b82f6',
  'environmental-geographic-risk': '#0d9488',
  'physical-security': '#64748b',
  'cybersecurity': '#7c3aed',
  'financial-asset-protection': '#ca8a04',
  'health-medical-preparedness': '#e11d48',
  'lifestyle-behavioral-risk': '#2563eb',
  'decision-making-authority': '#2563eb',
  'access-controls': '#7c3aed',
  'trust-estate-governance': '#ca8a04',
  'marriage-relationship-risk': '#ca8a04',
  'succession-planning': '#ca8a04',
  'behavior-standards': '#2563eb',
  'business-involvement': '#ca8a04',
  'documentation-communication': '#2563eb',
};