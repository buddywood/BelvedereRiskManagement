import { NextRequest } from "next/server";
import { handleQuestionTtsRequest } from "@/lib/tts/question-speech";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleQuestionTtsRequest(request, "assessment");
}
