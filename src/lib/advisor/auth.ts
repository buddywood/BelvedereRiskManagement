import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireAdvisorRole() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const userRole = session.user.role;
  if (userRole !== 'ADVISOR' && userRole !== 'ADMIN') {
    throw new Error("Unauthorized: Advisor access required");
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
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Advisor profile not found");
  }

  return profile;
}