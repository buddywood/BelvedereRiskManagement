"use client";

import {
  BarChart3,
  Check,
  ClipboardList,
  FileText,
  Radar,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getPipelineChevronPhases,
  getPipelineChevronProgress,
  getPipelineChevronStepStatus,
  PIPELINE_CHEVRON_LABELS,
  type PipelineChevronPhase,
} from "@/lib/pipeline/status";
import type { ClientWorkflowStage } from "@prisma/client";

const PHASE_ICONS: Record<PipelineChevronPhase, LucideIcon> = {
  intake: ClipboardList,
  assessment: BarChart3,
  report: FileText,
  monitoring: Radar,
};

const STEP_SURFACE: Record<
  "complete" | "current" | "future",
  string
> = {
  complete:
    "border-emerald-600/80 bg-emerald-500 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600",
  current:
    "border-sky-600/80 bg-sky-500 text-white shadow-sm dark:border-sky-500 dark:bg-sky-600",
  future:
    "border-border/80 bg-muted/40 text-muted-foreground dark:bg-muted/25",
};

function chevronClipClass(index: number, total: number) {
  if (total === 1) return "rounded-md";
  if (index === 0) {
    return "rounded-l-md [clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%)]";
  }
  if (index === total - 1) {
    return "rounded-r-md [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,10px_50%)]";
  }
  return "[clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%,10px_50%)]";
}

interface PipelineChevronTrackProps {
  currentStage: ClientWorkflowStage;
  showDocumentsStage?: boolean;
  monitoringEnabled?: boolean;
  className?: string;
}

export function PipelineChevronTrack({
  currentStage,
  showDocumentsStage = true,
  monitoringEnabled = false,
  className,
}: PipelineChevronTrackProps) {
  const phases = getPipelineChevronPhases(monitoringEnabled);
  const progress = getPipelineChevronProgress(
    currentStage,
    showDocumentsStage,
    monitoringEnabled,
  );
  const activePhase = phases[progress.activeIndex] ?? phases[0]!;

  return (
    <div
      className={cn("flex min-w-0 items-stretch", className)}
      role="img"
      aria-label={`Workflow progress: ${PIPELINE_CHEVRON_LABELS[activePhase]}`}
    >
      {phases.map((phase, index) => {
        const stepStatus = getPipelineChevronStepStatus(index, progress);
        const Icon = PHASE_ICONS[phase];
        const isComplete = stepStatus === "complete";

        return (
          <div
            key={phase}
            className={cn(
              "relative min-w-0 flex-1",
              index > 0 && "-ml-2",
            )}
            style={{ zIndex: phases.length - index }}
          >
            <div
              title={PIPELINE_CHEVRON_LABELS[phase]}
              className={cn(
                "flex h-10 min-w-0 items-center justify-center gap-1.5 border px-2 py-1.5 sm:h-9 sm:gap-1.5 sm:px-3",
                chevronClipClass(index, phases.length),
                STEP_SURFACE[stepStatus],
              )}
            >
              {isComplete ? (
                <Check className="size-4 shrink-0" aria-hidden />
              ) : (
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              )}
              <span className="hidden truncate text-xs font-medium leading-none sm:inline">
                {PIPELINE_CHEVRON_LABELS[phase]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
