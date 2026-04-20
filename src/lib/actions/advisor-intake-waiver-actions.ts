"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAdvisorProfileOrThrow, requireAdvisorRole } from "@/lib/advisor/auth";

export type IntakeWaiverActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Advisor (assigned to the client) may waive the governance intake requirement
 * so the client can open Assessment without a submitted/approved interview.
 */
export async function setClientIntakeWaiver(
  clientId: string,
  waive: boolean,
): Promise<IntakeWaiverActionResult> {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const assignment = await prisma.clientAdvisorAssignment.findFirst({
      where: {
        clientId,
        advisorId: profile.id,
        status: "ACTIVE",
      },
    });

    if (!assignment) {
      return { success: false, error: "This client is not assigned to you." };
    }

    await prisma.clientAdvisorAssignment.update({
      where: { id: assignment.id },
      data: waive
        ? {
            intakeWaivedAt: new Date(),
            intakeWaivedByAdvisorId: profile.id,
          }
        : {
            intakeWaivedAt: null,
            intakeWaivedByAdvisorId: null,
          },
    });

    revalidatePath("/advisor/pipeline");
    revalidatePath(`/advisor/pipeline/${clientId}`);
    revalidatePath("/dashboard");
    revalidatePath("/assessment", "layout");
    revalidatePath("/intake", "layout");

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update intake waiver";
    return { success: false, error: message };
  }
}
