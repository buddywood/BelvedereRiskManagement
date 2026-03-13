/**
 * RiskDrivers Component
 *
 * Displays ranked list of key risk drivers from missing controls.
 * Provides concise explanations of governance gaps with severity indicators.
 */

import { Badge } from "@/components/ui/badge";
import { MissingControl } from "@/lib/assessment/types";
import { AlertCircle } from "lucide-react";

interface RiskDriversProps {
  missingControls: MissingControl[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export function RiskDrivers({ missingControls, riskLevel }: RiskDriversProps) {
  const introText = {
    LOW: "Your assessment indicates strong governance practices overall. Continue monitoring these areas for ongoing excellence:",
    MEDIUM: "Your assessment identified several governance areas that would benefit from attention:",
    HIGH: "Your assessment identified governance areas that may expose your family to significant risk:",
    CRITICAL: "Your assessment identified critical governance gaps that require immediate attention:",
  };

  const severityConfig = {
    high: {
      badge: "outline" as const,
      label: "High Priority",
    },
    medium: {
      badge: "warning" as const,
      label: "Medium Priority",
    },
    low: {
      badge: "secondary" as const,
      label: "Monitor",
    },
  };

  if (missingControls.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">
          Key Risk Drivers
        </h3>
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">
            No critical governance gaps identified.
          </p>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
            Your current governance practices are well-established. Continue regular reviews to maintain this standard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-foreground">
        Areas Requiring Attention
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{introText[riskLevel]}</p>

      <div className="space-y-4">
        {missingControls.map((control, index) => {
          const config = severityConfig[control.severity];

          return (
            <div
              key={control.questionId}
              className="rounded-[1.5rem] border section-divider bg-background/60 p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {index + 1}. {control.category.split("-").map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </h4>
                    <Badge variant={config.badge} className="text-xs flex-shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-6">
                    {control.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
