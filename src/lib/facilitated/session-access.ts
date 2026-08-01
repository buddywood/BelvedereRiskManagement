import "server-only";

import type { FacilitatedSession } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  requireAdvisorRole,
  getAdvisorProfileOrThrow,
} from "@/lib/advisor/auth";
import {
  findPortfolioAssignmentForClient,
  resolvePortfolioScope,
} from "@/lib/enterprise/portfolio-access";

export type FacilitatedSessionBranding = {
  brandName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  tagline: string | null;
};

export type FacilitatedSessionContext = FacilitatedSession & {
  client: { id: string; name: string | null; emailCiphertext: string };
  branding: FacilitatedSessionBranding;
};

/** Load a session only when the advisor has portfolio access to the client. */
export async function getFacilitatedSessionForAdvisor(
  sessionId: string,
  advisorUserId: string,
): Promise<FacilitatedSessionContext | null> {
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId: advisorUserId },
    select: {
      id: true,
      brandName: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      tagline: true,
      brandingEnabled: true,
      enterprise: {
        select: {
          brandName: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          logoUrl: true,
          tagline: true,
          brandingEnabled: true,
        },
      },
    },
  });
  if (!profile) return null;

  const scope = await resolvePortfolioScope(advisorUserId);
  if (!scope) return null;

  const session = await prisma.facilitatedSession.findUnique({
    where: { id: sessionId },
    include: {
      client: {
        select: { id: true, name: true, emailCiphertext: true },
      },
    },
  });
  if (!session) return null;
  if (session.advisorProfileId !== profile.id && scope.mode === "assigned") {
    return null;
  }

  const access = await findPortfolioAssignmentForClient(scope, session.clientId);
  if (!access) return null;

  const enterpriseBranding = profile.enterprise?.brandingEnabled ? profile.enterprise : null;
  const advisorBranding = profile.brandingEnabled ? profile : null;
  const branding: FacilitatedSessionBranding = {
    brandName: enterpriseBranding?.brandName ?? advisorBranding?.brandName ?? null,
    primaryColor: enterpriseBranding?.primaryColor ?? advisorBranding?.primaryColor ?? null,
    secondaryColor: enterpriseBranding?.secondaryColor ?? advisorBranding?.secondaryColor ?? null,
    accentColor: enterpriseBranding?.accentColor ?? advisorBranding?.accentColor ?? null,
    logoUrl: enterpriseBranding?.logoUrl ?? advisorBranding?.logoUrl ?? null,
    tagline: enterpriseBranding?.tagline ?? advisorBranding?.tagline ?? null,
  };

  return { ...session, branding };
}

export async function requireFacilitatedSessionForAdvisor(
  sessionId: string,
): Promise<FacilitatedSessionContext> {
  const { userId } = await requireAdvisorRole();
  const session = await getFacilitatedSessionForAdvisor(sessionId, userId);
  if (!session) {
    throw new Error("Session not found or not assigned to you");
  }
  return session;
}

export async function assertAdvisorPortfolioAccessToClient(
  advisorUserId: string,
  clientId: string,
): Promise<{ advisorProfileId: string }> {
  const profile = await getAdvisorProfileOrThrow(advisorUserId);
  const scope = await resolvePortfolioScope(advisorUserId);
  if (!scope) {
    throw new Error("Client not found or not assigned to you");
  }
  const access = await findPortfolioAssignmentForClient(scope, clientId);
  if (!access) {
    throw new Error("Client not found or not assigned to you");
  }
  return { advisorProfileId: profile.id };
}
