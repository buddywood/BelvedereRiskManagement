import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

const ttsSchema = z.object({
  questionText: z.string().min(1).max(2000),
  context: z.string().min(1).max(2000),
  recordingTips: z.array(z.string().min(1).max(500)).max(8).default([]),
  questionNumber: z.number().int().positive(),
  totalQuestions: z.number().int().positive(),
});

function buildNarrationText(input: z.infer<typeof ttsSchema>) {
  const parts = [
    `Question ${input.questionNumber} of ${input.totalQuestions}.`,
    input.questionText,
    input.context,
  ];

  if (input.recordingTips.length > 0) {
    parts.push(`Recording tips. ${input.recordingTips.join(". ")}.`);
  }

  return parts.join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = ttsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const narrationText = buildNarrationText(parsed.data);
    const openai = getOpenAIClient();
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: narrationText,
      instructions:
        "Speak in a calm, warm, polished voice with natural pauses. Read clearly and conversationally, like a thoughtful interviewer guiding a client through a confidential intake session.",
      response_format: "mp3",
      speed: 0.95,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Intake TTS error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
