'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdvisorRole, getAdvisorProfileOrThrow } from '@/lib/advisor/auth';
import {
  getAssignedClients,
  getClientIntakeForReview,
  createIntakeApproval,
  updateIntakeApproval,
  getAdvisorNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/data/advisor';
import { approveClientSchema } from '@/lib/schemas/advisor';
import { INTAKE_QUESTIONS } from '@/lib/intake/questions';
import type { AdvisorDashboardClient, IntakeReviewData } from '@/lib/advisor/types';

export async function getAdvisorDashboardData() {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const clients = await getAssignedClients(profile.id);
    const notifications = await getAdvisorNotifications(profile.id);
    const unreadNotificationCount = notifications.filter(n => !n.read).length;

    return {
      success: true,
      data: {
        clients,
        profile,
        unreadNotificationCount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get advisor dashboard data';
    return { success: false, error: message };
  }
}

export async function getIntakeReviewData(interviewId: string) {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const validatedFields = z.object({ interviewId: z.string().cuid() }).safeParse({ interviewId });
    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid interview ID',
      };
    }

    const reviewData = await getClientIntakeForReview(profile.id, interviewId);
    if (!reviewData) {
      return {
        success: false,
        error: 'Interview not found or not assigned to you',
      };
    }

    const intakeReviewData: IntakeReviewData = {
      interview: reviewData.interview,
      approval: reviewData.approval,
      questions: INTAKE_QUESTIONS.map(q => ({
        id: q.id,
        text: q.questionText,
        helpText: q.context,
        type: 'audio',
      })),
    };

    return {
      success: true,
      data: intakeReviewData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get intake review data';
    return { success: false, error: message };
  }
}

export async function markIntakeInReview(interviewId: string) {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const validatedFields = z.object({ interviewId: z.string().cuid() }).safeParse({ interviewId });
    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid interview ID',
      };
    }

    // Create approval if it doesn't exist
    let approval = await createIntakeApproval(interviewId, profile.id);

    // Update to IN_REVIEW status if it's currently PENDING
    if (approval.status === 'PENDING') {
      approval = await updateIntakeApproval(approval.id, {
        status: 'IN_REVIEW',
        reviewedAt: new Date(),
      });
    }

    revalidatePath('/advisor/review/[id]', 'page');
    return {
      success: true,
      data: approval,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark intake in review';
    return { success: false, error: message };
  }
}

export async function approveClientIntake(data: unknown) {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const validatedFields = approveClientSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { interviewId, focusAreas, notes } = validatedFields.data;

    // First ensure an approval exists
    let approval = await createIntakeApproval(interviewId, profile.id);

    // Update to APPROVED status with focus areas and notes
    approval = await updateIntakeApproval(approval.id, {
      status: 'APPROVED',
      focusAreas,
      notes,
      approvedAt: new Date(),
    });

    revalidatePath('/advisor/review/[id]', 'page');
    revalidatePath('/advisor');
    return {
      success: true,
      data: approval,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve client intake';
    return { success: false, error: message };
  }
}

export async function rejectClientIntake(approvalId: string, notes?: string) {
  try {
    const { userId } = await requireAdvisorRole();
    await getAdvisorProfileOrThrow(userId);

    const validatedFields = z.object({
      approvalId: z.string().cuid(),
      notes: z.string().optional(),
    }).safeParse({ approvalId, notes });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid approval ID',
      };
    }

    const approval = await updateIntakeApproval(approvalId, {
      status: 'REJECTED',
      notes,
    });

    revalidatePath('/advisor/review/[id]', 'page');
    revalidatePath('/advisor');
    return {
      success: true,
      data: approval,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject client intake';
    return { success: false, error: message };
  }
}

export async function getAdvisorNotificationsAction() {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const notifications = await getAdvisorNotifications(profile.id);

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get advisor notifications';
    return { success: false, error: message };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const validatedFields = z.object({ notificationId: z.string().cuid() }).safeParse({ notificationId });
    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid notification ID',
      };
    }

    await markNotificationRead(notificationId, profile.id);

    revalidatePath('/advisor');
    revalidatePath('/advisor/notifications');
    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
    return { success: false, error: message };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    await markAllNotificationsRead(profile.id);

    revalidatePath('/advisor');
    revalidatePath('/advisor/notifications');
    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
    return { success: false, error: message };
  }
}