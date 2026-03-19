"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuestionTtsPlayPayload {
  moduleName?: string;
  questionText: string;
  context?: string;
  learnMore?: string;
  recordingTips?: string[];
  questionNumber: number;
  totalQuestions: number;
}

interface QuestionTtsPlayButtonProps extends QuestionTtsPlayPayload {
  /** Stable id when question content changes (resets cached audio). */
  contentKey: string;
  /** API route — use `/api/assessment/tts` for assessments, `/api/intake/tts` for intake. */
  endpoint: string;
  className?: string;
}

/**
 * Play / replay question audio via server TTS (same pipeline as intake interview).
 */
export function QuestionTtsPlayButton({
  contentKey,
  endpoint,
  moduleName,
  questionText,
  context,
  learnMore,
  recordingTips = [],
  questionNumber,
  totalQuestions,
  className,
}: QuestionTtsPlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
    setIsGenerating(false);
    setAudioReady(false);
  }, [contentKey]);

  const createAndPlayAudio = async (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    await audio.play();
  };

  const handleSpeak = async () => {
    if (audioRef.current && audioReady) {
      audioRef.current.currentTime = 0;
      setIsSpeaking(true);
      await audioRef.current.play();
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleName,
          questionText,
          context,
          learnMore,
          recordingTips,
          questionNumber,
          totalQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = audioUrl;
      setAudioReady(true);

      await createAndPlayAudio(audioUrl);
    } catch (error) {
      console.error("Question TTS playback error:", error);
      setIsSpeaking(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    if (!audioRef.current) {
      setIsSpeaking(false);
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsSpeaking(false);
  };

  return isSpeaking ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleStop}
      className={className}
    >
      <Square className="size-4" />
      Stop
    </Button>
  ) : (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSpeak}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Volume2 className="size-4" />
      )}
      {isGenerating ? "Preparing audio" : audioReady ? "Replay question" : "Play question"}
    </Button>
  );
}
