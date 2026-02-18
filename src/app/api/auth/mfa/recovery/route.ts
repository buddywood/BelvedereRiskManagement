import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRecoveryCode } from "@/lib/mfa";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Require authenticated session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting: 5 attempts per 5 minutes (same as TOTP)
    const rateLimitKey = `mfa-recovery:${session.user.id}`;
    const rateLimitResult = rateLimit({
      key: rateLimitKey,
      limit: 5,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Recovery code is required" },
        { status: 400 }
      );
    }

    // Verify and consume recovery code
    const isValid = await verifyRecoveryCode(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or already used recovery code" },
        { status: 400 }
      );
    }

    // Mark session as MFA verified (same as TOTP)
    const existingSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expires: { gt: new Date() },
      },
      orderBy: { expires: "desc" },
      take: 1,
    });

    if (existingSessions.length > 0) {
      // Update existing session
      await prisma.session.update({
        where: { id: existingSessions[0].id },
        data: { mfaVerified: true },
      });
    } else {
      // Create new session for MFA tracking (expires in 30 days)
      const sessionToken = crypto.randomBytes(32).toString("hex");
      await prisma.session.create({
        data: {
          sessionToken,
          userId: session.user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          mfaVerified: true,
        },
      });
    }

    // Get remaining recovery code count
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mfaRecoveryCodes: true },
    });

    const remainingCodes = user?.mfaRecoveryCodes
      ? (user.mfaRecoveryCodes as string[]).length
      : 0;

    return NextResponse.json({
      success: true,
      remainingCodes,
    });
  } catch (error) {
    console.error("Recovery code verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify recovery code" },
      { status: 500 }
    );
  }
}
