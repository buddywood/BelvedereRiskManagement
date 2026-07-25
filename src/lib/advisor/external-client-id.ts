import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Max length for advisor-managed external / CRM client IDs. */
export const EXTERNAL_CLIENT_ID_MAX_LENGTH = 64;

const DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE =
  "That client ID is already used for another client in your portfolio.";

function emptyToNull(val: unknown): unknown {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

/**
 * Optional advisor CRM client ID. Empty / whitespace → null (clears the field).
 * Allows letters, numbers, and common CRM separators.
 */
export const externalClientIdSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(EXTERNAL_CLIENT_ID_MAX_LENGTH, `Client ID must be at most ${EXTERNAL_CLIENT_ID_MAX_LENGTH} characters`)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._\-/# ]*$/,
      "Client ID may use letters, numbers, spaces, and . _ - / #",
    )
    .nullable(),
);

export type ExternalClientId = z.infer<typeof externalClientIdSchema>;

export function parseExternalClientId(raw: unknown): ExternalClientId {
  return externalClientIdSchema.parse(raw);
}

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

export { DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE };
