import "server-only";

import { prisma } from "@/lib/db";
import type { AdvisorBrandingData } from "@/lib/validation/branding";

export const CLIENT_ADVISOR_LOGO_PATH = "/api/client/advisor-logo";

/** Logo URL for `<img src>` in the client portal header (S3 proxy or public HTTPS). */
export function clientPortalLogoImgSrc(branding: AdvisorBrandingData): string | null {
  if (branding.logoS3Key) {
    return CLIENT_ADVISOR_LOGO_PATH;
  }
  const url = branding.logoUrl?.trim();
  if (url?.startsWith("https://")) {
    return url;
  }
  return null;
}

/**
 * Branding for the client's currently active advisor assignment (main app /dashboard, not subdomain "branded" routes).
 */
export async function getAssignedAdvisorBrandingForClient(
  clientUserId: string
): Promise<AdvisorBrandingData | null> {
  const assignment = await prisma.clientAdvisorAssignment.findFirst({
    where: { clientId: clientUserId, status: "ACTIVE" },
    orderBy: { assignedAt: "desc" },
    select: {
      advisor: {
        select: {
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
          websiteUrl: true,
          emailFooterText: true,
          supportEmail: true,
          supportPhone: true,
          brandingEnabled: true,
          customDomainEnabled: true,
        },
      },
    },
  });

  const a = assignment?.advisor;
  if (!a?.brandingEnabled) {
    return null;
  }

  const brandName =
    a.brandName?.trim() || a.firmName?.trim() || null;

  return {
    brandName,
    advisorFirmName: a.firmName,
    tagline: a.tagline,
    primaryColor: a.primaryColor,
    secondaryColor: a.secondaryColor,
    accentColor: a.accentColor,
    logoUrl: a.logoUrl,
    logoS3Key: a.logoS3Key,
    logoContentType: a.logoContentType,
    logoFileSize: a.logoFileSize,
    logoUploadedAt: a.logoUploadedAt,
    websiteUrl: a.websiteUrl,
    emailFooterText: a.emailFooterText,
    supportEmail: a.supportEmail,
    supportPhone: a.supportPhone,
    brandingEnabled: a.brandingEnabled,
    customDomainEnabled: a.customDomainEnabled ?? false,
  };
}
