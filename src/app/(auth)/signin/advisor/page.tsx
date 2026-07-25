import { SignInHub } from "@/components/auth/SignInHub";
import { redirectIfEnterpriseTeamJoinNeedsRegistration } from "@/lib/enterprise/team-invite";

export default async function AdvisorSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  await redirectIfEnterpriseTeamJoinNeedsRegistration(sp.callbackUrl);

  return <SignInHub defaultRole="advisor" />;
}
