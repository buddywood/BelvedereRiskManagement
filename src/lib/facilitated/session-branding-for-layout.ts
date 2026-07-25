import "server-only";

import { prisma } from "@/lib/db";
import type { AdvisorBrandingData } from "@/lib/validation/branding";

/**
 * Extract facilitated session ID from pathname if on a facilitated session route.
 * Pattern: /advisor/facilitate/[sessionId] or /advisor/facilitate/[sessionId]/...
 */
export function extractFacilitatedSessionId(pathname: string): string | null {
  const match = pathname.match(/^\/advisor\/facilitate\/([^/]+)/);
  return match?.[1] ?? null;
}

/**
 * Resolve branding for a facilitated session to display in the protected layout header.
 * This allows the main header to show firm branding even when accessed from the main domain.
 * 
 * Returns null if the session doesn't exist or advisor doesn't have access.
 */
export async function resolveFacilitatedSessionBrandingForLayout(
  sessionId: string,
  advisorUserId: string,
): Promise<AdvisorBrandingData | null> {
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId: advisorUserId },
    select: {
      id: true,
      firmName: true,
      brandName: true,
      tagline: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      logoS3Key: true,
      logoContentType: true,
      logoFileSize: true,
      logoUploadedAt: true,
      brandingEnabled: true,
      websiteUrl: true,
      emailFooterText: true,
      supportEmail: true,
      supportPhone: true,
      subdomain: {
        select: {
          subdomain: true,
          isActive: true,
          dnsVerified: true,
          sslProvisioned: true,
        },
      },
      enterprise: {
        select: {
          name: true,
          brandName: true,
          tagline: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          logoUrl: true,
          websiteUrl: true,
          emailFooterText: true,
          supportEmail: true,
          supportPhone: true,
          brandingEnabled: true,
        },
      },
    },
  });
  if (!profile) return null;

  // Verify session exists and belongs to this advisor
  const session = await prisma.facilitatedSession.findFirst({
    where: {
      id: sessionId,
      advisorProfileId: profile.id,
    },
    select: { id: true },
  });
  if (!session) return null;

  // Enterprise branding takes priority if enabled
  if (profile.enterprise?.brandingEnabled) {
    const ent = profile.enterprise;
    return {
      brandName: ent.brandName ?? ent.name,
      advisorFirmName: ent.name,
      tagline: ent.tagline,
      primaryColor: ent.primaryColor,
      secondaryColor: ent.secondaryColor,
      accentColor: ent.accentColor,
      logoUrl: ent.logoUrl,
      websiteUrl: ent.websiteUrl,
      emailFooterText: ent.emailFooterText,
      supportEmail: ent.supportEmail,
      supportPhone: ent.supportPhone,
      brandingEnabled: true,
      customDomainEnabled: false,
      subdomain: profile.subdomain ?? null,
    };
  }

  // Fall back to advisor's own branding if enabled
  if (!profile.brandingEnabled) return null;

  return {
    brandName: profile.brandName,
    advisorFirmName: profile.firmName,
    tagline: profile.tagline,
    primaryColor: profile.primaryColor,
    secondaryColor: profile.secondaryColor,
    accentColor: profile.accentColor,
    logoUrl: profile.logoUrl,
    logoS3Key: profile.logoS3Key,
    logoContentType: profile.logoContentType,
    logoFileSize: profile.logoFileSize,
    logoUploadedAt: profile.logoUploadedAt,
    websiteUrl: profile.websiteUrl,
    emailFooterText: profile.emailFooterText,
    supportEmail: profile.supportEmail,
    supportPhone: profile.supportPhone,
    brandingEnabled: true,
    customDomainEnabled: false,
    subdomain: profile.subdomain ?? null,
  };
}
