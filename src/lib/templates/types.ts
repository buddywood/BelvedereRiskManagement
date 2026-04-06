export type TemplateId =
  | 'environmental-geographic-risk'
  | 'physical-security'
  | 'cybersecurity'
  | 'financial-asset-protection'
  | 'health-medical-preparedness'
  | 'lifestyle-behavioral-risk';

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  description: string;
  category: string;
  applicableSubCategories: string[];
}

export interface TemplateData {
  familyName: string;
  assessmentDate: string;
  overallScore: number;
  riskLevel: string;
  categoryScore: number;
  categoryRiskLevel: string;
  gaps: Array<{
    description: string;
    severity: string;
    recommendation: string;
  }>;
  strengths: string[];
  recommendations: string[];

  // Household member data (empty arrays/strings when no profile)
  householdMembers?: Array<{
    fullName: string;
    relationship: string;
    governanceRoles: string[];
  }>;
  decisionMakers?: string; // Names of members with DECISION_MAKER role (comma-joined)
  successors?: string; // Names of members with SUCCESSOR role (comma-joined)
  trustees?: string; // Names of members with TRUSTEE role (comma-joined)
  advisors?: string; // Names of members with ADVISOR role (comma-joined)
  beneficiaries?: string; // Names of members with BENEFICIARY role (comma-joined)
  executors?: string; // Names of members with EXECUTOR role (comma-joined)
  householdHead?: string; // Primary decision maker or first member name
}

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
  {
    id: 'environmental-geographic-risk',
    name: 'Environmental & Geographic Risk Policy',
    description: 'Hazards, catastrophe insurance, evacuation, and continuity',
    category: 'environmental-geographic-risk',
    applicableSubCategories: ['environmental-geographic-risk'],
  },
  {
    id: 'physical-security',
    name: 'Physical Security Policy',
    description: 'Residence security, travel safety, and duress protocols',
    category: 'physical-security',
    applicableSubCategories: ['physical-security'],
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Digital Access Policy',
    description: 'Authentication, device hygiene, and sensitive information access',
    category: 'cybersecurity',
    applicableSubCategories: ['cybersecurity'],
  },
  {
    id: 'financial-asset-protection',
    name: 'Financial & Asset Protection Policy',
    description: 'Insurance, concentration, trusts, titling, and succession structures',
    category: 'financial-asset-protection',
    applicableSubCategories: ['financial-asset-protection'],
  },
  {
    id: 'health-medical-preparedness',
    name: 'Health & Medical Preparedness Policy',
    description: 'Emergency medical planning, travel health, and caregiving contingencies',
    category: 'health-medical-preparedness',
    applicableSubCategories: ['health-medical-preparedness'],
  },
  {
    id: 'lifestyle-behavioral-risk',
    name: 'Lifestyle & Behavioral Risk Policy',
    description: 'Governance, communication, visibility, and advisor coordination',
    category: 'lifestyle-behavioral-risk',
    applicableSubCategories: ['lifestyle-behavioral-risk'],
  },
];
