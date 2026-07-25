/**
 * Normalize a stored multi-choice answer to an array of selected values.
 *
 * Defends against stringified JSON arrays (e.g. double-encoded saves or
 * localStorage edge cases) so the checkbox UI can keep multiple selections.
 */
export function coerceMultiChoiceAnswer(
  answer: unknown,
): Array<string | number> {
  if (Array.isArray(answer)) {
    return answer.filter(
      (entry): entry is string | number =>
        typeof entry === "string" || typeof entry === "number",
    );
  }

  if (typeof answer === "string") {
    const trimmed = answer.trim();
    if (!trimmed) return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return coerceMultiChoiceAnswer(parsed);
      }
    } catch {
      // Bare single token.
    }
    return [trimmed];
  }

  if (typeof answer === "number" && Number.isFinite(answer)) {
    return [answer];
  }

  return [];
}
