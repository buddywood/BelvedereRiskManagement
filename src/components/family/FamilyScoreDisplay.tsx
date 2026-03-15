import { Badge } from "@/components/ui/badge";
import { EmphasisIndicator } from "./EmphasisIndicator";
import type { FamilyPillarScore } from "@/lib/family/types";

interface FamilyScoreDisplayProps {
  currentScore: number;
  pillarScores: FamilyPillarScore[];
  advisorEmphasis: string[];
}

export function FamilyScoreDisplay({
  currentScore,
  pillarScores,
  advisorEmphasis,
}: FamilyScoreDisplayProps) {
  // Determine risk level and badge variant
  const getRiskLevel = (score: number) => {
    if (score >= 7.5) return { label: "Low Risk", variant: "success" as const };
    if (score >= 5.0) return { label: "Moderate Risk", variant: "warning" as const };
    return { label: "High Risk", variant: "warning" as const };
  };

  const riskLevel = getRiskLevel(currentScore);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center space-y-3">
        <div>
          <p className="text-5xl font-semibold">{currentScore.toFixed(1)} / 10</p>
          <p className="text-sm text-muted-foreground mt-1">Overall Governance Score</p>
        </div>
        <Badge variant={riskLevel.variant} className="text-sm px-3 py-1">
          {riskLevel.label}
        </Badge>
      </div>

      {/* Governance Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Governance Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillarScores.map((pillar) => (
            <EmphasisIndicator
              key={pillar.pillar}
              pillarName={pillar.pillarName}
              score={pillar.score}
              isEmphasized={advisorEmphasis.includes(pillar.pillar)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}