/**
 * Assessment Personalization Engine
 *
 * Provides dynamic text generation and question filtering based on household profile data.
 * Enables profile-aware assessment questions while maintaining backward compatibility.
 */

import { Question } from './types';

// Types matching data from getHouseholdMembers() server action
export interface HouseholdMemberProfile {
  id: string;
  fullName: string;
  age: number | null;
  relationship: string; // FamilyRelationship enum value
  governanceRoles: string[]; // GovernanceRole enum values
  isResident: boolean;
}

export interface HouseholdProfile {
  members: HouseholdMemberProfile[];
}

/**
 * Generate personalized question text based on household profile
 *
 * @param question - Question definition with optional textTemplate
 * @param profile - Household profile data or null
 * @returns Personalized question text or fallback to static text
 */
export function getPersonalizedText(question: Question, profile: HouseholdProfile | null): string {
  if (question.textTemplate && profile !== null) {
    return question.textTemplate(profile);
  }
  return question.text;
}

/**
 * Filter household members by governance role
 *
 * @param profile - Household profile data
 * @param role - Governance role to filter by (case-insensitive)
 * @returns Array of members with the specified governance role
 */
export function getMembersByRole(profile: HouseholdProfile, role: string): HouseholdMemberProfile[] {
  return profile.members.filter(member =>
    member.governanceRoles.some(r => r.toLowerCase() === role.toLowerCase())
  );
}

/**
 * Filter household members by family relationship
 *
 * @param profile - Household profile data
 * @param relationship - Family relationship to filter by
 * @returns Array of members with the specified relationship
 */
export function getMembersByRelationship(profile: HouseholdProfile, relationship: string): HouseholdMemberProfile[] {
  return profile.members.filter(member => member.relationship === relationship);
}

/**
 * Check if household spans multiple generations
 *
 * @param profile - Household profile data
 * @returns true if household has members from different generational relationships
 */
export function hasMultipleGenerations(profile: HouseholdProfile): boolean {
  const relationships = profile.members.map(m => m.relationship);
  const generationalTypes = new Set();

  for (const relationship of relationships) {
    switch (relationship.toLowerCase()) {
      case 'child':
      case 'grandchild':
        generationalTypes.add('younger');
        break;
      case 'parent':
      case 'grandparent':
        generationalTypes.add('older');
        break;
      case 'spouse':
      case 'sibling':
        generationalTypes.add('same');
        break;
      default:
        generationalTypes.add('other');
        break;
    }
  }

  return generationalTypes.size >= 2;
}

/**
 * Check if household has any minors
 *
 * @param profile - Household profile data
 * @returns true if any member has age < 18
 */
export function hasMinors(profile: HouseholdProfile): boolean {
  return profile.members.some(member => member.age !== null && member.age < 18);
}

/**
 * Check if household has designated successors
 *
 * @param profile - Household profile data
 * @returns true if any member has SUCCESSOR governance role
 */
export function hasSuccessors(profile: HouseholdProfile): boolean {
  return profile.members.some(member =>
    member.governanceRoles.some(role => role.toUpperCase() === 'SUCCESSOR')
  );
}