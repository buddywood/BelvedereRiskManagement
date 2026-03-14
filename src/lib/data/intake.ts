import "server-only";

import { type IntakeInterview, type IntakeResponse, type IntakeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type IntakeResponseInput = {
  audioUrl?: string;
  audioDuration?: number;
  transcription?: string;
  transcriptionStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
};

export async function createIntakeInterview(userId: string): Promise<IntakeInterview> {
  return prisma.intakeInterview.create({
    data: {
      userId,
      status: 'NOT_STARTED',
      currentQuestionIndex: 0,
    },
  });
}

export async function getIntakeInterview(userId: string, id: string): Promise<(IntakeInterview & { responses: IntakeResponse[] }) | null> {
  return prisma.intakeInterview.findFirst({
    where: { id, userId },
    include: {
      responses: {
        orderBy: { updatedAt: 'asc' },
      },
    },
  });
}

export async function getActiveIntakeInterview(userId: string): Promise<IntakeInterview | null> {
  return prisma.intakeInterview.findFirst({
    where: {
      userId,
      status: {
        not: 'SUBMITTED'
      }
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function saveIntakeResponse(interviewId: string, questionId: string, data: IntakeResponseInput): Promise<IntakeResponse> {
  return prisma.intakeResponse.upsert({
    where: {
      interviewId_questionId: {
        interviewId,
        questionId,
      },
    },
    create: {
      interviewId,
      questionId,
      audioUrl: data.audioUrl ?? null,
      audioDuration: data.audioDuration ?? null,
      transcription: data.transcription ?? null,
      transcriptionStatus: data.transcriptionStatus ?? 'PENDING',
    },
    update: {
      audioUrl: data.audioUrl ?? undefined,
      audioDuration: data.audioDuration ?? undefined,
      transcription: data.transcription ?? undefined,
      transcriptionStatus: data.transcriptionStatus ?? undefined,
    },
  });
}

export async function updateInterviewProgress(
  interviewId: string,
  currentQuestionIndex: number,
  status?: IntakeStatus
): Promise<IntakeInterview | null> {
  const updateData: any = {
    currentQuestionIndex,
    updatedAt: new Date(),
  };

  if (status) {
    updateData.status = status;
  }

  return prisma.intakeInterview.update({
    where: { id: interviewId },
    data: updateData,
  });
}

export async function submitIntakeInterview(interviewId: string): Promise<IntakeInterview | null> {
  return prisma.intakeInterview.update({
    where: { id: interviewId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });
}

export async function getIntakeResponsesByInterview(interviewId: string): Promise<IntakeResponse[]> {
  return prisma.intakeResponse.findMany({
    where: { interviewId },
    orderBy: { updatedAt: 'asc' },
  });
}