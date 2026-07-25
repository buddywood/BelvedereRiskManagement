'use client';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Clock } from "lucide-react";
import type { Pillar, RiskLevel } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

/**
 * Pillar Card Component
 *
 * Displays a pillar section as a card with description, time estimate,
 * status, and progress. Equal-height grid cards keep CTAs aligned.
 */

interface PillarCardProps {
  pillar: Pillar;
  status: 'not-started' | 'in-progress' | 'completed';
  questionsAnswered: number;
  totalQuestions: number;
  score?: number;
  riskLevel?: RiskLevel;
  onClick: () => void;
}

/** Rough pace used to estimate how long a domain takes, based on its question count. */
const SECONDS_PER_QUESTION = 40;

function estimatedMinutesForDomain(totalQuestions: number, fallbackMinutes: number): number {
  if (totalQuestions <= 0) return fallbackMinutes;
  return Math.max(1, Math.round((totalQuestions * SECONDS_PER_QUESTION) / 60));
}

export function PillarCard({
  pillar,
  status,
  questionsAnswered,
  totalQuestions,
  score,
  riskLevel,
  onClick,
}: PillarCardProps) {
  const statusConfig = {
    'not-started': {
      label: 'Not Started',
      variant: 'secondary' as const,
    },
    'in-progress': {
      label: 'In Progress',
      variant: 'info' as const,
    },
    completed: {
      label: 'Completed',
      variant: 'success' as const,
    },
  };

  const riskConfig = {
    low: { label: 'Low Risk', variant: 'success' as const },
    medium: { label: 'Medium Risk', variant: 'warning' as const },
    high: { label: 'High Risk', variant: 'warning' as const },
    critical: { label: 'Critical Risk', variant: 'default' as const },
  };

  const progressPercentage = totalQuestions > 0
    ? (questionsAnswered / totalQuestions) * 100
    : 0;

  const estimatedMinutes = estimatedMinutesForDomain(
    totalQuestions,
    pillar.estimatedMinutes,
  );

  const ctaLabel =
    status === "completed"
      ? "Review answers"
      : status === "in-progress"
        ? "Continue from your last saved response"
        : "Begin the assessment";

  return (
    <Card
      data-testid={`pillar-card-${pillar.slug}`}
      className={cn(
        "h-full cursor-pointer gap-0 transition-[transform,border-color,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="gap-3 pb-4">
        <CardTitle className="min-w-0 text-xl leading-snug sm:text-2xl">
          {pillar.name}
        </CardTitle>
        <CardAction>
          <Badge
            variant={statusConfig[status].variant}
            className="shrink-0 whitespace-nowrap"
          >
            {statusConfig[status].label}
          </Badge>
        </CardAction>
        <CardDescription className="line-clamp-3 text-sm leading-6">
          {pillar.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            ~{estimatedMinutes} min
            {totalQuestions > 0
              ? ` · ${totalQuestions} question${totalQuestions === 1 ? "" : "s"}`
              : ""}
          </span>
        </div>

        {/* Reserve progress slot so in-progress and not-started cards stay aligned */}
        <div className="min-h-[3.25rem]">
          {status === "in-progress" ? (
            <div className="space-y-2">
              <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="tabular-nums">
                  {questionsAnswered} / {totalQuestions} questions
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          ) : null}

          {status === "completed" && score !== undefined && riskLevel ? (
            <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Score: </span>
                <span className="font-semibold tabular-nums">{score.toFixed(1)}</span>
              </div>
              <Badge
                variant={riskConfig[riskLevel].variant}
                className="shrink-0 whitespace-nowrap"
              >
                {riskConfig[riskLevel].label}
              </Badge>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-between gap-3 border-t border-border/50 pt-4 text-sm font-medium text-foreground/80">
        <span className="min-w-0 leading-snug">{ctaLabel}</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </CardFooter>
    </Card>
  );
}
