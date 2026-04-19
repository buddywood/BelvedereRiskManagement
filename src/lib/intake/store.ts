import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Intake Interview Store
 *
 * State management for audio interview progress with localStorage persistence.
 * Follows the same pattern as assessment store for consistency.
 */

export interface InterviewResponse {
  audioUrl?: string;
  audioDuration?: number;
  transcription?: string;
  transcriptionEditedAt?: string;
  status: 'recording' | 'completed' | 'uploading' | 'failed' | 'pending';
}

interface IntakeState {
  // State
  interviewId: string | null;
  currentQuestionIndex: number;
  responses: Record<string, InterviewResponse>;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startedAt: string | null;

  // Actions
  setInterviewId: (id: string) => void;
  setCurrentQuestion: (index: number) => void;
  setResponse: (questionId: string, data: Partial<InterviewResponse>) => void;
  setStatus: (status: IntakeState['status']) => void;
  reset: () => void;

  // Computed getters
  getTotalAnswered: () => number;
  getIsComplete: () => boolean;
}

const initialState = {
  interviewId: null,
  currentQuestionIndex: 0,
  responses: {},
  status: 'not_started' as const,
  startedAt: null,
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setInterviewId: (id: string) =>
        set({
          interviewId: id,
          startedAt: new Date().toISOString()
        }),

      setCurrentQuestion: (index: number) =>
        set({ currentQuestionIndex: index }),

      setResponse: (questionId: string, data: Partial<InterviewResponse>) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: {
              ...state.responses[questionId],
              ...data,
            },
          },
        })),

      setStatus: (status: IntakeState['status']) =>
        set({ status }),

      reset: () =>
        set(initialState),

      // Computed getters
      getTotalAnswered: () => {
        const state = get();
        return Object.values(state.responses).filter((response) => {
          if (response.status !== 'completed') return false;
          if (response.audioUrl) return true;
          return Boolean(response.transcription?.trim());
        }).length;
      },

      getIsComplete: () => {
        const state = get();
        // Note: TOTAL_QUESTIONS will be defined when intake/questions.ts is created in Plan 01
        // For now, we'll use a placeholder that works with the navigation logic
        const TOTAL_QUESTIONS = 10; // This will be imported from questions.ts later
        return state.getTotalAnswered() === TOTAL_QUESTIONS;
      },
    }),
    {
      name: 'intake-interview',
      partialize: (state) => ({
        interviewId: state.interviewId,
        currentQuestionIndex: state.currentQuestionIndex,
        responses: state.responses,
        status: state.status,
        startedAt: state.startedAt,
      }),
    }
  )
);