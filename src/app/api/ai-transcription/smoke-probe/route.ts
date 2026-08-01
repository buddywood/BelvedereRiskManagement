import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdvisorHubNavRole } from "@/lib/auth-roles";
import { runWhisperSmokeProbe } from "@/lib/ai/whisper-smoke-probe";

/**
 * POST /api/ai-transcription/smoke-probe
 *
 * Round-trip Whisper transcription canary: generates a tiny TTS sample, then
 * transcribes it via Whisper. Advisor-gated (same as the narrative smoke probe).
 *
 * Returns 200 with { ok, originalText, transcription, ... } on success, or
 * 500/503 with { error } on failure. 503 is reserved for OPENAI_API_KEY not
 * configured (smoke tests skip rather than fail-hard in that case).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const role = session.user.role;
  const canProbe =
    isAdvisorHubNavRole(role) || role === "ADMIN" || role === "SUPER_ADMIN";
  if (!canProbe) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await runWhisperSmokeProbe();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Probe failed";
    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
