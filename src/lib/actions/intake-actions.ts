'use server';

import { auth } from '@/lib/auth';
import {
  createIntakeInterview,
  getIntakeInterview,
  getActiveIntakeInterview,
  saveIntakeResponse,
  updateInterviewProgress,
  submitIntakeInterview,
  getIntakeResponsesByInterview,
} from '@/lib/data/intake';
import { saveResponseSchema, submitInterviewSchema } from '@/lib/schemas/intake';
import { revalidatePath } from 'next/cache';
import { INTAKE_QUESTIONS } from '@/lib/intake/questions';

// Helper function to get authenticated user ID
async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}

// Start or resume an active intake interview
export async function startIntakeInterview() {
  try {
    const userId = await getAuthUserId();

    // Check if there's an active interview
    let interview = await getActiveIntakeInterview(userId);

    if (!interview) {
      // Create a new interview
      interview = await createIntakeInterview(userId);
    }

    return { success: true, interview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start intake interview';
    return { success: false, error: message };
  }
}

// Save response for a specific question
export async function saveResponse(interviewId: string, data: unknown) {
  try {
    const userId = await getAuthUserId();

    const validatedFields = saveResponseSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify interview ownership
    const interview = await getIntakeInterview(userId, interviewId);
    if (!interview) {
      return { success: false, error: 'Interview not found' };
    }

    const response = await saveIntakeResponse(
      interviewId,
      validatedFields.data.questionId,
      {
        audioUrl: validatedFields.data.audioUrl,
        audioDuration: validatedFields.data.audioDuration,
        transcription: validatedFields.data.transcription,
      }
    );

    revalidatePath(`/intake/${interviewId}`);
    return { success: true, response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save response';
    return { success: false, error: message };
  }
}

// Update interview progress
export async function updateProgress(interviewId: string, questionIndex: number) {
  try {
    const userId = await getAuthUserId();

    // Verify interview ownership
    const interview = await getIntakeInterview(userId, interviewId);
    if (!interview) {
      return { success: false, error: 'Interview not found' };
    }

    // Determine status based on progress
    let status = interview.status;
    if (status === 'NOT_STARTED') {
      status = 'IN_PROGRESS';
    }
    if (questionIndex >= INTAKE_QUESTIONS.length - 1) {
      status = 'COMPLETED';
    }

    const updatedInterview = await updateInterviewProgress(interviewId, questionIndex, status);

    revalidatePath(`/intake/${interviewId}`);
    return { success: true, interview: updatedInterview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update progress';
    return { success: false, error: message };
  }
}

// Submit completed interview
export async function submitIntakeInterviewAction(interviewId: string) {
  try {
    const userId = await getAuthUserId();

    const validatedFields = submitInterviewSchema.safeParse({ interviewId });
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify interview ownership
    const interview = await getIntakeInterview(userId, interviewId);
    if (!interview) {
      return { success: false, error: 'Interview not found' };
    }

    // Check that all questions have responses
    const responses = await getIntakeResponsesByInterview(interviewId);
    const expectedQuestionCount = INTAKE_QUESTIONS.length;

    if (responses.length < expectedQuestionCount) {
      return {
        success: false,
        error: `Interview incomplete: ${responses.length}/${expectedQuestionCount} questions answered`,
      };
    }

    const submittedInterview = await submitIntakeInterview(interviewId);

    revalidatePath(`/intake/${interviewId}`);
    return { success: true, interview: submittedInterview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit interview';
    return { success: false, error: message };
  }
}

// Get interview with responses for current user
export async function getIntakeInterviewAction(interviewId: string) {
  try {
    const userId = await getAuthUserId();
    const interview = await getIntakeInterview(userId, interviewId);

    if (!interview) {
      return { success: false, error: 'Interview not found' };
    }

    return { success: true, interview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get interview';
    return { success: false, error: message, interview: null };
  }
}

// Get active interview for current user
export async function getActiveIntakeInterviewAction() {
  try {
    const userId = await getAuthUserId();
    const interview = await getActiveIntakeInterview(userId);

    return { success: true, interview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get active interview';
    return { success: false, error: message, interview: null };
  }
}