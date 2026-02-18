import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { resetLimiter } from "@/lib/rate-limit";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Apply rate limiting (3 requests per hour per email)
    const rateLimitResult = resetLimiter(email);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many reset requests. Please try again later.",
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    // If user exists, proceed with reset flow
    if (user) {
      // Delete any existing unexpired tokens for this email
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          expires: { gt: new Date() },
        },
      });

      // Generate reset token (raw token sent to user)
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Hash token before storing (SHA-256)
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Store hashed token with 15-minute expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires: expiresAt,
        },
      });

      // Build reset URL with raw token
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

      // Send email (errors logged but not exposed to client)
      await sendPasswordResetEmail(email, resetUrl);
    }

    // Generic success response (same for existing and non-existing emails)
    return NextResponse.json(
      {
        message:
          "If an account exists with that email, a reset link has been sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
