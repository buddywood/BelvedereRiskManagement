import "server-only";

import crypto from "crypto";
import type { PasswordPolicy } from "@/lib/auth/password-policy";
import { DEFAULT_PASSWORD_POLICY, validatePasswordComplexity } from "@/lib/auth/password-policy";

const UPPERCASE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghjkmnpqrstuvwxyz";
const NUMBER_CHARS = "23456789";
const SPECIAL_CHARS = "!@#$%&*";

/**
 * Generate a cryptographically secure temporary password that meets
 * the provided password policy requirements.
 *
 * The generated password will always include:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Special characters if required by policy
 *
 * Characters that can be confused (0/O, 1/l/I) are excluded.
 */
export function generateTempPassword(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string {
  const length = Math.max(policy.minLength, 12);

  const required: string[] = [];
  required.push(randomChar(UPPERCASE_CHARS));
  required.push(randomChar(LOWERCASE_CHARS));
  required.push(randomChar(NUMBER_CHARS));

  if (policy.requireSpecialCharacter) {
    required.push(randomChar(SPECIAL_CHARS));
  }

  let charset = UPPERCASE_CHARS + LOWERCASE_CHARS + NUMBER_CHARS;
  if (policy.requireSpecialCharacter) {
    charset += SPECIAL_CHARS;
  }

  const remaining = length - required.length;
  const randomPart: string[] = [];
  for (let i = 0; i < remaining; i++) {
    randomPart.push(randomChar(charset));
  }

  const allChars = [...required, ...randomPart];
  shuffleArray(allChars);

  const password = allChars.join("");

  const validation = validatePasswordComplexity(password, policy);
  if (!validation.ok) {
    return generateTempPassword(policy);
  }

  return password;
}

function randomChar(charset: string): string {
  const randomIndex = crypto.randomInt(0, charset.length);
  return charset[randomIndex];
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}
