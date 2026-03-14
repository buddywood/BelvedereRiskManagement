import { z } from 'zod';

// Schema for starting an intake interview
export const startInterviewSchema = z.object({
  userId: z.string().cuid('Invalid user ID format')
});

// Schema for saving an interview response
export const saveResponseSchema = z.object({
  interviewId: z.string().cuid('Invalid interview ID format'),
  questionId: z.string().min(1, 'Question ID is required'),
  audioUrl: z.string().url('Invalid audio URL format').optional(),
  audioDuration: z.number().min(0, 'Audio duration must be positive').optional(),
  transcription: z.string().optional()
});

// Schema for submitting a completed interview
export const submitInterviewSchema = z.object({
  interviewId: z.string().cuid('Invalid interview ID format')
});

// Type inference for form data
export type StartInterviewData = z.infer<typeof startInterviewSchema>;
export type SaveResponseData = z.infer<typeof saveResponseSchema>;
export type SubmitInterviewData = z.infer<typeof submitInterviewSchema>;