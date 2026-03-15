"use server";

import { validateInviteCode, createInviteToken } from "@/lib/invite";

export async function submitInviteCode(
  code: string
): Promise<{ redirectUrl?: string; error?: string }> {
  const result = await validateInviteCode(code);
  if ("error" in result) return { error: result.error };
  const token = createInviteToken(result.id);
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const params = new URLSearchParams({ invite: token, callbackUrl: "/intake" });
  return { redirectUrl: `${base}/signup?${params.toString()}` };
}
