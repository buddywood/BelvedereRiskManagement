import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { AssessmentReport } from "@/lib/pdf/components/AssessmentReport";

/**
 * PDF Report Generation API Route
 *
 * GET: Generate and download PDF report from assessment data
 */

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  subcategoryCount: number;
}

interface MissingControl {
  category: string;
  subcategory: string;
  description: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * GET /api/reports/[id]/pdf
 * Generate PDF report for completed assessment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. Ownership check
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      select: {
        userId: true,
        startedAt: true,
      },
    });

    // Load response count separately
    const responseCount = await prisma.assessmentResponse.count({
      where: {
        assessmentId: id,
        skipped: false,
      },
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

    // 3. Score check
    const pillarScore = await prisma.pillarScore.findUnique({
      where: {
        assessmentId_pillar: {
          assessmentId: id,
          pillar: "family-governance",
        },
      },
    });

    if (!pillarScore) {
      return NextResponse.json(
        { error: "Complete assessment to generate report" },
        { status: 404 }
      );
    }

    // 4. Load household members for household profile
    const householdMembers = await prisma.householdMember.findMany({
      where: { userId: session.user.id },
      select: {
        fullName: true,
        relationship: true,
        age: true,
        governanceRoles: true,
        isResident: true,
      },
    });

    // 5. Load user email for report header
    const userEmail = session.user.email || "Unknown User";

    // 6. Calculate completion percentage
    const totalResponses = responseCount;
    // Estimate based on typical assessment size - in production would get from visible questions
    const estimatedTotalQuestions = 68; // Based on research findings
    const completionPercentage = Math.min(100, Math.round((totalResponses / estimatedTotalQuestions) * 100));

    // 7. Build household profile object
    const householdProfile = householdMembers.length > 0 ? {
      members: householdMembers.map(m => ({
        fullName: m.fullName,
        relationship: m.relationship,
        age: m.age,
        governanceRoles: m.governanceRoles as string[],
        isResident: m.isResident,
      })),
    } : undefined;

    // 8. Pre-process data into plain objects
    const breakdown = pillarScore.breakdown as unknown as CategoryScore[];
    const missingControls = pillarScore.missingControls as unknown as MissingControl[];

    const assessmentDate = assessment.startedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Map Prisma enum to lowercase for consistency
    const riskLevel = pillarScore.riskLevel.toLowerCase();

    const reportData = {
      score: pillarScore.score,
      riskLevel,
      breakdown: breakdown.map(cat => ({
        name: cat.name,
        score: cat.score,
        maxScore: cat.maxScore,
        subcategoryCount: breakdown.filter(b => b.name === cat.name).length || 1,
      })),
      missingControls: missingControls.map(control => ({
        category: control.category,
        subcategory: control.subcategory || control.category, // fallback if subcategory missing
        description: control.description,
        recommendation: control.recommendation,
        severity: control.severity,
      })),
      assessmentDate,
      completionPercentage,
      categoryCount: breakdown.length,
      missingControlsCount: missingControls.length,
    };

    // 9. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <AssessmentReport data={reportData} householdProfile={householdProfile} />
    );

    // 10. Return PDF with appropriate headers
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="belvedere-governance-report.pdf"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}