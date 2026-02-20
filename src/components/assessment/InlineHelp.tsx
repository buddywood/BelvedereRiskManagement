'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline Help Component
 *
 * Provides contextual help for questions:
 * - Short inline context (always visible)
 * - Optional "Learn More" expandable section
 * - Subtle tooltips for defined terms (future enhancement)
 */

interface InlineHelpProps {
  helpText?: string;
  learnMore?: string;
}

export function InlineHelp({ helpText, learnMore }: InlineHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!helpText && !learnMore) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Always-visible help text */}
      {helpText && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {helpText}
        </p>
      )}

      {/* Expandable "Learn More" section */}
      {learnMore && (
        <div className="border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-0 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-normal"
          >
            <span className="flex items-center gap-1">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isExpanded ? 'Show less' : 'Learn more'}
              </span>
            </span>
          </Button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-in-out",
              isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
            )}
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {learnMore}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
