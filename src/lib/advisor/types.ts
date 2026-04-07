import type { AdvisorProfile, ClientAdvisorAssignment, IntakeApproval, AdvisorNotification, IntakeInterview, IntakeResponse, User } from '@prisma/client';

// Dashboard client data for advisor's client list
export type AdvisorDashboardClient = {
  id: string;
  name: string | null;
  email: string;
  assignedAt: Date;
  clientProfile?: {
    phone: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
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
  /** Full intake form fields for advisor view: same as client sees, enables "Play question" TTS */
  questionNumber?: number;
  questionText?: string;
  context?: string;
  recordingTips?: string[];
};

// Risk area selection for advisor approval process
export type RiskAreaSelection = {
  subCategoryId: string;
  subCategoryName: string;
  selected: boolean;
};

// Risk areas aligned with the six pillars of comprehensive risk assessment (focus-area selector + subcategory IDs)
export const RISK_AREAS = [
  {
    id: 'environmental-geographic-risk',
    name: 'Environmental / Geographic Risk',
    summary:
      'Climate and location factors, regulatory context, and geography-driven exposure.',
  },
  {
    id: 'physical-security',
    name: 'Physical Security',
    summary: 'Personal safety, property security, travel, and physical access control.',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    summary: 'Digital footprint, data protection, fraud, and online threats.',
  },
  {
    id: 'financial-asset-protection',
    name: 'Financial / Asset Protection',
    summary: 'Wealth structures, insurance, liability, and asset preservation.',
  },
  {
    id: 'health-medical-preparedness',
    name: 'Health & Medical Preparedness',
    summary: 'Care access, continuity, coverage, and medical-privacy considerations.',
  },
  {
    id: 'lifestyle-behavioral-risk',
    name: 'Lifestyle & Behavioral Risk',
    summary: 'Visibility, routines, relationships, and habits that affect overall risk.',
  },
] as const;