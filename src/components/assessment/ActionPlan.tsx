/**
 * ActionPlan Component
 *
 * Displays prioritized action recommendations with ownership and effort guidance.
 * Derives implementation details from missing control severity and category.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MissingControl } from "@/lib/assessment/types";
import { Target, Clock, Users } from "lucide-react";

interface ActionPlanProps {
  missingControls: MissingControl[];
  pillarName: string;
}

/**
 * Derive effort level from severity
 */
function getEffortLevel(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "Strategic";
  if (severity === "medium") return "Standard";
  return "Quick Win";
}

/**
 * Derive ownership from category
 */
function getOwnership(category: string): string {
  if (category.includes("decision") || category.includes("authority")) {
    return "Family Council";
  }
  if (category.includes("access") || category.includes("distribution")) {
    return "Financial Advisor";
  }
  if (category.includes("trust") || category.includes("legal")) {
    return "Legal Advisor";
  }
  if (category.includes("documentation") || category.includes("record")) {
    return "Family Office";
  }
  if (category.includes("behavior") || category.includes("standards")) {
    return "Family Council";
  }
  if (category.includes("succession") || category.includes("transition")) {
    return "Family Council & Advisors";
  }
  if (category.includes("business")) {
    return "Board of Directors";
  }
  return "Family Office";
}

export function ActionPlan({ missingControls, pillarName }: ActionPlanProps) {
  if (missingControls.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900">
          Recommended Actions
        </h3>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800 font-medium">
              Your governance framework is well-established.
            </p>
            <p className="text-green-700 text-sm mt-2">
              Continue regular reviews and updates to maintain strong governance practices.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityConfig = {
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
      label: "Low Priority",
    },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">
        Recommended Actions
      </h3>
      <p className="text-sm text-zinc-600">
        Prioritized recommendations based on your {pillarName} assessment responses.
      </p>

      <div className="space-y-4">
        {missingControls.map((control, index) => {
          const priority = priorityConfig[control.severity];
          const effort = getEffortLevel(control.severity);
          const ownership = getOwnership(control.category);

          return (
            <Card key={control.questionId} className="border-zinc-200">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-zinc-500" />
                      Action {index + 1}: {control.recommendation}
                    </h4>
                    <Badge variant="outline" className={`${priority.color} text-xs flex-shrink-0`}>
                      {priority.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 pl-6">
                    Addresses: {control.category.split("-").map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(" ")}
                  </p>
                </div>

                <div className="flex items-center gap-6 pl-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-600">
                      <span className="font-medium text-zinc-700">{effort}</span>
                      {effort === "Quick Win" && " (days)"}
                      {effort === "Standard" && " (weeks)"}
                      {effort === "Strategic" && " (months)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-600">
                      <span className="font-medium text-zinc-700">{ownership}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
        <p className="text-xs text-zinc-600">
          These recommendations are based on your assessment responses. Consult with your advisors for implementation guidance.
        </p>
      </div>
    </div>
  );
}
