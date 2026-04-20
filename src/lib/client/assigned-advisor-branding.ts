import "server-only";

import { prisma } from "@/lib/db";
import type { AdvisorBrandingData } from "@/lib/validation/branding";

export {
  CLIENT_ADVISOR_LOGO_PATH,
  clientPortalLogoImgSrc,
} from "@/lib/client/client-portal-branding";

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

  return {
    /** Optional display override; may lag `firmName` if profile was edited outside branding save. */
    brandName: a.brandName?.trim() || null,
    advisorFirmName: a.firmName?.trim() || null,
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
