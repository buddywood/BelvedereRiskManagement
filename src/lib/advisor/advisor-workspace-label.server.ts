import "server-only";

import { prisma } from "@/lib/db";
import {
  advisorWorkspaceTitle,
  DEFAULT_ADVISOR_WORKSPACE_TITLE,
} from "@/lib/advisor/advisor-workspace-label";

export async function resolveAdvisorWorkspaceTitleForUserId(
  userId: string | null | undefined
): Promise<string> {
  if (!userId) return DEFAULT_ADVISOR_WORKSPACE_TITLE;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, firstName: true, lastName: true },
  });

  if (!user) return DEFAULT_ADVISOR_WORKSPACE_TITLE;

  return advisorWorkspaceTitle(user);
}

export type AdvisorWorkspaceSidebarBranding = {
  title: string;
  logoUrl: string | null;
};

/**
 * Resolve workspace sidebar branding for an advisor.
 * Returns the workspace title and logo URL (if branding is enabled).
 * Enterprise branding takes priority over individual advisor branding.
 */
export async function resolveAdvisorWorkspaceSidebarBranding(
  userId: string | null | undefined
): Promise<AdvisorWorkspaceSidebarBranding> {
  if (!userId) {
    return { title: DEFAULT_ADVISOR_WORKSPACE_TITLE, logoUrl: null };
  }

  const profile = await prisma.advisorProfile.findUnique({
    where: { userId },
    select: {
      brandingEnabled: true,
      brandName: true,
      firmName: true,
      logoUrl: true,
      user: {
        select: { name: true, firstName: true, lastName: true },
      },
      enterprise: {
        select: {
          name: true,
          brandName: true,
          logoUrl: true,
          brandingEnabled: true,
        },
      },
    },
  });

  if (!profile) {
    return { title: DEFAULT_ADVISOR_WORKSPACE_TITLE, logoUrl: null };
  }

  const userTitle = profile.user
    ? advisorWorkspaceTitle(profile.user)
    : DEFAULT_ADVISOR_WORKSPACE_TITLE;

  // Enterprise branding takes priority
  if (profile.enterprise?.brandingEnabled) {
    const ent = profile.enterprise;
    return {
      title: ent.brandName ?? ent.name ?? userTitle,
      logoUrl: ent.logoUrl,
    };
  }

  // Fall back to advisor's own branding if enabled
  if (profile.brandingEnabled) {
    return {
      title: profile.brandName ?? profile.firmName ?? userTitle,
      logoUrl: profile.logoUrl,
    };
  }

  // No branding enabled - use default title, no logo
  return { title: userTitle, logoUrl: null };
}
