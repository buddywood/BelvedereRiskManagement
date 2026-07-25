import "server-only";

import type { EnterpriseRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { findUserByEmail, userEmailWriteData } from "@/lib/auth/user-email";
import { decryptUserEmail } from "@/lib/auth/user-email-crypto";
import { enterpriseTeamJoinTokenFromCallback } from "@/lib/auth/sign-in-routes";
import { prisma } from "@/lib/db";
import { cancelSoloSubscriptionForEnterprise } from "@/lib/enterprise/cancel-solo-subscription";
import { cancelStripeSubscriptionBestEffort } from "@/lib/billing/cancel-stripe-subscription";
import { transferAdvisorAssetsToEnterprise } from "@/lib/enterprise/transfer-advisor-assets";
import { syncEnterpriseRulesToMembers } from "@/lib/methodology/clone-enterprise-defaults";
import { syncEnterpriseMethodologyToMembers } from "@/lib/methodology/clone-enterprise-methodology";
import { provisionEnterpriseTeamMemberContent } from "@/lib/enterprise/provision-team-member-content";
import { getEnterpriseSeatUsage } from "@/lib/enterprise/seat-reporting";
import {
  buildEnterpriseTeamInviteUrl,
  buildEnterpriseTeamJoinPath,
  createEnterpriseTeamInviteToken,
  verifyEnterpriseTeamInviteToken,
} from "@/lib/enterprise/team-invite-token";
import { requireEnterpriseTeamManager, resolveEnterpriseTeamContext } from "@/lib/enterprise/team-access";
import { resolvePublicAppUrl } from "@/lib/public-app-url";

export class EnterpriseTeamInviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnterpriseTeamInviteError";
  }
}

export type EnterpriseInviteRole = Extract<EnterpriseRole, "ADMIN" | "ADVISOR">;

export type InviteEnterpriseMemberInput = {
  email: string;
  /** Defaults to ADVISOR when omitted (solo-style team invites). */
  role?: EnterpriseInviteRole;
};

export function enterpriseTeamInviteRoleLabel(role: EnterpriseInviteRole): string {
  return role === "ADMIN" ? "a firm administrator" : "a team member";
}

export type EnterpriseTeamMemberView = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: EnterpriseRole;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  invitedAt: string | null;
  acceptedAt: string | null;
};

export async function listEnterpriseTeamMembers(
  enterpriseId: string
): Promise<EnterpriseTeamMemberView[]> {
  const rows = await prisma.enterpriseMembership.findMany({
    where: { enterpriseId },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      userId: true,
      role: true,
      status: true,
      invitedAt: true,
      acceptedAt: true,
      user: {
        select: {
          name: true,
          emailCiphertext: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    email: decryptUserEmail(row.user.emailCiphertext),
    name: row.user.name,
    role: row.role,
    status: row.status,
    invitedAt: row.invitedAt?.toISOString() ?? null,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
  }));
}

async function resolveInviteOrigin(): Promise<string> {
  const origin = (await resolvePublicAppUrl()).replace(/\/$/, "");
  let hostname = "";
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    throw new EnterpriseTeamInviteError(
      "Public app URL is not configured. Set AUTH_URL or NEXT_PUBLIC_URL."
    );
  }

  const isLocal =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const onVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
  if (isLocal && (process.env.NODE_ENV === "production" || onVercel)) {
    throw new EnterpriseTeamInviteError(
      "Public app URL resolves to localhost. Set AUTH_URL or NEXT_PUBLIC_URL to the staging/production host before sending team invitations."
    );
  }

  return origin;
}

export async function inviteEnterpriseMember(
  inviterUserId: string,
  input: InviteEnterpriseMemberInput
): Promise<{
  membershipId: string;
  status: "INVITED";
  inviteUrl: string;
  role: EnterpriseInviteRole;
}> {
  const team = await requireEnterpriseTeamManager(inviterUserId);
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new EnterpriseTeamInviteError("Email is required");
  }

  const inviteRole: EnterpriseInviteRole = input.role ?? "ADVISOR";
  if (inviteRole !== "ADMIN" && inviteRole !== "ADVISOR") {
    throw new EnterpriseTeamInviteError("Invite role must be Admin or Team member.");
  }

  const existingByEmail = await findUserByEmail(normalizedEmail, {
    select: {
      id: true,
      role: true,
      deletedAt: true,
      enterpriseMembership: { select: { id: true, enterpriseId: true, status: true } },
      advisorProfile: { select: { id: true, enterpriseId: true } },
    },
  });

  if (existingByEmail?.deletedAt) {
    throw new EnterpriseTeamInviteError("That email belongs to a deactivated account.");
  }

  if (existingByEmail?.enterpriseMembership) {
    if (existingByEmail.enterpriseMembership.enterpriseId === team.enterpriseId) {
      throw new EnterpriseTeamInviteError("This person is already on your team.");
    }
    throw new EnterpriseTeamInviteError("This email is already linked to another firm.");
  }

  if (existingByEmail && existingByEmail.role !== "ADVISOR") {
    throw new EnterpriseTeamInviteError("This email cannot be invited as a team member.");
  }

  const inviteeUser =
    existingByEmail ??
    (await prisma.user.create({
      data: {
        ...userEmailWriteData(normalizedEmail),
        role: "ADVISOR",
        password: null,
        emailVerified: null,
      },
      select: { id: true },
    }));

  const membership = await prisma.enterpriseMembership.create({
    data: {
      enterpriseId: team.enterpriseId,
      userId: inviteeUser.id,
      advisorProfileId: existingByEmail?.advisorProfile?.id ?? null,
      role: inviteRole,
      status: "INVITED",
      invitedEmail: normalizedEmail,
      invitedAt: new Date(),
    },
  });

  const token = createEnterpriseTeamInviteToken(membership.id);
  const inviteUrl = buildEnterpriseTeamInviteUrl(await resolveInviteOrigin(), token);

  return {
    membershipId: membership.id,
    status: "INVITED",
    inviteUrl,
    role: inviteRole,
  };
}

export type ResolvedEnterpriseTeamInvite =
  | {
      ok: true;
      membershipId: string;
      enterpriseName: string;
      inviteeEmail: string;
      needsRegistration: boolean;
    }
  | { ok: false; error: string };

export async function resolveEnterpriseTeamInvite(
  token: string
): Promise<ResolvedEnterpriseTeamInvite> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "This team invitation link is missing a token." };
  }

  const membershipId = verifyEnterpriseTeamInviteToken(trimmed);
  if (!membershipId) {
    return { ok: false, error: "This team invitation link is invalid or has expired." };
  }

  const membership = await prisma.enterpriseMembership.findUnique({
    where: { id: membershipId },
    select: {
      status: true,
      invitedEmail: true,
      invitedAt: true,
      createdAt: true,
      user: {
        select: {
          password: true,
          emailVerified: true,
          emailCiphertext: true,
          createdAt: true,
        },
      },
      enterprise: { select: { name: true } },
    },
  });

  if (!membership || membership.status !== "INVITED") {
    return { ok: false, error: "This team invitation is no longer valid." };
  }

  const inviteeEmail =
    membership.invitedEmail?.trim().toLowerCase() ??
    decryptUserEmail(membership.user.emailCiphertext);

  const hasPassword = Boolean(membership.user.password?.trim());
  const needsRegistration = inviteeNeedsRegistration({
    hasPassword,
    emailVerified: membership.user.emailVerified,
    userCreatedAt: membership.user.createdAt,
    invitedAt: membership.invitedAt ?? membership.createdAt,
  });

  return {
    ok: true,
    membershipId,
    enterpriseName: membership.enterprise.name,
    inviteeEmail,
    needsRegistration,
  };
}

/**
 * Users created by the invite row itself (not a pre-existing advisor account).
 * Allow 1 minute of clock skew between user insert and membership insert.
 */
export function isInviteProvisionedUser(
  userCreatedAt: Date,
  invitedAt: Date
): boolean {
  return userCreatedAt.getTime() >= invitedAt.getTime() - 60_000;
}

/**
 * Create-account for passwordless/unverified invitees, and for invite-provisioned
 * stubs that still have not accepted (even if a prior attempt set a password).
 * Pre-existing verified advisors sign in instead.
 */
export function inviteeNeedsRegistration(input: {
  hasPassword: boolean;
  emailVerified: Date | null;
  userCreatedAt: Date;
  invitedAt: Date;
}): boolean {
  if (!input.hasPassword || !input.emailVerified) return true;
  return isInviteProvisionedUser(input.userCreatedAt, input.invitedAt);
}

/**
 * Passwordless team invitees must not sit on the credentials sign-in hub.
 * When a sign-in URL carries an `/enterprise/join` callback for an invite that
 * still needs registration, send them back to the join page (signup form).
 */
export async function redirectIfEnterpriseTeamJoinNeedsRegistration(
  callbackUrl: string | null | undefined
): Promise<void> {
  const token = enterpriseTeamJoinTokenFromCallback(callbackUrl);
  if (!token) return;

  const invite = await resolveEnterpriseTeamInvite(token);
  if (invite.ok && invite.needsRegistration) {
    redirect(buildEnterpriseTeamJoinPath(token));
  }
}

function assertCanManageEnterpriseMember(
  actorRole: EnterpriseRole,
  memberRole: EnterpriseRole,
  action: "manage" | "change role" = "manage"
): void {
  if (memberRole === "OWNER") {
    throw new EnterpriseTeamInviteError(
      action === "change role"
        ? "The firm owner role cannot be changed here."
        : "The firm owner cannot be suspended."
    );
  }
  // Admins may manage team members, but not peer admins (or the owner).
  if (actorRole !== "OWNER" && memberRole !== "ADVISOR") {
    throw new EnterpriseTeamInviteError(
      action === "change role"
        ? "Only the firm owner can change an administrator's role."
        : "Only the firm owner can manage administrators."
    );
  }
}

async function requirePendingInviteMembership(
  actorUserId: string,
  membershipId: string
): Promise<{
  enterpriseId: string;
  enterpriseName: string;
  membershipId: string;
  inviteeEmail: string;
  role: EnterpriseInviteRole;
}> {
  const team = await requireEnterpriseTeamManager(actorUserId);
  const membership = await prisma.enterpriseMembership.findFirst({
    where: { id: membershipId, enterpriseId: team.enterpriseId },
    select: {
      id: true,
      status: true,
      role: true,
      invitedEmail: true,
      user: { select: { emailCiphertext: true } },
      enterprise: { select: { name: true } },
    },
  });

  if (!membership) {
    throw new EnterpriseTeamInviteError("Team member not found.");
  }
  if (membership.status !== "INVITED") {
    throw new EnterpriseTeamInviteError("Only pending invitations can be resent or removed.");
  }
  if (membership.role === "OWNER") {
    throw new EnterpriseTeamInviteError("The firm owner cannot be removed.");
  }
  assertCanManageEnterpriseMember(team.role, membership.role, "manage");

  const inviteeEmail =
    membership.invitedEmail?.trim().toLowerCase() ??
    decryptUserEmail(membership.user.emailCiphertext);

  return {
    enterpriseId: team.enterpriseId,
    enterpriseName: membership.enterprise.name,
    membershipId: membership.id,
    inviteeEmail,
    role: membership.role,
  };
}

export async function resendEnterpriseTeamInvite(
  actorUserId: string,
  membershipId: string
): Promise<{ inviteUrl: string; inviteeEmail: string; role: EnterpriseInviteRole }> {
  const pending = await requirePendingInviteMembership(actorUserId, membershipId);

  await prisma.enterpriseMembership.update({
    where: { id: pending.membershipId },
    data: { invitedAt: new Date() },
  });

  const token = createEnterpriseTeamInviteToken(pending.membershipId);
  const inviteUrl = buildEnterpriseTeamInviteUrl(await resolveInviteOrigin(), token);

  return {
    inviteUrl,
    inviteeEmail: pending.inviteeEmail,
    role: pending.role,
  };
}

export async function revokeEnterpriseTeamInvite(
  actorUserId: string,
  membershipId: string
): Promise<void> {
  const pending = await requirePendingInviteMembership(actorUserId, membershipId);
  await prisma.enterpriseMembership.delete({ where: { id: pending.membershipId } });
}

export async function acceptEnterpriseTeamInvite(
  membershipId: string,
  acceptingUserId: string
): Promise<{ enterpriseId: string; enterpriseName: string }> {
  const membership = await prisma.enterpriseMembership.findUnique({
    where: { id: membershipId },
    include: {
      enterprise: { select: { id: true, name: true } },
      user: { select: { id: true, emailCiphertext: true } },
    },
  });

  if (!membership || membership.status !== "INVITED") {
    throw new EnterpriseTeamInviteError("This team invitation is no longer valid.");
  }

  if (membership.userId !== acceptingUserId) {
    throw new EnterpriseTeamInviteError(
      "Sign in with the email address that received this invitation."
    );
  }

  let soloStripeSubscriptionId: string | null = null;
  let acceptedAdvisorProfileId: string | null = null;

  await prisma.$transaction(async (tx) => {
    const soloCancel = await cancelSoloSubscriptionForEnterprise(
      acceptingUserId,
      {
        reason: "enterprise_team_join",
        enterpriseId: membership.enterpriseId,
      },
      tx
    );
    soloStripeSubscriptionId = soloCancel.stripeSubscriptionId;

    let profile = await tx.advisorProfile.findUnique({
      where: { userId: acceptingUserId },
      select: { id: true, enterpriseId: true },
    });

    if (!profile) {
      profile = await tx.advisorProfile.create({
        data: {
          userId: acceptingUserId,
          enterpriseId: membership.enterpriseId,
          firmName: membership.enterprise.name,
        },
        select: { id: true, enterpriseId: true },
      });
    } else if (profile.enterpriseId && profile.enterpriseId !== membership.enterpriseId) {
      throw new EnterpriseTeamInviteError("Your advisor profile is already linked to another firm.");
    } else {
      await tx.advisorProfile.update({
        where: { id: profile.id },
        data: { enterpriseId: membership.enterpriseId },
      });
    }

    await tx.enterpriseMembership.update({
      where: { id: membershipId },
      data: {
        status: "ACTIVE",
        advisorProfileId: profile.id,
        acceptedAt: new Date(),
      },
    });

    acceptedAdvisorProfileId = profile.id;

    if (membership.role === "ADMIN") {
      await transferAdvisorAssetsToEnterprise(
        tx,
        profile.id,
        membership.enterpriseId,
      );
    }
  });

  await cancelStripeSubscriptionBestEffort(soloStripeSubscriptionId);

  if (acceptedAdvisorProfileId) {
    await provisionEnterpriseTeamMemberContent(
      membership.enterpriseId,
      acceptedAdvisorProfileId,
    );
  } else {
    await syncEnterpriseRulesToMembers(membership.enterpriseId);
    await syncEnterpriseMethodologyToMembers(membership.enterpriseId);
  }

  return {
    enterpriseId: membership.enterprise.id,
    enterpriseName: membership.enterprise.name,
  };
}

export async function suspendEnterpriseMember(
  actorUserId: string,
  membershipId: string
): Promise<void> {
  const team = await requireEnterpriseTeamManager(actorUserId);
  const membership = await prisma.enterpriseMembership.findFirst({
    where: { id: membershipId, enterpriseId: team.enterpriseId },
    select: { id: true, role: true, status: true },
  });
  if (!membership) {
    throw new EnterpriseTeamInviteError("Team member not found.");
  }
  assertCanManageEnterpriseMember(team.role, membership.role, "manage");
  if (membership.status === "SUSPENDED") return;

  await prisma.enterpriseMembership.update({
    where: { id: membershipId },
    data: { status: "SUSPENDED" },
  });
}

export async function reactivateEnterpriseMember(
  actorUserId: string,
  membershipId: string
): Promise<void> {
  const team = await requireEnterpriseTeamManager(actorUserId);
  const membership = await prisma.enterpriseMembership.findFirst({
    where: { id: membershipId, enterpriseId: team.enterpriseId },
    select: { id: true, role: true, status: true },
  });
  if (!membership) {
    throw new EnterpriseTeamInviteError("Team member not found.");
  }
  assertCanManageEnterpriseMember(team.role, membership.role, "manage");
  if (membership.status !== "SUSPENDED") return;

  await prisma.enterpriseMembership.update({
    where: { id: membershipId },
    data: { status: "ACTIVE" },
  });
}

export async function changeEnterpriseMemberRole(
  actorUserId: string,
  membershipId: string,
  nextRole: EnterpriseInviteRole
): Promise<{ role: EnterpriseInviteRole }> {
  if (nextRole !== "ADMIN" && nextRole !== "ADVISOR") {
    throw new EnterpriseTeamInviteError("Role must be Admin or Team member.");
  }

  const team = await requireEnterpriseTeamManager(actorUserId);
  const membership = await prisma.enterpriseMembership.findFirst({
    where: { id: membershipId, enterpriseId: team.enterpriseId },
    select: { id: true, role: true, status: true, userId: true },
  });
  if (!membership) {
    throw new EnterpriseTeamInviteError("Team member not found.");
  }
  if (membership.userId === actorUserId) {
    throw new EnterpriseTeamInviteError("You cannot change your own role.");
  }
  assertCanManageEnterpriseMember(team.role, membership.role, "change role");

  if (membership.role === nextRole) {
    return { role: nextRole };
  }

  await prisma.enterpriseMembership.update({
    where: { id: membershipId },
    data: { role: nextRole },
  });

  return { role: nextRole };
}

export async function getEnterpriseTeamPageData(userId: string) {
  const team = await resolveEnterpriseTeamContext(userId);
  if (!team) return null;

  const [members, seatUsage] = await Promise.all([
    listEnterpriseTeamMembers(team.enterpriseId),
    getEnterpriseSeatUsage(team.enterpriseId),
  ]);

  return {
    ...team,
    members,
    seatUsage,
  };
}
