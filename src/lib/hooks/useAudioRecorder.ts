import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Audio Recorder Hook
 *
 * Implements MediaRecorder API with cross-browser format detection.
 * Handles audio recording lifecycle, duration tracking, and proper cleanup.
 */

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  hasPermission: boolean | null;
}

/**
 * Detects preferred MIME type for cross-browser compatibility.
 * Tests formats in order of preference for optimal quality and compatibility.
 */
function getPreferredMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/webm',
    'audio/mp4'
  ];

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  // Fallback to empty string if no preferred format is supported
  return '';
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing error when starting new actions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      clearError();

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasPermission(true);

      // Get preferred MIME type for cross-browser compatibility
      const mimeType = getPreferredMimeType();

      // Create MediaRecorder with detected MIME type
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      mediaRecorderRef.current = mediaRecorder;

      // Reset chunks array
      chunksRef.current = [];

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm'
        });
        setAudioBlob(blob);

        // Create object URL for playback preview
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        setIsRecording(false);
        setIsPaused(false);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer (update every second)
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);

      // Handle specific error types with user-friendly messages
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow access and try again.');
          setHasPermission(false);
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
          setHasPermission(false);
        } else {
          setError('Failed to start recording. Please check your microphone and try again.');
        }
      } else {
        setError('An unexpected error occurred while starting recording.');
      }
    }
  }, [clearError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, [isRecording]);

  // Reset recording state
  const resetRecording = useCallback(() => {
    // Stop any active recording first
    if (isRecording) {
      stopRecording();
    }

    // Revoke object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset all state
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    clearError();

    // Clear chunks
    chunksRef.current = [];
  }, [isRecording, audioUrl, stopRecording, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (isRecording) {
        stopRecording();
      }

      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Revoke object URLs to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      // Stop media stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording, audioUrl, stopRecording]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    hasPermission,
  };
}