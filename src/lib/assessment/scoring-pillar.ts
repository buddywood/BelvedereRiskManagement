/** Cyber module is merged into the comprehensive assessment (same pillar slug as governance hub). */
function normalizeScoringPillar(pillar: string): string {
  if (pillar === "cyber-risk") return "family-governance";
  return pillar;
}

/**
 * Resolve which pillar to score when the client might not know (e.g. stale zustand).
 * Prefer the in-memory store, then the assessment row updated on each save.
 */
export async function resolveScoringPillar(
  assessmentId: string,
  storePillar: string | null | undefined
): Promise<string> {
  if (storePillar) {
    return normalizeScoringPillar(storePillar);
  }

  const res = await fetch(`/api/assessment/${assessmentId}`);
  if (!res.ok) {
    return "family-governance";
  }

  const data = (await res.json()) as { currentPillar?: string | null };
  if (typeof data.currentPillar === "string" && data.currentPillar.length > 0) {
    return normalizeScoringPillar(data.currentPillar);
  }

  return "family-governance";
}
