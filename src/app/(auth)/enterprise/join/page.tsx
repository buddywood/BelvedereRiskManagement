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
  const session = await auth();
  const signedInEmail = session?.user?.email?.trim().toLowerCase() ?? null;
  const signedInAsInvitee =
    Boolean(session?.user?.id) &&
    session?.user?.role === "ADVISOR" &&
    signedInEmail === invite.inviteeEmail;

  // Prefer the signed-in accept step over create-account. Otherwise a successful
  // signup that returns to this same URL keeps rendering the signup form (and
  // can leave the client button stuck on "Creating account…").
  if (signedInAsInvitee) {
    return (
      <EnterpriseTeamJoinConfirmPanel
        token={token}
        enterpriseName={invite.enterpriseName}
        inviteeEmail={invite.inviteeEmail}
      />
    );
  }

  if (session?.user?.id) {
    if (session.user.role !== "ADVISOR") {
      return (
        <InviteAcceptFailure message="Team invitations require a team member account. Sign in with the invited email address." />
      );
    }
    return (
      <EnterpriseTeamJoinWrongAccount
        inviteeEmail={invite.inviteeEmail}
        signedInEmail={signedInEmail ?? "your current account"}
        joinPath={joinPath}
      />
    );
  }

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

  return (
    <EnterpriseTeamInviteSignInForm
      token={token}
      joinPath={joinPath}
      enterpriseName={invite.enterpriseName}
      inviteeEmail={invite.inviteeEmail}
    />
  );
}
