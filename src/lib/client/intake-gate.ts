import "server-only";

import { prisma } from "@/lib/db";

export type ClientIntakeGateState = {
  hasSubmittedInterview: boolean;
  intakeApproved: boolean;
  intakeWaived: boolean;
  restrictNavToIntake: boolean;
  assessmentUnlocked: boolean;
};

/**
 * Single source for client (USER) intake vs assessment access.
 * Uses active `ClientAdvisorAssignment` intake waiver when present.
 */
export async function getClientIntakeGateState(
  clientUserId: string,
): Promise<ClientIntakeGateState> {
  const assignment = await prisma.clientAdvisorAssignment.findFirst({
    where: { clientId: clientUserId, status: "ACTIVE" },
    orderBy: { assignedAt: "desc" },
    select: { intakeWaivedAt: true },
  });

  const intakeWaived = assignment?.intakeWaivedAt != null;

  const submittedInterview = await prisma.intakeInterview.findFirst({
    where: { userId: clientUserId, status: "SUBMITTED" },
    select: { id: true },
  });
  const hasSubmittedInterview = !!submittedInterview;

  let intakeApproved = false;
  if (submittedInterview) {
    const approval = await prisma.intakeApproval.findUnique({
      where: { interviewId: submittedInterview.id },
      select: { status: true },
    });
    intakeApproved = approval?.status === "APPROVED";
  }

  const restrictNavToIntake = !hasSubmittedInterview && !intakeWaived;
  const assessmentUnlocked = intakeApproved || intakeWaived;

  return {
    hasSubmittedInterview,
    intakeApproved,
    intakeWaived,
    restrictNavToIntake,
    assessmentUnlocked,
  };
}
