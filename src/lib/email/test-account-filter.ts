import "server-only";

import { prisma } from "@/lib/db";

/**
 * Email domains that indicate a test account.
 * Emails ending with these suffixes will be filtered from production reminder/nudge emails.
 */
const TEST_EMAIL_SUFFIXES = ["@test.com"] as const;

/**
 * Checks if an email address matches a test account pattern.
 * Currently checks for emails ending in @test.com.
 */
export function isTestEmailPattern(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return TEST_EMAIL_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

/**
 * Checks if a user is marked as a test account in the database.
 * Returns false if the user is not found.
 */
export async function isTestAccountByUserId(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isTestAccount: true },
  });
  return user?.isTestAccount === true;
}

/**
 * Checks if an email should be filtered from reminder/nudge emails.
 *
 * An email is filtered if:
 * 1. It matches a test email pattern (e.g., @test.com), OR
 * 2. The user is marked as isTestAccount: true in the database
 *
 * This filter is intended to prevent sending operational reminder emails
 * to test accounts in production environments.
 *
 * @param email - The recipient email address
 * @param userId - Optional user ID to check the database flag
 * @returns true if the email should be filtered (not sent)
 */
export async function shouldFilterTestAccountEmail(
  email: string,
  userId?: string,
): Promise<boolean> {
  if (isTestEmailPattern(email)) {
    return true;
  }

  if (userId) {
    return await isTestAccountByUserId(userId);
  }

  return false;
}

/**
 * Result type for functions that may skip sending due to test account filtering.
 */
export type TestAccountFilterResult = {
  filtered: true;
  reason: "test_email_pattern" | "test_account_flag";
};

/**
 * Checks if an email should be filtered and returns a structured result.
 * Useful for logging and tracking filtered emails.
 */
export async function checkTestAccountFilter(
  email: string,
  userId?: string,
): Promise<TestAccountFilterResult | null> {
  if (isTestEmailPattern(email)) {
    return { filtered: true, reason: "test_email_pattern" };
  }

  if (userId) {
    const isTestAccount = await isTestAccountByUserId(userId);
    if (isTestAccount) {
      return { filtered: true, reason: "test_account_flag" };
    }
  }

  return null;
}
