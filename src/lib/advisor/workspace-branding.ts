import "server-only";

import { resolveBrandingLogoS3Key } from "@/lib/branding/advisor-logo-display";
import { prisma } from "@/lib/db";
import type { AdvisorBrandingData } from "@/lib/validation/branding";
import {
  mapAdvisorProfileToBrandingData,
} from "@/lib/client/advisor-branding-profile";

/**
 * Resolve branding for the advisor workspace when accessed via subdomain.
 * Returns branding data if the advisor has branding enabled, null otherwise.
 */
export async function resolveAdvisorWorkspaceBranding(
  advisorUserId: string,
): Promise<AdvisorBrandingData | null> {
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId: advisorUserId },
    select: {
      id: true,
      enterpriseId: true,
      brandingEnabled: true,
      firmName: true,
      brandName: true,
      tagline: true,
      landingKicker: true,
      landingHeadline: true,
      landingSubheadline: true,
      landingSubtext: true,
      landingFeatureCards: true,
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
      clientEmailFromAddress: true,
      customDomainEnabled: true,
      enterprise: {
        select: {
          name: true,
          brandName: true,
          tagline: true,
          landingKicker: true,
          landingHeadline: true,
          landingSubheadline: true,
          landingSubtext: true,
          landingFeatureCards: true,
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
          clientEmailFromAddress: true,
          brandingEnabled: true,
          customDomainEnabled: true,
        },
      },
    },
  });

  if (!profile) return null;

  // Enterprise branding takes priority if enabled
  if (profile.enterprise?.brandingEnabled) {
    const ent = profile.enterprise;
    const firmHasLogo = Boolean(resolveBrandingLogoS3Key(ent));
    const personalHasLogo =
      profile.brandingEnabled && Boolean(resolveBrandingLogoS3Key(profile));
    // Prefer firm logo; if firm colors/copy are set but logo lives only on the
    // advisor profile (common after subdomain claim), keep the personal logo
    // so the workspace header matches the public landing page.
    const logoSource =
      firmHasLogo || !personalHasLogo
        ? {
            logoUrl: ent.logoUrl,
            logoS3Key: ent.logoS3Key,
            logoContentType: ent.logoContentType,
            logoFileSize: ent.logoFileSize,
            logoUploadedAt: ent.logoUploadedAt,
          }
        : {
            logoUrl: profile.logoUrl,
            logoS3Key: profile.logoS3Key,
            logoContentType: profile.logoContentType,
            logoFileSize: profile.logoFileSize,
            logoUploadedAt: profile.logoUploadedAt,
          };

    return {
      brandName: ent.brandName ?? ent.name,
      advisorFirmName: ent.name,
      tagline: ent.tagline,
      landingKicker: ent.landingKicker,
      landingHeadline: ent.landingHeadline,
      landingSubheadline: ent.landingSubheadline,
      landingSubtext: ent.landingSubtext,
      landingFeatureCards: ent.landingFeatureCards as AdvisorBrandingData["landingFeatureCards"],
      primaryColor: ent.primaryColor,
      secondaryColor: ent.secondaryColor,
      accentColor: ent.accentColor,
      ...logoSource,
      websiteUrl: ent.websiteUrl,
      emailFooterText: ent.emailFooterText,
      supportEmail: ent.supportEmail,
      supportPhone: ent.supportPhone,
      clientEmailFromAddress: ent.clientEmailFromAddress,
      brandingEnabled: ent.brandingEnabled,
      customDomainEnabled: ent.customDomainEnabled,
    };
  }

  // Fall back to advisor's own branding if enabled
  if (!profile.brandingEnabled) return null;

  return mapAdvisorProfileToBrandingData(profile);
}
