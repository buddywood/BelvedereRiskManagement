"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, RotateCcw, CheckCircle2, AlertCircle, Pencil, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";

/**
 * Audio Recorder Component
 *
 * Provides full recording lifecycle UI with start/stop/preview/re-record states.
 * Integrates with useAudioRecorder hook for cross-browser audio recording.
 */

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  existingAudioUrl?: string;
  transcription?: string;
  transcriptionEditedAt?: string;
  transcriptionStatus?: 'recording' | 'completed' | 'uploading' | 'failed' | 'pending';
  onTranscriptionSave?: (transcription: string) => Promise<void>;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatEditedTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Edited recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AudioRecorder({
  onRecordingComplete,
  existingAudioUrl,
  transcription,
  transcriptionEditedAt,
  transcriptionStatus,
  onTranscriptionSave,
  disabled = false
}: AudioRecorderProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    hasPermission
  } = useAudioRecorder();

  const [showExistingAudio, setShowExistingAudio] = useState(Boolean(existingAudioUrl));
  const [isExpandedExistingResponse, setIsExpandedExistingResponse] = useState(false);
  const processedBlobRef = useRef<Blob | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState(transcription || "");
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  // Initialize with existing audio if provided
  useEffect(() => {
    setShowExistingAudio(Boolean(existingAudioUrl));
    setIsExpandedExistingResponse(false);
  }, [existingAudioUrl]);

  useEffect(() => {
    setEditedTranscription(transcription || "");
  }, [transcription]);

  // Call onRecordingComplete when new recording is finished
  useEffect(() => {
    if (audioBlob && !isRecording && duration > 0 && processedBlobRef.current !== audioBlob) {
      processedBlobRef.current = audioBlob;
      onRecordingComplete(audioBlob, duration);
      setShowExistingAudio(false); // Clear existing audio flag when new recording made
      setIsExpandedExistingResponse(true);
    }
  }, [audioBlob, duration, isRecording, onRecordingComplete]);

  useEffect(() => {
    if (!audioBlob) {
      processedBlobRef.current = null;
    }
  }, [audioBlob]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReRecord = () => {
    resetRecording();
    processedBlobRef.current = null;
    setIsEditingTranscript(false);
    setIsExpandedExistingResponse(false);
    setShowExistingAudio(false);
  };

  const handleSaveTranscript = async () => {
    if (!onTranscriptionSave) return;

    setIsSavingTranscript(true);
    try {
      await onTranscriptionSave(editedTranscription);
      setIsEditingTranscript(false);
    } finally {
      setIsSavingTranscript(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="size-5" />
          <span className="font-medium">Recording Error</span>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {error}
        </p>
        <Button
          variant="outline"
          onClick={handleReRecord}
          className="mt-4"
        >
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Show recording state
  if (isRecording) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        {/* Pulsing recording indicator */}
        <div className="relative">
          <div className="size-20 rounded-full bg-destructive flex items-center justify-center animate-pulse">
            <div className="size-8 rounded-full bg-white" />
          </div>
          <div className="absolute inset-0 size-20 rounded-full border-4 border-destructive/30 animate-ping" />
        </div>

        {/* Duration display */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-mono font-semibold tracking-wide">
            {formatDuration(duration)}
          </div>
          <p className="text-sm text-muted-foreground">Recording in progress...</p>
        </div>

        {/* Stop button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleStopRecording}
          className="bg-card"
        >
          <Square className="size-4" />
          Stop Recording
        </Button>
      </div>
    );
  }

  // Show completed recording state (either new recording or existing)
  const displayAudioUrl = audioUrl || (showExistingAudio ? existingAudioUrl : undefined);
  const displayDuration = duration > 0 ? duration : 0;
  const isShowingCollapsedExistingResponse =
    Boolean(showExistingAudio && existingAudioUrl && !audioUrl && !isExpandedExistingResponse);

  if (isShowingCollapsedExistingResponse) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="flex items-center gap-3 text-emerald-600">
          <CheckCircle2 className="size-5" />
          <span className="font-medium">Response already recorded for this question</span>
        </div>

        <p className="max-w-xl text-center text-sm text-muted-foreground">
          You can review the saved audio and transcript, or record a fresh response for this step.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpandedExistingResponse(true)}
            disabled={disabled}
          >
            Review Saved Response
          </Button>
          <Button
            type="button"
            onClick={handleReRecord}
            disabled={disabled}
          >
            <Mic className="size-4" />
            Record New Response
          </Button>
        </div>
      </div>
    );
  }

  if (displayAudioUrl || showExistingAudio) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        {/* Success indicator */}
        <div className="flex items-center gap-3 text-emerald-600">
          <CheckCircle2 className="size-5" />
          <span className="font-medium">Response Recorded</span>
        </div>

        {/* Audio preview */}
        {displayAudioUrl && (
          <div className="w-full max-w-md">
            <audio
              controls
              src={displayAudioUrl}
              className="w-full"
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Duration display */}
        {displayDuration > 0 && (
          <p className="text-sm text-muted-foreground">
            Duration: {formatDuration(displayDuration)}
          </p>
        )}

        {/* Transcription display */}
        {transcriptionStatus === 'pending' || transcriptionStatus === 'uploading' ? (
          <div className="w-full max-w-2xl rounded-[1.25rem] border section-divider bg-background/55 px-5 py-4">
            <p className="editorial-kicker">Transcription</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Generating transcript from your recording...
            </p>
          </div>
        ) : transcription ? (
          <div className="w-full max-w-2xl rounded-[1.25rem] border section-divider bg-background/55 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="editorial-kicker">Transcription</p>
                {transcriptionEditedAt ? (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 font-medium uppercase tracking-[0.14em]">
                      Edited
                    </span>
                    <span>{formatEditedTimestamp(transcriptionEditedAt)}</span>
                  </div>
                ) : null}
              </div>
              {!isEditingTranscript && onTranscriptionSave ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTranscript(true)}
                  disabled={disabled}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              ) : null}
            </div>

            {isEditingTranscript ? (
              <div className="mt-3 space-y-3">
                <Textarea
                  value={editedTranscription}
                  onChange={(event) => setEditedTranscription(event.target.value)}
                  className="min-h-32"
                  disabled={isSavingTranscript}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveTranscript}
                    disabled={isSavingTranscript || editedTranscription.trim().length === 0}
                  >
                    {isSavingTranscript ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Transcript
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedTranscription(transcription);
                      setIsEditingTranscript(false);
                    }}
                    disabled={isSavingTranscript}
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-foreground/90">{transcription}</p>
            )}
          </div>
        ) : null}

        {/* Re-record button */}
        <Button
          variant="outline"
          onClick={handleReRecord}
          disabled={disabled}
        >
          <RotateCcw className="size-4" />
          Re-record Response
        </Button>
      </div>
    );
  }

  // Show idle state (initial state, ready to record)
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Large record button */}
      <Button
        size="lg"
        onClick={handleStartRecording}
          disabled={disabled || hasPermission === false}
        className="size-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Mic className="size-8" />
      </Button>

      {/* Instruction text */}
      <div className="text-center space-y-2">
        <p className="font-medium">Tap to record your response</p>
        <p className="text-sm text-muted-foreground">
          Speak clearly and take your time
        </p>
      </div>

      {/* Permission warning if denied */}
      {hasPermission === false && (
        <div className="text-center space-y-2 max-w-md">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <AlertCircle className="size-4" />
            <span className="text-sm font-medium">Microphone Access Required</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Please allow microphone access in your browser settings and refresh the page.
          </p>
        </div>
      )}
    </div>
  );
}