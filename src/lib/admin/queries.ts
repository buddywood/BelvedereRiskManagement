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
      createdAt: true,
      advisorProfile: {
        select: {
          id: true,
          firmName: true,
          licenseNumber: true,
          specializations: true,
          _count: { select: { clientAssignments: true } },
        },
      },
    },
    orderBy: { email: "asc" },
  });
  return advisors;
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
