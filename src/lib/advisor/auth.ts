import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Thrown by `requireAdvisorRole` when an admin has disabled advisor hub/API access. */
export const ADVISOR_PORTAL_DISABLED_MESSAGE =
  "Advisor portal access has been disabled for your account.";

export async function isAdvisorPortalAccessEnabled(userId: string): Promise<boolean> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { advisorPortalAccessEnabled: true },
  });
  return row?.advisorPortalAccessEnabled !== false;
}

async function assertAdvisorPortalAccessForAdvisorRole(userId: string): Promise<void> {
  const ok = await isAdvisorPortalAccessEnabled(userId);
  if (!ok) {
    throw new Error(ADVISOR_PORTAL_DISABLED_MESSAGE);
  }
}

export async function requireAdvisorRole() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const userRole = session.user.role?.toString().toUpperCase();
  if (userRole !== "ADVISOR" && userRole !== "ADMIN") {
    throw new Error("Unauthorized: Advisor access required");
  }

  if (userRole === "ADVISOR") {
    await assertAdvisorPortalAccessForAdvisorRole(session.user.id);
  }

  return {
    userId: session.user.id,
    role: userRole,
  };
}

export async function getAdvisorProfileOrThrow(userId: string) {
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Advisor profile not found");
  }

  return profile;
}