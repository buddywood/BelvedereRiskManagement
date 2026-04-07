import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadGovernanceQuestionWires } from "@/lib/assessment/bank/load-bank";

/**
 * GET /api/assessment/governance-questions
 * Visible family-governance questions from the database (for client assessment UI).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const questions = await loadGovernanceQuestionWires({ onlyVisible: true });
    return NextResponse.json({ questions });
  } catch (e) {
    console.error("governance-questions GET", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
