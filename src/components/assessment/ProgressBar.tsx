'use client';

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Progress Indicators
 *
 * Section and overall progress tracking for assessment flow.
 * Shows pillar-based progress, not question counts (per research anti-pattern).
 */

interface SectionProgressProps {
  answeredCount: number;
  totalCount: number;
  pillarName: string;
}

export function SectionProgress({
  answeredCount,
  totalCount,
  pillarName,
}: SectionProgressProps) {
  const percentage = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">{pillarName}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {answeredCount} of {totalCount} questions
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

interface OverallProgressProps {
  completedPillars: string[];
  totalPillars: number;
  currentPillar?: string;
}

export function OverallProgress({
  completedPillars,
  totalPillars,
  currentPillar,
}: OverallProgressProps) {
  const pillars = ['Family Governance']; // MVP: single pillar with sub-categories

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Assessment Progress
        </h3>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {completedPillars.length} of {totalPillars} completed
        </span>
      </div>
      <div className="flex gap-2">
        {pillars.map((pillar) => {
          const isCompleted = completedPillars.includes(pillar);
          const isCurrent = currentPillar === pillar;

          return (
            <div
              key={pillar}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                isCompleted && "bg-green-500",
                isCurrent && !isCompleted && "bg-blue-500",
                !isCompleted && !isCurrent && "bg-zinc-200 dark:bg-zinc-700"
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        {pillars.map((pillar, idx) => (
          <span key={pillar}>{idx + 1}. {pillar}</span>
        ))}
      </div>
    </div>
  );
}
