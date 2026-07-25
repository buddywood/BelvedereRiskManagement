import { z } from "zod";

/** Max length for advisor-managed external / CRM client IDs. */
export const EXTERNAL_CLIENT_ID_MAX_LENGTH = 64;

export const DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE =
  "That client ID is already used for another client in your portfolio.";

function emptyToNull(val: unknown): unknown {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

/**
 * Optional advisor CRM client ID. Empty / whitespace → null (clears the field).
 * Allows letters, numbers, and common CRM separators.
 */
export const externalClientIdSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(EXTERNAL_CLIENT_ID_MAX_LENGTH, `Client ID must be at most ${EXTERNAL_CLIENT_ID_MAX_LENGTH} characters`)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._\-/# ]*$/,
      "Client ID may use letters, numbers, spaces, and . _ - / #",
    )
    .nullable(),
);

export type ExternalClientId = z.infer<typeof externalClientIdSchema>;

export function parseExternalClientId(raw: unknown): ExternalClientId {
  return externalClientIdSchema.parse(raw);
}
