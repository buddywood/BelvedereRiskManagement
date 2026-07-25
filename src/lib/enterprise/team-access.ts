import "server-only";

import type { EnterpriseRole } from "@prisma/client";

import { prisma } from "@/lib/db";

import { resolveBillingContext } from "./billing-context";

export type EnterpriseTeamBranding = {
  brandName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  tagline: string | null;
  logoUrl: string | null;
};

export type EnterpriseTeamContext = {
  enterpriseId: string;
  enterpriseName: string;
  role: EnterpriseRole;
  advisorProfileId: string;
  /** Custom "from" email address for white-label emails (e.g. no-reply@firmname.com). */
  clientEmailFromAddress: string | null;
  /** Branding data for white-label email styling. */
  branding: EnterpriseTeamBranding;
};

export async function resolveEnterpriseTeamContext(
  userId: string
): Promise<EnterpriseTeamContext | null> {
  const ctx = await resolveBillingContext(userId);
  if (!ctx || ctx.kind !== "enterprise") return null;
  if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return null;

  const enterprise = await prisma.advisorEnterprise.findUnique({
    where: { id: ctx.enterpriseId },
    select: {
      name: true,
      clientEmailFromAddress: true,
      brandName: true,
      primaryColor: true,
      secondaryColor: true,
      tagline: true,
      logoUrl: true,
    },
  });
  if (!enterprise) return null;

  return {
    enterpriseId: ctx.enterpriseId,
    enterpriseName: enterprise.name,
    role: ctx.role,
    advisorProfileId: ctx.advisorProfileId,
    clientEmailFromAddress: enterprise.clientEmailFromAddress,
    branding: {
      brandName: enterprise.brandName,
      primaryColor: enterprise.primaryColor,
      secondaryColor: enterprise.secondaryColor,
      tagline: enterprise.tagline,
      logoUrl: enterprise.logoUrl,
    },
  };
}

export async function requireEnterpriseTeamManager(userId: string) {
  const team = await resolveEnterpriseTeamContext(userId);
  if (!team) {
    throw new Error("Unauthorized: enterprise team management requires OWNER or ADMIN role");
  }
  return team;
}

export async function canAccessEnterpriseTeamSettings(
  userId: string
): Promise<boolean> {
  return (await resolveEnterpriseTeamContext(userId)) != null;
}
