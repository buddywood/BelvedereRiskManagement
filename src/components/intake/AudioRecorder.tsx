"use client";

import { useState, useEffect } from "react";
import { Mic, Square, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function AudioRecorder({
  onRecordingComplete,
  existingAudioUrl,
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

  const [hasExistingAudio, setHasExistingAudio] = useState(false);

  // Initialize with existing audio if provided
  useEffect(() => {
    if (existingAudioUrl && !audioUrl) {
      setHasExistingAudio(true);
    }
  }, [existingAudioUrl, audioUrl]);

  // Call onRecordingComplete when new recording is finished
  useEffect(() => {
    if (audioBlob && duration > 0 && !isRecording) {
      onRecordingComplete(audioBlob, duration);
      setHasExistingAudio(false); // Clear existing audio flag when new recording made
    }
  }, [audioBlob, duration, isRecording, onRecordingComplete]);

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
    setHasExistingAudio(false);
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
  const displayAudioUrl = audioUrl || existingAudioUrl;
  const displayDuration = duration > 0 ? duration : 0;

  if (displayAudioUrl || hasExistingAudio) {
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