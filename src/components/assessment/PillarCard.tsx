'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import type { Pillar, RiskLevel } from "@/lib/assessment/types";

/**
 * Pillar Card Component
 *
 * Displays a pillar section as a card with description, time estimate,
 * status, and progress. Premium professional aesthetic.
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

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{pillar.name}</CardTitle>
          <Badge variant={statusConfig[status].variant}>
            {statusConfig[status].label}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {pillar.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Clock className="h-4 w-4" />
          <span>~{pillar.estimatedMinutes} min</span>
        </div>

        {status === 'in-progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Progress</span>
              <span>
                {questionsAnswered} / {totalQuestions} questions
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}

        {status === 'completed' && score !== undefined && riskLevel && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Score: </span>
              <span className="font-semibold">{score.toFixed(1)}</span>
            </div>
            <Badge variant={riskConfig[riskLevel].variant}>
              {riskConfig[riskLevel].label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
