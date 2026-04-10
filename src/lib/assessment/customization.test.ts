/**
 * Assessment Customization Service Tests
 */

import {
  getCustomizationConfig,
  getVisibleSubCategories,
  getEmphasisMultipliers,
  getVisibleQuestionIds,
  estimateCompletionMinutes,
  CustomizationConfig
} from './customization';
import { RISK_AREAS } from '@/lib/advisor/types';
import { Question } from '@/lib/assessment/types';

// Mock questions for testing
const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Question 1',
    type: 'yes-no',
    required: true,
    pillar: 'family-governance',
    subCategory: 'lifestyle-behavioral-risk',
    weight: 1,
    scoreMap: { 'yes': 10, 'no': 0 }
  },
  {
    id: 'q2',
    text: 'Question 2',
    type: 'yes-no',
    required: true,
    pillar: 'family-governance',
    subCategory: 'lifestyle-behavioral-risk',
    weight: 1,
    scoreMap: { 'yes': 10, 'no': 0 }
  },
  {
    id: 'q3',
    text: 'Question 3',
    type: 'yes-no',
    required: true,
    pillar: 'family-governance',
    subCategory: 'cybersecurity',
    weight: 1,
    scoreMap: { 'yes': 10, 'no': 0 }
  },
  {
    id: 'q4',
    text: 'Question 4',
    type: 'yes-no',
    required: true,
    pillar: 'family-governance',
    subCategory: 'financial-asset-protection',
    weight: 1,
    scoreMap: { 'yes': 10, 'no': 0 }
  }
];

describe('getCustomizationConfig', () => {
  test('returns not customized config with empty focus areas', () => {
    const config = getCustomizationConfig([]);

    expect(config.isCustomized).toBe(false);
    expect(config.visibleSubCategories).toHaveLength(6); // All RISK_AREAS
    expect(config.visibleSubCategories).toEqual(RISK_AREAS.map(area => area.id));
    expect(config.emphasisAreas).toEqual(config.visibleSubCategories);
    expect(config.emphasisMultiplier).toBe(1.5);
  });

  test('returns customized config with valid focus areas', () => {
    const focusAreas = ['lifestyle-behavioral-risk', 'cybersecurity', 'financial-asset-protection'];
    const config = getCustomizationConfig(focusAreas);

    expect(config.isCustomized).toBe(true);
    expect(config.visibleSubCategories).toEqual(focusAreas);
    expect(config.emphasisAreas).toEqual(focusAreas);
    expect(config.emphasisMultiplier).toBe(1.5);
  });

  test('filters out invalid focus area IDs', () => {
    const focusAreas = ['lifestyle-behavioral-risk', 'invalid-id', 'cybersecurity', 'another-invalid'];
    const config = getCustomizationConfig(focusAreas);

    expect(config.isCustomized).toBe(true);
    expect(config.visibleSubCategories).toEqual(['lifestyle-behavioral-risk', 'cybersecurity']);
    expect(config.emphasisAreas).toEqual(['lifestyle-behavioral-risk', 'cybersecurity']);
  });
});

describe('getVisibleSubCategories', () => {
  test('returns all RISK_AREAS when empty array provided', () => {
    const visible = getVisibleSubCategories([]);

    expect(visible).toHaveLength(6);
    expect(visible).toEqual(RISK_AREAS.map(area => area.id));
  });

  test('filters valid focus areas', () => {
    const focusAreas = ['lifestyle-behavioral-risk', 'invalid-id', 'cybersecurity'];
    const visible = getVisibleSubCategories(focusAreas);

    expect(visible).toEqual(['lifestyle-behavioral-risk', 'cybersecurity']);
  });

  test('returns empty array when no valid focus areas', () => {
    const focusAreas = ['invalid-1', 'invalid-2'];
    const visible = getVisibleSubCategories(focusAreas);

    expect(visible).toEqual([]);
  });

  test('maps legacy health-medical focus area to insurance (financial-asset-protection)', () => {
    expect(getVisibleSubCategories(['health-medical-preparedness'])).toEqual([
      'financial-asset-protection',
    ]);
  });

  test('dedupes when legacy health and insurance both appear', () => {
    expect(
      getVisibleSubCategories(['health-medical-preparedness', 'financial-asset-protection'])
    ).toEqual(['financial-asset-protection']);
  });
});

describe('getEmphasisMultipliers', () => {
  test('returns 1.5x for emphasis areas, 1.0x for other visible areas', () => {
    const config: CustomizationConfig = {
      isCustomized: true,
      visibleSubCategories: ['lifestyle-behavioral-risk', 'cybersecurity', 'financial-asset-protection'],
      emphasisAreas: ['lifestyle-behavioral-risk', 'cybersecurity'],
      emphasisMultiplier: 1.5
    };

    const multipliers = getEmphasisMultipliers(config);

    expect(multipliers['lifestyle-behavioral-risk']).toBe(1.5);
    expect(multipliers['cybersecurity']).toBe(1.5);
    expect(multipliers['financial-asset-protection']).toBe(1.0);
  });

  test('handles non-customized config', () => {
    const config: CustomizationConfig = {
      isCustomized: false,
      visibleSubCategories: RISK_AREAS.map(area => area.id),
      emphasisAreas: RISK_AREAS.map(area => area.id),
      emphasisMultiplier: 1.5
    };

    const multipliers = getEmphasisMultipliers(config);

    // All areas should get emphasis multiplier
    for (const area of RISK_AREAS) {
      expect(multipliers[area.id]).toBe(1.5);
    }
  });
});

describe('getVisibleQuestionIds', () => {
  test('returns questions matching visible subcategories', () => {
    const visibleSubCategories = ['lifestyle-behavioral-risk', 'cybersecurity'];
    const questionIds = getVisibleQuestionIds(visibleSubCategories, mockQuestions);

    expect(questionIds).toEqual(['q1', 'q2', 'q3']);
  });

  test('returns empty array when no matching questions', () => {
    const visibleSubCategories = ['non-existent-category'];
    const questionIds = getVisibleQuestionIds(visibleSubCategories, mockQuestions);

    expect(questionIds).toEqual([]);
  });

  test('returns all questions when all subcategories visible', () => {
    const visibleSubCategories = ['lifestyle-behavioral-risk', 'cybersecurity', 'financial-asset-protection'];
    const questionIds = getVisibleQuestionIds(visibleSubCategories, mockQuestions);

    expect(questionIds).toEqual(['q1', 'q2', 'q3', 'q4']);
  });
});

describe('estimateCompletionMinutes', () => {
  test('estimates time based on visible questions (~20 seconds each)', () => {
    const visibleSubCategories = ['lifestyle-behavioral-risk']; // 2 questions
    const minutes = estimateCompletionMinutes(visibleSubCategories, mockQuestions);

    // 2 questions * 20 seconds = 40 seconds = 1 minute (rounded up)
    expect(minutes).toBe(1);
  });

  test('caps at 15 minutes', () => {
    // Create many questions to test the cap
    const manyQuestions = Array.from({ length: 100 }, (_, i) => ({
      id: `q${i}`,
      text: `Question ${i}`,
      type: 'yes-no' as const,
      required: true,
      pillar: 'family-governance',
      subCategory: 'lifestyle-behavioral-risk',
      weight: 1,
      scoreMap: { 'yes': 10, 'no': 0 }
    }));

    const visibleSubCategories = ['lifestyle-behavioral-risk'];
    const minutes = estimateCompletionMinutes(visibleSubCategories, manyQuestions);

    expect(minutes).toBe(15); // Should be capped at 15
  });

  test('returns reasonable time for typical customization', () => {
    const visibleSubCategories = ['lifestyle-behavioral-risk', 'cybersecurity']; // 3 questions
    const minutes = estimateCompletionMinutes(visibleSubCategories, mockQuestions);

    // 3 questions * 20 seconds = 60 seconds = 1 minute
    expect(minutes).toBe(1);
  });
});