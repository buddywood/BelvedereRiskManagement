import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE } from "@/lib/advisor/external-client-id";

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Ensures `externalClientId` is unused for this advisor (excluding one assignment).
 * Also blocks pending invites that already claim the same ID.
 */
export async function assertExternalClientIdAvailable(
  advisorProfileId: string,
  externalClientId: string | null,
  options?: {
    excludeAssignmentId?: string;
    excludeInviteCodeId?: string;
    db?: DbClient;
  },
): Promise<void> {
  if (!externalClientId) return;

  const db = options?.db ?? prisma;

  const existingAssignment = await db.clientAdvisorAssignment.findFirst({
    where: {
      advisorId: advisorProfileId,
      externalClientId,
      ...(options?.excludeAssignmentId
        ? { id: { not: options.excludeAssignmentId } }
        : {}),
    },
    select: { id: true },
  });
  if (existingAssignment) {
    throw new Error(DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE);
  }

  const existingInvite = await db.inviteCode.findFirst({
    where: {
      createdBy: advisorProfileId,
      externalClientId,
      status: { in: ["SENT", "OPENED"] },
      ...(options?.excludeInviteCodeId
        ? { id: { not: options.excludeInviteCodeId } }
        : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  });
  if (existingInvite) {
    throw new Error(DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE);
  }
}
