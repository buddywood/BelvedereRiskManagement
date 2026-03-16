"use client";

import { cn } from "@/lib/utils";
import { getStageOrder } from "@/lib/pipeline/status";
import type { ClientWorkflowStage } from "@prisma/client";

interface StageIndicatorProps {
  currentStage: ClientWorkflowStage;
  className?: string;
}

const stages: { stage: ClientWorkflowStage; label: string }[] = [
  { stage: 'INVITED', label: 'Inv' },
  { stage: 'REGISTERED', label: 'Reg' },
  { stage: 'INTAKE_IN_PROGRESS', label: 'Intake' },
  { stage: 'ASSESSMENT_IN_PROGRESS', label: 'Assess' },
  { stage: 'DOCUMENTS_REQUIRED', label: 'Docs' },
  { stage: 'COMPLETE', label: 'Done' },
];

export function StageIndicator({ currentStage, className }: StageIndicatorProps) {
  const currentOrder = getStageOrder(currentStage);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map((stage, index) => {
        const stageOrder = getStageOrder(stage.stage);
        const isCompleted = stageOrder < currentOrder;
        const isCurrent = stageOrder === currentOrder;
        const isFuture = stageOrder > currentOrder;

        return (
          <div key={stage.stage} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full flex items-center justify-center text-[0.5rem] font-medium transition-colors",
                  {
                    // Completed steps: filled primary color
                    "bg-primary text-primary-foreground": isCompleted,
                    // Current step: filled with ring/pulse effect
                    "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1": isCurrent,
                    // Future steps: muted/outlined
                    "bg-muted border-2 border-muted-foreground/20 text-muted-foreground": isFuture,
                  }
                )}
              >
                {isCompleted ? "✓" : ""}
              </div>
              <span className="text-[0.55rem] text-muted-foreground mt-0.5">
                {stage.label}
              </span>
            </div>

            {/* Connection line */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "w-3 h-px mx-0.5 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}