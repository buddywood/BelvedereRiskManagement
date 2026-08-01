"use server";

/**
 * Advisor-managed CRM / external client ID on ClientAdvisorAssignment.
 * Gated through portfolio access (own assignments + firm-shared visibility).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdvisorRole } from "@/lib/advisor/auth";
import {
  DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE,
  externalClientIdSchema,
} from "@/lib/advisor/external-client-id";
import { assertExternalClientIdAvailable } from "@/lib/advisor/external-client-id.server";
import { writeAudit, AUDIT_ACTIONS } from "@/lib/audit/audit-log";
import {
  findPortfolioAssignmentForClient,
  resolvePortfolioScope,
} from "@/lib/enterprise/portfolio-access";
import { logSafeError, safeErrorMessage } from "@/lib/log-safe-error";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

const updateSchema = z.object({
  clientId: z.string().cuid(),
  externalClientId: externalClientIdSchema,
});

async function gatePortfolioClient(clientId: string) {
  const { userId, role, email: actorEmail } = await requireAdvisorRole();
  const scope = await resolvePortfolioScope(userId);
  if (!scope) {
    return { success: false as const, error: "This client is not assigned to you." };
  }

  const access = await findPortfolioAssignmentForClient(scope, clientId, {
    includeInactive: true,
  });
  if (!access) {
    return { success: false as const, error: "This client is not assigned to you." };
  }

  const assignment = await prisma.clientAdvisorAssignment.findFirst({
    where: {
      clientId,
      advisorId: access.assignmentAdvisorProfileId,
      status: { in: ["ACTIVE", "INACTIVE"] },
    },
    select: { id: true, externalClientId: true, advisorId: true },
  });
  if (!assignment) {
    return { success: false as const, error: "This client is not assigned to you." };
  }

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, role: true, deletedAt: true },
  });
  if (!client || client.deletedAt) {
    return { success: false as const, error: "Client not found." };
  }
  if (client.role !== "USER") {
    return { success: false as const, error: "Target account is not a client." };
  }

  return {
    success: true as const,
    actor: { userId, role: role as UserRole, email: actorEmail },
    assignment,
  };
}

/**
 * Set or clear the advisor CRM / external client ID for a portfolio client.
 */
export async function updateAdvisorExternalClientId(input: {
  clientId: string;
  externalClientId?: string | null;
}): Promise<ActionResult<{ clientId: string; externalClientId: string | null }>> {
  try {
    const parsed = updateSchema.parse(input);
    const gate = await gatePortfolioClient(parsed.clientId);
    if (!gate.success) return fail(gate.error);

    const nextId = parsed.externalClientId;
    const previousId = gate.assignment.externalClientId;

    if (nextId === previousId) {
      return ok({ clientId: parsed.clientId, externalClientId: nextId });
    }

    await assertExternalClientIdAvailable(gate.assignment.advisorId, nextId, {
      excludeAssignmentId: gate.assignment.id,
    });

    await prisma.clientAdvisorAssignment.update({
      where: { id: gate.assignment.id },
      data: { externalClientId: nextId },
    });

    await writeAudit({
      actor: gate.actor,
      action: AUDIT_ACTIONS.CLIENT_EXTERNAL_ID_UPDATE,
      entityType: "ClientAdvisorAssignment",
      entityId: gate.assignment.id,
      beforeData: { externalClientId: previousId },
      afterData: { externalClientId: nextId },
      metadata: { clientId: parsed.clientId },
    });

    revalidatePath(`/advisor/pipeline/${parsed.clientId}`);
    revalidatePath("/advisor/pipeline");
    revalidatePath("/advisor/portfolio");

    return ok({ clientId: parsed.clientId, externalClientId: nextId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid client ID.");
    }
    if (error instanceof Error && error.message.includes("already used")) {
      return fail(error.message);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail(DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE);
    }
    logSafeError("updateAdvisorExternalClientId", error);
    return fail(safeErrorMessage(error, "Could not update client ID."));
  }
}
