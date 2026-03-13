import "server-only";

import { type GovernanceRole, type HouseholdMember, type FamilyRelationship } from "@prisma/client";
import { prisma } from "@/lib/db";

type HouseholdMemberInput = {
  fullName: string;
  age?: number;
  occupation?: string;
  phone?: string;
  email?: string;
  relationship: FamilyRelationship;
  governanceRoles?: GovernanceRole[];
  isResident?: boolean;
  notes?: string;
};

function normalizeOptionalString(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function listHouseholdMembers(userId: string): Promise<HouseholdMember[]> {
  return prisma.householdMember.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createHouseholdMemberRecord(userId: string, data: HouseholdMemberInput): Promise<HouseholdMember> {
  return prisma.householdMember.create({
    data: {
      userId,
      fullName: data.fullName.trim(),
      age: data.age ?? null,
      occupation: normalizeOptionalString(data.occupation),
      phone: normalizeOptionalString(data.phone),
      email: normalizeOptionalString(data.email),
      relationship: data.relationship,
      governanceRoles: data.governanceRoles ?? [],
      isResident: data.isResident ?? true,
      notes: normalizeOptionalString(data.notes),
    },
  });
}

export async function updateHouseholdMemberRecord(
  userId: string,
  id: string,
  data: HouseholdMemberInput,
): Promise<HouseholdMember | null> {
  return prisma.householdMember.findFirst({
    where: { id, userId },
  }).then((existingMember) => {
    if (!existingMember) {
      return null;
    }

    return prisma.householdMember.update({
      where: { id },
      data: {
        fullName: data.fullName.trim(),
        age: data.age ?? null,
        occupation: normalizeOptionalString(data.occupation),
        phone: normalizeOptionalString(data.phone),
        email: normalizeOptionalString(data.email),
        relationship: data.relationship,
        governanceRoles: data.governanceRoles ?? [],
        isResident: data.isResident ?? true,
        notes: normalizeOptionalString(data.notes),
      },
    });
  });
}

export async function deleteHouseholdMemberRecord(userId: string, id: string): Promise<boolean> {
  const existingMember = await prisma.householdMember.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existingMember) {
    return false;
  }

  await prisma.householdMember.delete({
    where: { id },
  });

  return true;
}
