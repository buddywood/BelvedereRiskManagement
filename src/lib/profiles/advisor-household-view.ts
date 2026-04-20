import 'server-only';

import type { FamilyRelationship, GovernanceRole, HouseholdMember } from '@prisma/client';

/** Shape safe to expose to an advisor when the client has restricted name and contact sharing. */
export type AdvisorHouseholdMemberView = {
  id: string;
  userId: string;
  fullName: string;
  age: number | null;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  relationship: FamilyRelationship;
  governanceRoles: GovernanceRole[];
  isResident: boolean;
  notes: string | null;
  shareNameAndContactWithAdvisor: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const REDACTED_NAME = 'Household member';

/**
 * Maps a stored household member to what an advisor is allowed to see.
 * When `shareNameAndContactWithAdvisor` is false, name, phone, email, occupation, and notes are cleared;
 * relationship, governance roles, residency, and age remain for assessment context.
 */
export function toAdvisorHouseholdMemberView(member: HouseholdMember): AdvisorHouseholdMemberView {
  if (member.shareNameAndContactWithAdvisor) {
    return { ...member };
  }

  return {
    ...member,
    fullName: REDACTED_NAME,
    occupation: null,
    phone: null,
    email: null,
    notes: null,
  };
}

export function toAdvisorHouseholdMemberViews(members: HouseholdMember[]): AdvisorHouseholdMemberView[] {
  return members.map(toAdvisorHouseholdMemberView);
}
