import { Badge } from "@/components/ui/badge";
import { EmphasisIndicator } from "./EmphasisIndicator";
import type { FamilyPillarScore } from "@/lib/family/types";
import { getRiskLevel } from "@/lib/assessment/scoring";
import { MATURITY_SCALE_MAX } from "@/lib/assessment/maturity-scale";
import {
  governanceTierCopyForRiskLevel,
  maturityScoreToPercent,
} from "@/lib/assessment/governance-rubric";

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
  const rl = getRiskLevel(currentScore);
  const tier = governanceTierCopyForRiskLevel(rl);
  const resiliencePercent = maturityScoreToPercent(currentScore);
  const riskLevel =
    rl === "low"
      ? { variant: "success" as const }
      : rl === "medium"
        ? { variant: "warning" as const }
        : rl === "high"
          ? { variant: "warning" as const }
          : { variant: "outline" as const };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center space-y-3">
        <div>
          <p className="text-5xl font-semibold">
            {resiliencePercent}
            <span className="text-2xl text-muted-foreground font-normal"> / 100</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Governance resilience · maturity {currentScore.toFixed(1)} / {MATURITY_SCALE_MAX}
          </p>
        </div>
        <div className="space-y-1">
          <Badge variant={riskLevel.variant} className="text-sm px-3 py-1">
            {tier.title}
          </Badge>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {tier.description}
          </p>
        </div>
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