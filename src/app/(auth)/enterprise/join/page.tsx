import { EnterpriseTeamJoinConfirmPanel } from "@/components/auth/EnterpriseTeamJoinConfirmPanel";
import { EnterpriseTeamJoinWrongAccount } from "@/components/auth/EnterpriseTeamJoinWrongAccount";
import { EnterpriseTeamInviteSignInForm } from "@/components/auth/EnterpriseTeamInviteSignInForm";
import { EnterpriseTeamInviteSignupForm } from "@/components/auth/EnterpriseTeamInviteSignupForm";
import { InviteAcceptFailure } from "@/components/auth/InviteAcceptFailure";
import { auth } from "@/lib/auth";
import { resolveEnterpriseTeamInvite } from "@/lib/enterprise/team-invite";
import { buildEnterpriseTeamJoinPath } from "@/lib/enterprise/team-invite-token";

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

  const joinPath = buildEnterpriseTeamJoinPath(token);

  // Keep the entire accept flow on /enterprise/join — never bounce invitees
  // through the generic Client/Advisor/Platform SignInHub.
  if (invite.needsRegistration) {
    return (
      <EnterpriseTeamInviteSignupForm
        token={token}
        joinPath={joinPath}
        enterpriseName={invite.enterpriseName}
        inviteeEmail={invite.inviteeEmail}
      />
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <EnterpriseTeamInviteSignInForm
        joinPath={joinPath}
        enterpriseName={invite.enterpriseName}
        inviteeEmail={invite.inviteeEmail}
      />
    );
  }

  if (session.user.role !== "ADVISOR") {
    return (
      <InviteAcceptFailure message="Team invitations require a team member account. Sign in with the invited email address." />
    );
  }

  const signedInEmail = session.user.email?.trim().toLowerCase();
  if (!signedInEmail || signedInEmail !== invite.inviteeEmail) {
    return (
      <EnterpriseTeamJoinWrongAccount
        inviteeEmail={invite.inviteeEmail}
        signedInEmail={signedInEmail ?? "your current account"}
        joinPath={joinPath}
      />
    );
  }

  return (
    <EnterpriseTeamJoinConfirmPanel
      token={token}
      enterpriseName={invite.enterpriseName}
      inviteeEmail={invite.inviteeEmail}
    />
  );
}
