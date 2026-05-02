import "server-only";

import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin/auth";

export async function getAdvisorsForAdmin() {
  await requireAdminRole();
  const advisors = await prisma.user.findMany({
    where: { role: "ADVISOR" },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      advisorPortalAccessEnabled: true,
      subscription: {
        select: { status: true },
      },
      advisorProfile: {
        select: {
          id: true,
          firmName: true,
          licenseNumber: true,
          specializations: true,
          phone: true,
          jobTitle: true,
          bio: true,
          _count: { select: { clientAssignments: true } },
        },
      },
    },
    orderBy: { email: "asc" },
  });
  return advisors;
}

/** Fetch a single advisor by user id for admin edit form. */
export async function getAdvisorForAdmin(userId: string) {
  await requireAdminRole();
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "ADVISOR" },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      advisorProfile: {
        select: {
          id: true,
          firmName: true,
          licenseNumber: true,
          specializations: true,
          phone: true,
          jobTitle: true,
          bio: true,
        },
      },
    },
  });
  return user;
}

export async function getClientsForAdmin() {
  await requireAdminRole();
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { intakeInterviews: true, assessments: true },
      },
      clientAssignments: {
        select: {
          status: true,
          assignedAt: true,
          advisor: {
            select: {
              id: true,
              user: { select: { email: true, name: true } },
              firmName: true,
            },
          },
        },
      },
    },
    orderBy: { email: "asc" },
  });
  return users;
}

export async function getIntakeForAdmin() {
  await requireAdminRole();
  const interviews = await prisma.intakeInterview.findMany({
    select: {
      id: true,
      status: true,
      currentQuestionIndex: true,
      startedAt: true,
      completedAt: true,
      submittedAt: true,
      updatedAt: true,
      user: { select: { id: true, email: true, name: true } },
      approval: {
        select: {
          id: true,
          status: true,
          advisor: { select: { user: { select: { email: true } } } },
        },
      },
      _count: { select: { responses: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return interviews;
}

export async function getAssessmentsForAdmin() {
  await requireAdminRole();
  const assessments = await prisma.assessment.findMany({
    select: {
      id: true,
      userId: true,
      version: true,
      status: true,
      currentPillar: true,
      currentQuestionIndex: true,
      startedAt: true,
      completedAt: true,
      updatedAt: true,
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { responses: true, scores: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return assessments;
}

export async function getGovernanceReviewLeadsForAdmin() {
  await requireAdminRole();
  return prisma.governanceReviewLead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedAdvisor: {
        select: {
          id: true,
          firmName: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
}

export async function getAdvisorProfilesForLeadAssignment() {
  await requireAdminRole();
  return prisma.advisorProfile.findMany({
    select: {
      id: true,
      firmName: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { id: "asc" },
  });
}
