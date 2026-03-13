/**
 * Tests for Assessment Personalization Engine
 */

import { describe, it, expect } from 'vitest';
import {
  getPersonalizedText,
  getMembersByRole,
  getMembersByRelationship,
  hasMultipleGenerations,
  hasMinors,
  hasSuccessors,
  type HouseholdProfile,
  type HouseholdMemberProfile
} from './personalization';
import type { Question } from './types';

// Test data setup
const testProfile: HouseholdProfile = {
  members: [
    {
      id: '1',
      fullName: 'John Smith',
      age: 45,
      relationship: 'spouse',
      governanceRoles: ['DECISION_MAKER'],
      isResident: true,
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      age: 42,
      relationship: 'spouse',
      governanceRoles: ['ADVISOR'],
      isResident: true,
    },
    {
      id: '3',
      fullName: 'Tommy Smith',
      age: 16,
      relationship: 'child',
      governanceRoles: ['SUCCESSOR'],
      isResident: true,
    },
    {
      id: '4',
      fullName: 'Sarah Smith',
      age: 19,
      relationship: 'child',
      governanceRoles: ['BENEFICIARY'],
      isResident: false,
    },
    {
      id: '5',
      fullName: 'Robert Smith Sr',
      age: 75,
      relationship: 'parent',
      governanceRoles: ['TRUSTEE'],
      isResident: false,
    }
  ]
};

const mockQuestion: Question = {
  id: 'test-01',
  text: 'Default question text',
  type: 'yes-no',
  required: true,
  pillar: 'test',
  subCategory: 'test',
  weight: 1,
  scoreMap: { yes: 10, no: 0 },
};

describe('getPersonalizedText', () => {
  it('returns static text when profile is null', () => {
    const question = { ...mockQuestion, textTemplate: () => 'Personalized text' };
    const result = getPersonalizedText(question, null);
    expect(result).toBe('Default question text');
  });

  it('returns static text when no textTemplate', () => {
    const question = mockQuestion;
    const result = getPersonalizedText(question, testProfile);
    expect(result).toBe('Default question text');
  });

  it('calls textTemplate with profile when both exist', () => {
    const question = {
      ...mockQuestion,
      textTemplate: (profile: HouseholdProfile | null) => `Found ${profile?.members.length || 0} members`
    };
    const result = getPersonalizedText(question, testProfile);
    expect(result).toBe('Found 5 members');
  });
});

describe('getMembersByRole', () => {
  it('finds members with SUCCESSOR role', () => {
    const successors = getMembersByRole(testProfile, 'SUCCESSOR');
    expect(successors).toHaveLength(1);
    expect(successors[0].fullName).toBe('Tommy Smith');
  });

  it('finds members with DECISION_MAKER role (case-insensitive)', () => {
    const decisionMakers = getMembersByRole(testProfile, 'decision_maker');
    expect(decisionMakers).toHaveLength(1);
    expect(decisionMakers[0].fullName).toBe('John Smith');
  });

  it('returns empty array when no match', () => {
    const executors = getMembersByRole(testProfile, 'EXECUTOR');
    expect(executors).toHaveLength(0);
  });
});

describe('getMembersByRelationship', () => {
  it('finds members with child relationship', () => {
    const children = getMembersByRelationship(testProfile, 'child');
    expect(children).toHaveLength(2);
    expect(children.map(c => c.fullName)).toEqual(['Tommy Smith', 'Sarah Smith']);
  });

  it('finds members with spouse relationship', () => {
    const spouses = getMembersByRelationship(testProfile, 'spouse');
    expect(spouses).toHaveLength(2);
    expect(spouses.map(s => s.fullName)).toEqual(['John Smith', 'Jane Smith']);
  });

  it('returns empty array when no match', () => {
    const siblings = getMembersByRelationship(testProfile, 'sibling');
    expect(siblings).toHaveLength(0);
  });
});

describe('hasMultipleGenerations', () => {
  it('returns true for family with child + parent', () => {
    const result = hasMultipleGenerations(testProfile);
    expect(result).toBe(true);
  });

  it('returns false for single-generation family', () => {
    const singleGenProfile: HouseholdProfile = {
      members: [
        {
          id: '1',
          fullName: 'John Smith',
          age: 45,
          relationship: 'spouse',
          governanceRoles: ['DECISION_MAKER'],
          isResident: true,
        },
        {
          id: '2',
          fullName: 'Jane Smith',
          age: 42,
          relationship: 'spouse',
          governanceRoles: ['ADVISOR'],
          isResident: true,
        }
      ]
    };
    const result = hasMultipleGenerations(singleGenProfile);
    expect(result).toBe(false);
  });
});

describe('hasMinors', () => {
  it('returns true when member age < 18', () => {
    const result = hasMinors(testProfile);
    expect(result).toBe(true);
  });

  it('returns false when all members >= 18 or age null', () => {
    const adultProfile: HouseholdProfile = {
      members: [
        {
          id: '1',
          fullName: 'John Smith',
          age: 45,
          relationship: 'spouse',
          governanceRoles: ['DECISION_MAKER'],
          isResident: true,
        },
        {
          id: '2',
          fullName: 'Jane Smith',
          age: null,
          relationship: 'spouse',
          governanceRoles: ['ADVISOR'],
          isResident: true,
        }
      ]
    };
    const result = hasMinors(adultProfile);
    expect(result).toBe(false);
  });
});

describe('hasSuccessors', () => {
  it('returns true when household has successors', () => {
    const result = hasSuccessors(testProfile);
    expect(result).toBe(true);
  });

  it('returns false when no successors', () => {
    const noSuccessorProfile: HouseholdProfile = {
      members: [
        {
          id: '1',
          fullName: 'John Smith',
          age: 45,
          relationship: 'spouse',
          governanceRoles: ['DECISION_MAKER'],
          isResident: true,
        }
      ]
    };
    const result = hasSuccessors(noSuccessorProfile);
    expect(result).toBe(false);
  });
});