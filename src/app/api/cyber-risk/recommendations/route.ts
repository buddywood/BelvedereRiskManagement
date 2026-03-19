import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generateCyberRecommendations, CyberRecommendation } from "@/lib/cyber-risk/recommendations";
import { ScoreResult, CategoryScore, MissingControl } from "@/lib/assessment/types";

/**
 * Cyber Risk Recommendations API
 *
 * POST: Generate fresh recommendations from assessment data
 * GET: Retrieve cached recommendations if available
 */

/**
 * POST /api/cyber-risk/recommendations
 * Generate AI recommendations from assessment results
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId || typeof assessmentId !== 'string') {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Verify assessment ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Load cyber risk pillar score
    const pillarScore = await prisma.pillarScore.findUnique({
      where: {
        assessmentId_pillar: {
          assessmentId,
          pillar: 'cyber-risk',
        },
      },
    });

    if (!pillarScore) {
      return NextResponse.json(
        { error: "Cyber risk assessment not completed. Complete the assessment to generate recommendations." },
        { status: 400 }
      );
    }

    // Load assessment responses for cyber risk pillar
    const responses = await prisma.assessmentResponse.findMany({
      where: {
        assessmentId,
        skipped: false,
        // Filter for cyber risk questions (assuming questionId starts with 'cyber-')
        questionId: { startsWith: 'cyber-' },
      },
      select: { questionId: true, answer: true },
    });

    // Convert responses to answers record
    const answers: Record<string, unknown> = {};
    responses.forEach((response) => {
      answers[response.questionId] = response.answer;
    });

    // Build ScoreResult from PillarScore data
    const scoreResult: ScoreResult = {
      score: pillarScore.score,
      riskLevel: pillarScore.riskLevel.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
      breakdown: pillarScore.breakdown as unknown as CategoryScore[],
      missingControls: (pillarScore.missingControls as unknown as MissingControl[]) || [],
    };

    // Generate AI recommendations
    const recommendations = await generateCyberRecommendations(scoreResult, answers);

    // Cache recommendations in the missingControls field (extend structure)
    const updatedMissingControls = {
      controls: scoreResult.missingControls,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    await prisma.pillarScore.update({
      where: {
        assessmentId_pillar: {
          assessmentId,
          pillar: 'cyber-risk',
        },
      },
      data: {
        missingControls: updatedMissingControls as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      recommendations,
    });
  } catch (error) {
    console.error("Error generating cyber risk recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cyber-risk/recommendations
 * Retrieve cached recommendations if available
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Verify assessment ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Load pillar score with cached recommendations
    const pillarScore = await prisma.pillarScore.findUnique({
      where: {
        assessmentId_pillar: {
          assessmentId,
          pillar: 'cyber-risk',
        },
      },
    });

    if (!pillarScore) {
      return NextResponse.json(
        { error: "Cyber risk assessment not completed" },
        { status: 404 }
      );
    }

    // Extract cached recommendations if available
    const missingControlsData = pillarScore.missingControls as any;

    if (missingControlsData && Array.isArray(missingControlsData.recommendations)) {
      return NextResponse.json({
        recommendations: missingControlsData.recommendations,
        generatedAt: missingControlsData.generatedAt,
        cached: true,
      });
    }

    // No cached recommendations available
    return NextResponse.json(
      { error: "No recommendations available. Generate recommendations first." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error retrieving cyber risk recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}