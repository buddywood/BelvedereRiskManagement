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
      {helpText && (
        <p className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {helpText}
        </p>
      )}

      {learnMore && (
        <div className="rounded-[1.25rem] border section-divider bg-card/50 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-0 text-foreground hover:text-foreground font-medium"
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
            <p className="text-sm text-muted-foreground leading-6">
              {learnMore}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
