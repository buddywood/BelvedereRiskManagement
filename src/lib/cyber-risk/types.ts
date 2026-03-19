/**
 * Cyber Risk Domain Types
 *
 * Re-exports and constants for cyber risk assessment pillar.
 * Maintains type compatibility with existing assessment system.
 */

// Re-export core types from assessment system
export {
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

// Cyber risk pillar identifier
export const CYBER_PILLAR_ID = 'cyber-risk';

// Sub-category identifiers
export const CYBER_SUBCATEGORIES = {
  DIGITAL_HYGIENE: 'digital-hygiene',
  IDENTITY_PROTECTION: 'identity-protection',
  BANKING_SECURITY: 'banking-security',
  PAYMENT_RISK: 'payment-risk',
} as const;