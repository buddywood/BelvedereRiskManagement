import type { InterviewResponse } from "@/lib/intake/store";

/** True when the user may advance: completed audio and/or a saved typed answer. */
export function isInterviewResponseComplete(
  r: InterviewResponse | undefined
): boolean {
  if (!r || r.status !== "completed") return false;
  if (r.audioUrl) return true;
  return Boolean(r.transcription?.trim());
}
