'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

/**
 * Navigation Buttons Component
 *
 * Back, Next, and Skip controls for assessment flow.
 * Handles validation states and loading indicators.
 */

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
  isValid: boolean;
  isSaving: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack,
  isLastQuestion,
  isValid,
  isSaving,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack}
        className="min-w-[120px]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Saving Indicator */}
      <div className="flex items-center gap-2">
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        className="min-w-[120px]"
      >
        {isLastQuestion ? (
          <>
            Complete Section
            <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
