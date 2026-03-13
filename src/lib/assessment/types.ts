/**
 * Assessment Domain Types
 *
 * Core type definitions for the Belvedere Risk Assessment system.
 * Defines questions, scoring, branching logic, and results.
 */

import { HouseholdProfile } from './personalization';

// Question Types
export type QuestionType =
  | 'single-choice'
  | 'yes-no'
  | 'maturity-scale'
  | 'numeric'
  | 'short-text';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Question Option
export interface QuestionOption {
  value: string | number;
  label: string;
  description?: string;
}

// Branching Rule
export interface BranchingRule {
  dependsOn: string; // questionId
  showIf: (answer: unknown) => boolean;
}

// Question Definition
export interface Question {
  id: string;
  text: string;
  helpText?: string;
  learnMore?: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  pillar: string;
  subCategory: string;
  weight: number;
  scoreMap: Record<string | number, number>;
  branchingRule?: BranchingRule;
  textTemplate?: (profile: HouseholdProfile | null) => string;
  profileCondition?: (profile: HouseholdProfile) => boolean;
}

// Sub-Category Definition
export interface SubCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  questionIds: string[];
}

// Pillar Definition
export interface Pillar {
  id: string;
  name: string;
  slug: string;
  description: string;
  estimatedMinutes: number;
  subCategories: SubCategory[];
}

// Missing Control
export interface MissingControl {
  questionId: string;
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

// Category Score Breakdown
export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  score: number;
  weight: number;
  maxScore: number;
}

// Score Result
export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  breakdown: CategoryScore[];
  missingControls: MissingControl[];
}
