import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  const progressValue = (score / 10) * 100;

  // Determine color based on score and emphasis
  let progressColor = "";
  if (isEmphasized) {
    progressColor = "bg-amber-500";
  } else if (score >= 7.5) {
    progressColor = "bg-green-500";
  } else if (score >= 5.0) {
    progressColor = "bg-amber-500";
  } else if (score >= 2.5) {
    progressColor = "bg-orange-500";
  } else {
    progressColor = "bg-red-500";
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{pillarName}</h4>
          <p className="text-sm text-muted-foreground">{score.toFixed(1)}/10</p>
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