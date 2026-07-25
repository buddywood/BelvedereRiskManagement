import "server-only";

import { prisma } from "@/lib/db";
import { cancelSoloSubscriptionForEnterprise } from "@/lib/enterprise/cancel-solo-subscription";
import { cancelStripeSubscriptionBestEffort } from "@/lib/billing/cancel-stripe-subscription";
import { provisionEnterpriseTeamMemberContent } from "@/lib/enterprise/provision-team-member-content";
import { syncEnterpriseRulesToMembers } from "@/lib/methodology/clone-enterprise-defaults";
import { syncEnterpriseMethodologyToMembers } from "@/lib/methodology/clone-enterprise-methodology";
import { transferAdvisorAssetsToEnterprise } from "@/lib/enterprise/transfer-advisor-assets";

/**
 * Auto-accept a pending enterprise team invite when an advisor signs in.
 * 
 * This is called from the auth signIn callback. When an advisor with a
 * pending INVITED membership signs in (after setting their password via
 * the temp password flow), we automatically accept the invite and link
 * them to the enterprise.
 * 
 * Returns true if an invite was auto-accepted, false otherwise.
 */
export async function autoAcceptPendingEnterpriseInvite(
  userId: string
): Promise<{ accepted: boolean; enterpriseId?: string; enterpriseName?: string }> {
  const membership = await prisma.enterpriseMembership.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
      role: true,
      enterpriseId: true,
      enterprise: { select: { id: true, name: true } },
      user: { select: { id: true } },
    },
  });

  if (!membership || membership.status !== "INVITED") {
    return { accepted: false };
  }

  let soloStripeSubscriptionId: string | null = null;
  let acceptedAdvisorProfileId: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const soloCancel = await cancelSoloSubscriptionForEnterprise(
        userId,
        {
          reason: "enterprise_team_join",
          enterpriseId: membership.enterpriseId,
        },
        tx
      );
      soloStripeSubscriptionId = soloCancel.stripeSubscriptionId;

      let profile = await tx.advisorProfile.findUnique({
        where: { userId },
        select: { id: true, enterpriseId: true },
      });

      if (!profile) {
        profile = await tx.advisorProfile.create({
          data: {
            userId,
            enterpriseId: membership.enterpriseId,
            firmName: membership.enterprise.name,
          },
          select: { id: true, enterpriseId: true },
        });
      } else if (profile.enterpriseId && profile.enterpriseId !== membership.enterpriseId) {
        console.warn("autoAcceptPendingEnterpriseInvite: advisor already linked to different enterprise", {
          userId,
          existingEnterpriseId: profile.enterpriseId,
          inviteEnterpriseId: membership.enterpriseId,
        });
        return;
      } else {
        await tx.advisorProfile.update({
          where: { id: profile.id },
          data: { enterpriseId: membership.enterpriseId },
        });
      }

      await tx.enterpriseMembership.update({
        where: { id: membership.id },
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

    console.info("autoAcceptPendingEnterpriseInvite: accepted", {
      userId,
      membershipId: membership.id,
      enterpriseId: membership.enterpriseId,
    });

    return {
      accepted: true,
      enterpriseId: membership.enterprise.id,
      enterpriseName: membership.enterprise.name,
    };
  } catch (error) {
    console.error("autoAcceptPendingEnterpriseInvite: failed", {
      userId,
      membershipId: membership.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { accepted: false };
  }
}
