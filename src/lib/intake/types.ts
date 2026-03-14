import { Prisma } from '@prisma/client';

// TypeScript types matching Prisma enums
export type IntakeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED';
export type TranscriptionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Interview question structure
export interface IntakeQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  context: string;
  recordingTips: string[];
}

// Prisma include pattern for IntakeInterview with responses
export type IntakeInterviewWithResponses = Prisma.IntakeInterviewGetPayload<{
  include: {
    responses: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;