import { redirect } from "next/navigation";

import { InviteAcceptFailure } from "@/components/auth/InviteAcceptFailure";
import { resolveEnterpriseTeamInvite } from "@/lib/enterprise/team-invite";

/**
 * Enterprise team join page - legacy redirect handler.
 * 
 * Advisors now receive temp passwords via email and sign in directly at /signin.
 * The enterprise invite is auto-accepted on successful sign-in.
 * 
 * This page exists only to handle old bookmark/links - it validates the invite
 * is still pending and redirects to signin.
 */
export default async function EnterpriseJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim() ?? "";
  const invite = await resolveEnterpriseTeamInvite(token);

  if (!invite.ok) {
    return <InviteAcceptFailure message={invite.error} />;
  }

  // All advisors now have temp passwords - redirect to signin.
  // The enterprise invite will be auto-accepted on successful sign-in.
  const params = new URLSearchParams({
    callbackUrl: "/advisor",
  });
  redirect(`/signin?${params.toString()}`);
}
