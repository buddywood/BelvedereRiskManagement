"use client";

import { useEffect, useRef, useState } from "react";
import { CircleHelp, Loader2, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AudioPlayer } from "./AudioPlayer";
import type { IntakeReviewData } from "@/lib/advisor/types";

interface AdvisorIntakeViewProps {
  responses: IntakeReviewData["interview"]["responses"];
  questions: IntakeReviewData["questions"];
  totalQuestions: number;
}

/**
 * Advisor view: question text (with optional “why we ask” tooltip and play-question TTS)
 * and the client’s response (audio + transcript). Recording tips are client-only and omitted here.
 */
export function AdvisorIntakeView({
  responses,
  questions,
  totalQuestions,
}: AdvisorIntakeViewProps) {
  const responseByQuestionId = responses.reduce(
    (acc, r) => {
      acc[r.questionId] = r;
      return acc;
    },
    {} as Record<string, (typeof responses)[0]>,
  );

  return (
    <div className="space-y-10">
      {questions.map((question) => {
        const response = responseByQuestionId[question.id];
        const num = question.questionNumber ?? (parseInt(question.id.replace("intake-q", ""), 10) || 0);
        return (
          <section key={question.id} className="space-y-4 rounded-lg border bg-card p-6">
            <QuestionBlock
              question={question}
              questionNumber={num}
              totalQuestions={totalQuestions}
            />
            <ClientResponseBlock response={response} questionNumber={num} />
          </section>
        );
      })}
      {questions.length === 0 && (
        <div className="rounded-lg border bg-muted/30 p-8 text-center text-muted-foreground">
          No questions in this intake.
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
  question,
  questionNumber,
  totalQuestions,
}: {
  question: IntakeReviewData["questions"][0];
  questionNumber: number;
  totalQuestions: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const text = question.questionText ?? question.text;
  const ttsContext = question.context ?? question.helpText ?? "";
  const tooltipText = question.whyThisMatters?.trim();

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
      const res = await fetch("/api/intake/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: text,
          context: ttsContext,
          recordingTips: [],
          questionNumber,
          totalQuestions,
        }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setAudioReady(true);
      await createAndPlayAudio(url);
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  return (
    <div className="space-y-3">
      <div className="editorial-kicker text-sm text-muted-foreground uppercase tracking-wider">
        Question {questionNumber} of {totalQuestions}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <h3 className="text-lg font-medium leading-7 text-foreground sm:text-xl">
            {text}
          </h3>
          {tooltipText ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Why we ask this"
                  >
                    <CircleHelp className="size-5" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-h-48 max-w-xs overflow-y-auto text-left text-xs font-normal sm:max-w-md"
                >
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
        {isSpeaking ? (
          <Button type="button" variant="outline" size="sm" onClick={handleStop} className="shrink-0">
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
            {isGenerating ? "Preparing…" : audioReady ? "Replay question" : "Play question"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ClientResponseBlock({
  response,
  questionNumber,
}: {
  response: IntakeReviewData["interview"]["responses"][0] | undefined;
  questionNumber: number;
}) {
  if (!response) {
    return (
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-sm italic text-muted-foreground">No response recorded for this question.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Client response — Question {questionNumber}
      </p>
      {response.audioUrl && (
        <AudioPlayer
          audioUrl={response.audioUrl}
          duration={response.audioDuration ?? undefined}
          questionLabel={`Q${questionNumber}`}
        />
      )}
      <div className="rounded-lg bg-muted/50 p-4">
        {response.transcriptionStatus === "FAILED" && (
          <Badge variant="secondary" className="mb-2 text-xs">
            Transcription failed
          </Badge>
        )}
        {response.transcription ? (
          <p className="text-sm leading-6 text-foreground/90">{response.transcription}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No transcription available.</p>
        )}
      </div>
    </div>
  );
}
