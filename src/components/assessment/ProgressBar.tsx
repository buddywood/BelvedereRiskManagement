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
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="editorial-kicker">Current Section</p>
          <span className="text-lg font-semibold text-foreground">{pillarName}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {answeredCount} of {totalCount} questions
        </span>
      </div>
      <Progress value={percentage} className="h-2.5" />
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
  const pillars = [
    { id: 'family-governance', label: 'Family Governance' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground">
          Assessment Progress
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedPillars.length} of {totalPillars} completed
        </span>
      </div>
      <div className="flex gap-2">
        {pillars.map((pillar) => {
          const isCompleted = completedPillars.includes(pillar.id);
          const isCurrent = currentPillar === pillar.id;

          return (
            <div
              key={pillar.id}
              className={cn(
                "flex-1 h-2.5 rounded-full transition-colors",
                isCompleted && "bg-emerald-500",
                isCurrent && !isCompleted && "bg-brand",
                !isCompleted && !isCurrent && "bg-secondary"
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {pillars.map((pillar, idx) => (
          <span key={pillar.id}>{idx + 1}. {pillar.label}</span>
        ))}
      </div>
    </div>
  );
}
