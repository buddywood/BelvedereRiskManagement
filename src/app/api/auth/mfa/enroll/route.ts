import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrollMFA } from "@/lib/mfa";

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

    // Enroll user in MFA
    const { qrCodeUrl, secret } = await enrollMFA(session.user.id);

    return NextResponse.json({
      qrCodeUrl,
      secret, // For manual entry in authenticator app
    });
  } catch (error) {
    console.error("MFA enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in MFA" },
      { status: 500 }
    );
  }
}
