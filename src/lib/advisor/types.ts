import type { AdvisorProfile, ClientAdvisorAssignment, IntakeApproval, AdvisorNotification, IntakeInterview, IntakeResponse, User } from '@prisma/client';

// Dashboard client data for advisor's client list
export type AdvisorDashboardClient = {
  id: string;
  name: string | null;
  email: string;
  assignedAt: Date;
  latestInterview: {
    id: string;
    status: string;
    submittedAt: Date | null;
    responseCount: number;
  } | null;
};

// Complete data for reviewing a client's intake interview
export type IntakeReviewData = {
  interview: IntakeInterview & {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    responses: IntakeResponse[];
  };
  approval: IntakeApproval | null;
  questions: IntakeQuestion[];
};

export type IntakeQuestion = {
  id: string;
  text: string;
  helpText?: string;
  learnMore?: string;
  type: string;
  options?: Array<{ value: number; label: string; description?: string }>;
};

// Risk area selection for advisor approval process
export type RiskAreaSelection = {
  subCategoryId: string;
  subCategoryName: string;
  selected: boolean;
};

// Risk areas matching assessment subcategories
export const RISK_AREAS = [
  { id: 'decision-making-authority', name: 'Decision-Making Authority' },
  { id: 'access-controls', name: 'Access Controls' },
  { id: 'trust-estate-governance', name: 'Trust & Estate Governance' },
  { id: 'marriage-relationship-risk', name: 'Marriage & Relationship Risk' },
  { id: 'succession-planning', name: 'Succession Planning' },
  { id: 'behavior-standards', name: 'Behavior Standards' },
  { id: 'business-involvement', name: 'Business Involvement' },
  { id: 'documentation-communication', name: 'Documentation & Communication' },
] as const;