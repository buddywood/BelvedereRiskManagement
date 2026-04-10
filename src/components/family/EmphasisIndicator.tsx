import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MATURITY_SCALE_MAX } from "@/lib/assessment/maturity-scale";
import { maturityHeatLevel, maturityScoreToPercent } from "@/lib/assessment/governance-rubric";

interface EmphasisIndicatorProps {
  pillarName: string;
  score: number;
  isEmphasized: boolean;
  className?: string;
}

export function EmphasisIndicator({
  pillarName,
  score,
  isEmphasized,
  className,
}: EmphasisIndicatorProps) {
  const progressValue = maturityScoreToPercent(score);

  const heatColor = (() => {
    const heat = maturityHeatLevel(score);
    if (heat === "strong") return "bg-green-600";
    if (heat === "fair") return "bg-amber-500";
    if (heat === "weak") return "bg-orange-600";
    return "bg-red-600";
  })();

  const progressColor = isEmphasized ? "bg-amber-500" : heatColor;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{pillarName}</h4>
          <p className="text-sm text-muted-foreground">
            {progressValue} / 100 resilience ({score.toFixed(1)} / {MATURITY_SCALE_MAX} maturity)
          </p>
        </div>
        {isEmphasized && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Advisor Focus
          </Badge>
        )}
      </div>

      <Progress
        value={progressValue}
        indicatorClassName={progressColor}
        className={cn(
          "h-2",
          isEmphasized && "border-amber-200 border-2"
        )}
      />

      {isEmphasized && (
        <Alert className="border-amber-200">
          <AlertDescription>
            Your advisor gave this area extra attention in your assessment
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}