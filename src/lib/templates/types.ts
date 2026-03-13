export type TemplateId =
  | 'decision-making-authority'
  | 'access-controls'
  | 'trust-estate-governance'
  | 'succession-planning'
  | 'behavior-standards'
  | 'family-business-governance'
  | 'documentation-records';

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
  decisionMakers?: string;    // Names of members with DECISION_MAKER role (comma-joined)
  successors?: string;        // Names of members with SUCCESSOR role (comma-joined)
  trustees?: string;          // Names of members with TRUSTEE role (comma-joined)
  advisors?: string;          // Names of members with ADVISOR role (comma-joined)
  beneficiaries?: string;     // Names of members with BENEFICIARY role (comma-joined)
  executors?: string;         // Names of members with EXECUTOR role (comma-joined)
  householdHead?: string;     // Primary decision maker or first member name
}

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
  {
    id: 'decision-making-authority',
    name: 'Decision-Making Authority Policy',
    description: 'Family governance structure, voting rights, quorum requirements',
    category: 'governance-structure',
    applicableSubCategories: ['governance-structure']
  },
  {
    id: 'access-controls',
    name: 'Access Controls Policy',
    description: 'Asset access tiers, approval workflows, information sharing protocols',
    category: 'information-security',
    applicableSubCategories: ['information-security']
  },
  {
    id: 'trust-estate-governance',
    name: 'Trust & Estate Governance Policy',
    description: 'Trustee responsibilities, beneficiary rights, distribution procedures',
    category: 'trust-estate-governance',
    applicableSubCategories: ['trust-estate-governance']
  },
  {
    id: 'succession-planning',
    name: 'Succession Planning Policy',
    description: 'Leadership transition plan, mentorship requirements, capability assessment',
    category: 'succession-planning',
    applicableSubCategories: ['succession-planning']
  },
  {
    id: 'behavior-standards',
    name: 'Behavior Standards Policy',
    description: 'Family code of conduct, social media guidelines, public representation rules',
    category: 'family-dynamics',
    applicableSubCategories: ['family-dynamics']
  },
  {
    id: 'family-business-governance',
    name: 'Family Business Governance Policy',
    description: 'Board structure, family employment policies, compensation transparency',
    category: 'business-governance',
    applicableSubCategories: ['business-governance']
  },
  {
    id: 'documentation-records',
    name: 'Documentation & Records Policy',
    description: 'Record retention schedule, access protocols, update frequency',
    category: 'communication-transparency',
    applicableSubCategories: ['communication-transparency']
  }
];