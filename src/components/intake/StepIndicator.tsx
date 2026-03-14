import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Step Indicator Component
 *
 * Visual progress indicator showing current position and completed steps.
 * Responsive design adapts to mobile with abbreviated version for many steps.
 */

interface StepIndicatorProps {
  currentIndex: number;
  totalSteps: number;
  completedSteps: Set<number> | number[];
  className?: string;
}

export function StepIndicator({
  currentIndex,
  totalSteps,
  completedSteps,
  className
}: StepIndicatorProps) {
  const completedSet = completedSteps instanceof Set
    ? completedSteps
    : new Set(completedSteps);

  // On small screens with many steps, show abbreviated version
  const shouldShowAbbreviated = totalSteps > 8;

  if (shouldShowAbbreviated) {
    return (
      <div className={cn("flex items-center justify-center sm:hidden", className)}>
        <div className="flex items-center gap-2">
          {/* Current step indicator */}
          <div className="flex items-center justify-center size-3 rounded-full border-2 border-primary bg-primary/10 ring-2 ring-primary/20 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {currentIndex + 1} of {totalSteps}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center gap-2 overflow-x-auto max-w-full px-4 sm:flex-nowrap flex-wrap">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = completedSet.has(index);
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex && !isCompleted;

          return (
            <div key={index} className="flex items-center shrink-0">
              {/* Step dot/circle */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all duration-200",
                  {
                    // Completed step
                    "size-6 bg-primary border-primary text-primary-foreground": isCompleted,
                    // Current step
                    "size-8 border-primary bg-primary/10 ring-2 ring-primary/20 animate-pulse": isCurrent,
                    // Future step
                    "size-4 border-muted-foreground/30 bg-muted/20": isFuture,
                  }
                )}
              >
                {isCompleted && <Check className="size-3" />}
                {isCurrent && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>

              {/* Connector line (except for last step) */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 mx-1 transition-colors duration-200",
                    {
                      "bg-primary": isCompleted,
                      "bg-primary/30": isCurrent,
                      "bg-muted-foreground/20": isFuture,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}