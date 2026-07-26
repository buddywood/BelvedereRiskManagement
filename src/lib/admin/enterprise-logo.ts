import "server-only";

import { prisma } from "@/lib/db";
import { isAllowedAdminEnterpriseLogoS3Key } from "@/lib/admin/advisor-list-branding";

export async function resolveAdminEnterpriseLogo(
  enterpriseId: string,
): Promise<{
  logoS3Key: string;
  logoContentType: string | null;
} | null> {
  const enterprise = await prisma.advisorEnterprise.findUnique({
    where: { id: enterpriseId },
    select: {
      id: true,
      logoS3Key: true,
      logoContentType: true,
      brandingEnabled: true,
    },
  });

  if (!enterprise?.brandingEnabled) {
    return null;
  }

  const logoS3Key = enterprise.logoS3Key?.trim();
  if (!logoS3Key || !isAllowedAdminEnterpriseLogoS3Key(logoS3Key, enterprise.id)) {
    return null;
  }

  return {
    logoS3Key,
    logoContentType: enterprise.logoContentType,
  };
}
