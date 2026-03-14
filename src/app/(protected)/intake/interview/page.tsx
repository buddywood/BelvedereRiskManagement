"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { QuestionDisplay } from "@/components/intake/QuestionDisplay";
import { AudioRecorder } from "@/components/intake/AudioRecorder";
import { StepIndicator } from "@/components/intake/StepIndicator";
import { useIntakeInterview } from "@/lib/hooks/useIntakeInterview";
import { useIntakeStore } from "@/lib/intake/store";
import { INTAKE_QUESTIONS } from "@/lib/intake/questions";
import {
  getIntakeInterviewAction,
  updateProgress,
  submitIntakeInterviewAction,
  getActiveIntakeInterviewAction,
  saveResponse
} from "@/lib/actions/intake-actions";

/**
 * Intake Interview Wizard
 *
 * Main interview experience with one question per screen, audio recording,
 * auto-save, and automatic submission on completion.
 */

export default function InterviewPage() {
  const router = useRouter();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    isLastQuestion,
    getResponseForQuestion
  } = useIntakeInterview(interviewId || "");

  const { responses, setResponse, setCurrentQuestion } = useIntakeStore();

  // Load interview on mount
  useEffect(() => {
    async function loadInterview() {
      try {
        // Get the active interview
        const activeInterviewResult = await getActiveIntakeInterviewAction();

        if (activeInterviewResult.success && activeInterviewResult.interview) {
          const interview = activeInterviewResult.interview;
          setInterviewId(interview.id);

          // Load interview details to get current progress
          const detailResult = await getIntakeInterviewAction(interview.id);
          if (detailResult.success && detailResult.interview) {
            // Update store with loaded responses and progress
            const loadedInterview = detailResult.interview;
            setCurrentQuestion(loadedInterview.currentQuestionIndex || 0);

            // Load existing responses into store
            if (loadedInterview.responses) {
              for (const response of loadedInterview.responses) {
                setResponse(response.questionId, {
                  audioUrl: response.audioUrl || undefined,
                  audioDuration: response.audioDuration || 0,
                  transcription: response.transcription || undefined,
                  transcriptionEditedAt: undefined,
                  status: response.transcriptionStatus === 'COMPLETED' ? 'completed' : 'pending'
                });
              }
            }
          }
        } else {
          // No active interview - redirect to start page
          router.push("/intake");
          return;
        }
      } catch (error) {
        console.error("Failed to load interview:", error);
        toast.error("Failed to load interview. Please try again.");
        router.push("/intake");
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [router, setCurrentQuestion, setResponse]);

  // Handle audio recording completion with auto-save
  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!interviewId || !currentQuestion || uploading || submitting) return;

    setUploading(true);

    try {
      // Step 1: Upload audio file
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("questionId", currentQuestion.id);

      const uploadResponse = await fetch(`/api/intake/${interviewId}/audio`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio");
      }

      const uploadData = await uploadResponse.json();

      // Step 2: Update local store with upload result
      setResponse(currentQuestion.id, {
        audioUrl: uploadData.audioUrl,
        audioDuration: duration,
        status: 'pending'
      });

      // Step 3: Trigger transcription
      try {
        const transcribeResponse = await fetch(`/api/intake/${interviewId}/transcribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionId: currentQuestion.id }),
        });

        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json();

          // Update store with transcription result
          setResponse(currentQuestion.id, {
            audioUrl: uploadData.audioUrl,
            audioDuration: duration,
            transcription: transcribeData.transcription,
            status: 'completed'
          });
        } else {
          // Handle transcription failure gracefully
          console.warn("Transcription failed, but audio was saved:", await transcribeResponse.text());

          setResponse(currentQuestion.id, {
            audioUrl: uploadData.audioUrl,
            audioDuration: duration,
            transcription: undefined,
            status: 'completed' // Mark as completed even without transcription
          });

          toast("Audio saved. Transcription will be processed later.", { icon: '⚠️' });
        }
      } catch (transcribeError) {
        console.warn("Transcription service error:", transcribeError);

        // Audio is saved, just mark as completed without transcription
        setResponse(currentQuestion.id, {
          audioUrl: uploadData.audioUrl,
          audioDuration: duration,
          transcription: undefined,
          status: 'completed'
        });

        toast("Audio saved. Transcription will be processed later.", { icon: '⚠️' });
      }

      // Step 4: If this is the last question, auto-submit
      if (isLastQuestion) {
        setSubmitting(true);

        try {
          const submitResult = await submitIntakeInterviewAction(interviewId);

          if (submitResult.success) {
            toast.success("Interview completed successfully!");
            router.push("/intake/complete");
          } else {
            toast.error(submitResult.error || "Failed to submit interview");
          }
        } catch (error) {
          console.error("Submit error:", error);
          toast.error("Failed to submit interview. Please try again.");
        } finally {
          setSubmitting(false);
        }
      } else {
        toast.success("Response saved!");
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save response. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle navigation with progress updates
  const handleNext = async () => {
    if (!interviewId || !canGoNext) return;

    if (!isLastQuestion) {
      goToNext();

      // Update progress on server
      try {
        await updateProgress(interviewId, currentIndex + 1);
      } catch (error) {
        console.error("Failed to update progress:", error);
        // Don't block navigation for progress update failures
      }
    }
  };

  const handlePrevious = () => {
    if (canGoPrev) {
      goToPrev();
    }
  };

  const handleTranscriptionSave = async (transcription: string) => {
    if (!interviewId || !currentQuestion) return;

    const result = await saveResponse(interviewId, {
      interviewId,
      questionId: currentQuestion.id,
      audioUrl: currentResponse?.audioUrl,
      audioDuration: currentResponse?.audioDuration,
      transcription,
    });

    if (!result.success) {
      const errorMessage =
        ("error" in result && result.error) ||
        ("errors" in result && result.errors
          ? Object.values(result.errors).flat().find(Boolean)
          : undefined) ||
        "Failed to save transcript";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    setResponse(currentQuestion.id, {
      transcription,
      transcriptionEditedAt: new Date().toISOString(),
      status: currentResponse?.status || 'completed',
    });
    toast.success("Transcript updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading interview...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Interview question not found.</p>
        <Button onClick={() => router.push("/intake")} className="mt-4">
          Return to Intake
        </Button>
      </div>
    );
  }

  // Get current question response for the recorder
  const currentResponse = getResponseForQuestion(currentQuestion.id);
  const hasResponse = Boolean(currentResponse?.audioUrl);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Step Indicator */}
      <StepIndicator
        currentIndex={currentIndex}
        totalSteps={totalQuestions}
        completedSteps={new Set(
          Object.entries(responses)
            .filter(([, response]) => response?.status === 'completed')
            .map(([questionId]) => {
              const questionIndex = INTAKE_QUESTIONS.findIndex(q => q.id === questionId);
              return questionIndex >= 0 ? questionIndex : -1;
            })
            .filter(index => index >= 0)
        )}
      />

      {/* Question Display */}
      <QuestionDisplay
        question={currentQuestion}
        totalQuestions={totalQuestions}
      />

      {/* Audio Recorder */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-medium">Record Your Response</h3>

          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            existingAudioUrl={currentResponse?.audioUrl}
            transcription={currentResponse?.transcription}
            transcriptionEditedAt={currentResponse?.transcriptionEditedAt}
            transcriptionStatus={currentResponse?.status}
            onTranscriptionSave={handleTranscriptionSave}
            disabled={uploading || submitting}
          />

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving your response...</span>
            </div>
          )}

          {submitting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting interview...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrev || uploading || submitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </div>

        {!isLastQuestion ? (
          <Button
            onClick={handleNext}
            disabled={!hasResponse || !canGoNext || uploading || submitting}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">
            {hasResponse ? (
              submitting ? "Submitting..." : "Recording will complete the interview"
            ) : "Record your response to continue"}
          </div>
        )}
      </div>
    </div>
  );
}