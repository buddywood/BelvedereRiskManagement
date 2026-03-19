/**
 * Identity Risk Domain Types
 *
 * Re-exports and constants for identity risk assessment pillar.
 * Maintains type compatibility with existing assessment system.
 */

// Re-export core types from assessment system
export type {
  Question,
  Pillar,
  SubCategory,
  ScoreResult,
  RiskLevel,
  QuestionType,
  QuestionOption,
  BranchingRule,
  MissingControl,
  CategoryScore,
} from '../assessment/types';

// Identity risk pillar identifier
export const IDENTITY_PILLAR_ID = 'identity-risk';

// Sub-category identifiers
export const IDENTITY_SUBCATEGORIES = {
  SOCIAL_EXPOSURE: 'social-exposure',
  PUBLIC_INFORMATION: 'public-information',
  DIGITAL_FOOTPRINT: 'digital-footprint',
  FAMILY_VISIBILITY: 'family-visibility',
} as const;