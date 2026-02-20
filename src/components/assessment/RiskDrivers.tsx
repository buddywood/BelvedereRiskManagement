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
  // Contextual intro based on risk level
  const introText = {
    LOW: "Your assessment indicates strong governance practices overall. Continue monitoring these areas for ongoing excellence:",
    MEDIUM: "Your assessment identified several governance areas that would benefit from attention:",
    HIGH: "Your assessment identified governance areas that may expose your family to significant risk:",
    CRITICAL: "Your assessment identified critical governance gaps that require immediate attention:",
  };

  const severityConfig = {
    high: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "High Priority",
    },
    medium: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "Medium Priority",
    },
    low: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      label: "Monitor",
    },
  };

  if (missingControls.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900">
          Key Risk Drivers
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium">
            No critical governance gaps identified.
          </p>
          <p className="text-green-700 text-sm mt-2">
            Your current governance practices are well-established. Continue regular reviews to maintain this standard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">
        Areas Requiring Attention
      </h3>
      <p className="text-sm text-zinc-600">{introText[riskLevel]}</p>

      <div className="space-y-4">
        {missingControls.map((control, index) => {
          const config = severityConfig[control.severity];

          return (
            <div
              key={control.questionId}
              className="border border-zinc-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-zinc-900 text-sm">
                      {index + 1}. {control.category.split("-").map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </h4>
                    <Badge variant="outline" className={`${config.color} text-xs flex-shrink-0`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">
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
