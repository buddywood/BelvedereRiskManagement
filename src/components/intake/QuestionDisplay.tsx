"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Question Display Component
 *
 * Displays intake interview questions with prominent text hierarchy.
 * Follows Belvedere editorial design patterns for clean, focused UX.
 */

export interface IntakeQuestion {
  id: string;
  questionText: string;
  context: string;
  recordingTips: string[];
  questionNumber: number;
}

interface QuestionDisplayProps {
  question: IntakeQuestion;
  totalQuestions: number;
}

export function QuestionDisplay({ question, totalQuestions }: QuestionDisplayProps) {
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
  }, [question.id]);

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
      const response = await fetch("/api/intake/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: question.questionText,
          context: question.context,
          recordingTips: question.recordingTips,
          questionNumber: question.questionNumber,
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

  return (
    <div className="py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Question number - editorial kicker style */}
      <div className="editorial-kicker text-sm text-muted-foreground uppercase tracking-wider mb-4">
        Question {question.questionNumber} of {totalQuestions}
      </div>

      {/* Question text - prominent heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {question.questionText}
        </h1>
        {isSpeaking ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStop}
            className="shrink-0"
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
            className="shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Volume2 className="size-4" />
            )}
            {isGenerating ? "Preparing Audio" : audioReady ? "Replay Question" : "Play Question"}
          </Button>
        )}
      </div>

      {/* Context - secondary guidance */}
      <p className="text-base text-muted-foreground mb-8 leading-relaxed">
        {question.context}
      </p>

      {/* Recording tips with subtle styling */}
      {question.recordingTips && question.recordingTips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="size-4" />
            <span className="font-medium">Recording Tips</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground pl-6">
            {question.recordingTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/60 mt-2 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}