import "server-only";

import { prisma } from "@/lib/db";
import type { AdvisorDashboardClient } from "@/lib/advisor/types";

export async function getAdvisorProfile(userId: string) {
  return prisma.advisorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getAssignedClients(advisorProfileId: string): Promise<AdvisorDashboardClient[]> {
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Get the latest interview for each client
  const clientIds = assignments.map(a => a.client.id);
  const latestInterviews = await prisma.intakeInterview.findMany({
    where: {
      userId: { in: clientIds },
    },
    select: {
      id: true,
      userId: true,
      status: true,
      submittedAt: true,
      updatedAt: true,
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Group interviews by userId and get the most recent for each client
  const interviewsByClient = new Map();
  for (const interview of latestInterviews) {
    if (!interviewsByClient.has(interview.userId)) {
      interviewsByClient.set(interview.userId, {
        id: interview.id,
        status: interview.status,
        submittedAt: interview.submittedAt,
        responseCount: interview._count.responses,
      });
    }
  }

  return assignments.map(assignment => ({
    id: assignment.client.id,
    name: assignment.client.name,
    email: assignment.client.email,
    assignedAt: assignment.assignedAt,
    latestInterview: interviewsByClient.get(assignment.client.id) || null,
  }));
}

export async function getClientIntakeForReview(advisorProfileId: string, interviewId: string) {
  // First verify the advisor has access to this client's interview
  const interview = await prisma.intakeInterview.findFirst({
    where: {
      id: interviewId,
      user: {
        clientAssignments: {
          some: {
            advisorId: advisorProfileId,
            status: 'ACTIVE',
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      responses: {
        orderBy: {
          questionId: 'asc',
        },
      },
    },
  });

  if (!interview) {
    return null;
  }

  // Get the approval if one exists
  const approval = await prisma.intakeApproval.findUnique({
    where: {
      interviewId: interviewId,
    },
  });

  return {
    interview,
    approval,
  };
}

export async function createIntakeApproval(interviewId: string, advisorProfileId: string) {
  return prisma.intakeApproval.upsert({
    where: {
      interviewId: interviewId,
    },
    create: {
      interviewId: interviewId,
      advisorId: advisorProfileId,
      status: 'PENDING',
    },
    update: {
      // Don't update anything if it already exists
    },
  });
}

export async function updateIntakeApproval(
  approvalId: string,
  data: {
    status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
    focusAreas?: string[];
    notes?: string;
    reviewedAt?: Date;
    approvedAt?: Date;
  }
) {
  const updateData: any = { ...data };

  // Auto-set timestamps based on status
  if (data.status === 'APPROVED' && !data.approvedAt) {
    updateData.approvedAt = new Date();
  }
  if (data.status === 'IN_REVIEW' && !data.reviewedAt) {
    updateData.reviewedAt = new Date();
  }

  return prisma.intakeApproval.update({
    where: { id: approvalId },
    data: updateData,
  });
}

export async function getAdvisorNotifications(advisorProfileId: string, unreadOnly?: boolean) {
  return prisma.advisorNotification.findMany({
    where: {
      advisorId: advisorProfileId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function markNotificationRead(notificationId: string, advisorProfileId: string) {
  return prisma.advisorNotification.updateMany({
    where: {
      id: notificationId,
      advisorId: advisorProfileId, // Ownership check
    },
    data: {
      read: true,
    },
  });
}

export async function createNotification(
  advisorProfileId: string,
  type: 'NEW_INTAKE' | 'INTAKE_UPDATED' | 'SYSTEM',
  title: string,
  message: string,
  referenceId?: string
) {
  return prisma.advisorNotification.create({
    data: {
      advisorId: advisorProfileId,
      type,
      title,
      message,
      referenceId,
      read: false,
    },
  });
}

export async function markAllNotificationsRead(advisorProfileId: string) {
  return prisma.advisorNotification.updateMany({
    where: {
      advisorId: advisorProfileId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}