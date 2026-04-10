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
  governance: 'Governance',
  cybersecurity: 'Cyber security',
  'physical-security': 'Physical security',
  'financial-asset-protection': 'Insurance',
  'environmental-geographic-risk': 'Geographic',
  'lifestyle-behavioral-risk': 'Reputational & social risk',
  /** Historical breakdown rows */
  'health-medical-preparedness': 'Insurance (prior medical section)',
  // Legacy governance subcategory IDs (scores stored before six-pillar taxonomy)
  'decision-making-authority': 'Governance',
  'access-controls': 'Cyber security',
  'trust-estate-governance': 'Insurance',
  'marriage-relationship-risk': 'Insurance',
  'succession-planning': 'Insurance',
  'behavior-standards': 'Reputational & social risk',
  'business-involvement': 'Insurance',
  'documentation-communication': 'Governance',
};

/**
 * Distinct colors for category chart series plus primary color for overall score
 */
export const CHART_COLORS: Record<string, string> = {
  primary: '#3b82f6',
  governance: '#78350f',
  cybersecurity: '#7c3aed',
  'physical-security': '#64748b',
  'financial-asset-protection': '#ca8a04',
  'environmental-geographic-risk': '#0d9488',
  'lifestyle-behavioral-risk': '#2563eb',
  'health-medical-preparedness': '#e11d48',
  'decision-making-authority': '#78350f',
  'access-controls': '#7c3aed',
  'trust-estate-governance': '#ca8a04',
  'marriage-relationship-risk': '#ca8a04',
  'succession-planning': '#ca8a04',
  'behavior-standards': '#2563eb',
  'business-involvement': '#ca8a04',
  'documentation-communication': '#78350f',
};