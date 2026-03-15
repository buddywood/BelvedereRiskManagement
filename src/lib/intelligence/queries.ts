import "server-only";

import { prisma } from "@/lib/db";
import { PILLAR_WEIGHTS } from "@/lib/analytics/queries";
import { CATEGORY_LABELS } from "@/lib/analytics/formatters";
import type { RiskSeverity, RiskIndicator, FamilyRiskSummary, PortfolioIntelligence } from "./types";

/**
 * Determine risk severity based on governance score
 */
export function getSeverity(score: number): RiskSeverity {
  if (score <= 3.0) return 'critical';
  if (score <= 5.0) return 'moderate';
  return 'low';
}

/**
 * Calculate weighted overall score from pillar scores
 */
function calculateWeightedScore(pillarScores: { pillar: string; score: number }[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const pillarScore of pillarScores) {
    const weight = PILLAR_WEIGHTS[pillarScore.pillar as keyof typeof PILLAR_WEIGHTS];
    if (weight) {
      totalScore += pillarScore.score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Get top 3 governance risks for a specific family (INTEL-01)
 */
export async function getTopRisksForFamily(
  clientId: string,
  advisorProfileId: string
): Promise<FamilyRiskSummary | null> {
  // Step a: Verify advisor-client relationship
  const assignment = await prisma.clientAdvisorAssignment.findFirst({
    where: {
      advisorId: advisorProfileId,
      clientId: clientId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        select: {
          id: true,
          email: true,
        }
      }
    }
  });

  if (!assignment) {
    return null;
  }

  // Step b: Get latest completed assessment with scores
  const assessment = await prisma.assessment.findFirst({
    where: {
      userId: clientId,
      status: 'COMPLETED',
    },
    include: {
      scores: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  if (!assessment || !assessment.completedAt) {
    return null;
  }

  // Get total assessment count
  const assessmentCount = await prisma.assessment.count({
    where: {
      userId: clientId,
      status: 'COMPLETED',
    },
  });

  // Step c: Create RiskIndicators for each pillar score
  const riskIndicators: RiskIndicator[] = assessment.scores.map(pillarScore => ({
    familyId: clientId,
    familyName: assignment.client.email,
    categorySlug: pillarScore.pillar,
    categoryName: CATEGORY_LABELS[pillarScore.pillar] || pillarScore.pillar,
    score: pillarScore.score,
    severity: getSeverity(pillarScore.score),
    weight: PILLAR_WEIGHTS[pillarScore.pillar as keyof typeof PILLAR_WEIGHTS] || 0,
    assessmentId: assessment.id,
    assessmentDate: assessment.completedAt!.toISOString(),
  }));

  // Step d & e: Sort by score ascending (lowest first = highest risk) and take top 3
  const topRisks = riskIndicators
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Step f: Calculate weighted overall score
  const overallScore = calculateWeightedScore(assessment.scores);

  // Step g: Return FamilyRiskSummary
  return {
    familyId: clientId,
    familyName: assignment.client.email,
    overallScore,
    topRisks,
    assessmentCount,
    latestAssessmentDate: assessment.completedAt!.toISOString(),
  };
}

/**
 * Get portfolio-wide governance intelligence (INTEL-02, INTEL-03)
 */
export async function getPortfolioIntelligence(
  advisorProfileId: string
): Promise<PortfolioIntelligence> {
  // Get all active client assignments for this advisor
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        select: {
          id: true,
          email: true,
        }
      }
    }
  });

  const familyRiskSummaries: FamilyRiskSummary[] = [];
  const allPortfolioRisks: RiskIndicator[] = [];
  const risksByCategory: Record<string, number> = {};
  let familiesAtRisk = 0;
  let criticalCount = 0;

  // Process each client
  for (const assignment of assignments) {
    // Get latest completed assessment for this client
    const assessment = await prisma.assessment.findFirst({
      where: {
        userId: assignment.clientId,
        status: 'COMPLETED',
      },
      include: {
        scores: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!assessment || !assessment.completedAt) {
      continue;
    }

    // Get assessment count for this client
    const assessmentCount = await prisma.assessment.count({
      where: {
        userId: assignment.clientId,
        status: 'COMPLETED',
      },
    });

    // Create risk indicators for this family (same logic as getTopRisksForFamily)
    const familyRiskIndicators: RiskIndicator[] = assessment.scores.map(pillarScore => ({
      familyId: assignment.clientId,
      familyName: assignment.client.email,
      categorySlug: pillarScore.pillar,
      categoryName: CATEGORY_LABELS[pillarScore.pillar] || pillarScore.pillar,
      score: pillarScore.score,
      severity: getSeverity(pillarScore.score),
      weight: PILLAR_WEIGHTS[pillarScore.pillar as keyof typeof PILLAR_WEIGHTS] || 0,
      assessmentId: assessment.id,
      assessmentDate: assessment.completedAt!.toISOString(),
    }));

    // Get top 3 risks for this family
    const topRisks = familyRiskIndicators
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    // Calculate overall score
    const overallScore = calculateWeightedScore(assessment.scores);

    // Create family risk summary
    const familyRiskSummary: FamilyRiskSummary = {
      familyId: assignment.clientId,
      familyName: assignment.client.email,
      overallScore,
      topRisks,
      assessmentCount,
      latestAssessmentDate: assessment.completedAt!.toISOString(),
    };

    familyRiskSummaries.push(familyRiskSummary);

    // Add all risks to portfolio risks
    allPortfolioRisks.push(...familyRiskIndicators);

    // Check if family is at risk (has critical or moderate risks)
    const hasRisk = familyRiskIndicators.some(risk =>
      risk.severity === 'critical' || risk.severity === 'moderate'
    );
    if (hasRisk) {
      familiesAtRisk++;
    }

    // Count critical risks
    const familyCriticalCount = familyRiskIndicators.filter(risk =>
      risk.severity === 'critical'
    ).length;
    criticalCount += familyCriticalCount;

    // Update risks by category (count families with critical or moderate risk in each category)
    familyRiskIndicators.forEach(risk => {
      if (risk.severity === 'critical' || risk.severity === 'moderate') {
        risksByCategory[risk.categorySlug] = (risksByCategory[risk.categorySlug] || 0) + 1;
      }
    });
  }

  // Sort portfolio risks by severity order (critical=0, moderate=1, low=2) then by score ascending
  const severityOrder = { critical: 0, moderate: 1, low: 2 };
  const portfolioRisks = allPortfolioRisks.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.score - b.score; // Then by score ascending within same severity
  });

  return {
    totalFamilies: assignments.length,
    familiesAtRisk,
    criticalCount,
    familyRiskSummaries,
    portfolioRisks,
    risksByCategory,
  };
}