import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await params;

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID required" },
        { status: 400 }
      );
    }

    // Rate limit: only update if current status is SENT
    // Don't downgrade from REGISTERED back to OPENED
    await prisma.inviteCode.updateMany({
      where: {
        id: invitationId,
        status: "SENT", // Only update if still in SENT status
      },
      data: {
        status: "OPENED",
        statusUpdatedAt: new Date(),
      },
    });

    // Return 200 OK regardless (don't expose invitation details)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Invitation opened tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}