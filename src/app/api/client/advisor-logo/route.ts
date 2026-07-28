import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  isS3ObjectNotFound,
  resolveBrandingLogoS3Key,
} from '@/lib/branding/advisor-logo-display';
import { prisma } from '@/lib/db';
import { getBrandingLogoObjectBytes } from '@/lib/s3/branding-uploads';

/**
 * Logo image for the client's assigned advisor (private S3 objects).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const userRole = session.user.role?.toString().toUpperCase();
    if (userRole !== "USER") {
      return new NextResponse(null, { status: 403 });
    }

    const assignment = await prisma.clientAdvisorAssignment.findFirst({
      where: { clientId: session.user.id, status: "ACTIVE" },
      orderBy: { assignedAt: "desc" },
      select: {
        advisor: {
          select: {
            id: true,
            logoS3Key: true,
            logoUrl: true,
            logoContentType: true,
            brandingEnabled: true,
          },
        },
      },
    });

    const advisor = assignment?.advisor;
    if (!advisor?.brandingEnabled) {
      return new NextResponse(null, { status: 404 });
    }

    const logoS3Key = resolveBrandingLogoS3Key(advisor);
    if (!logoS3Key) {
      return new NextResponse(null, { status: 404 });
    }

    const prefix = `advisors/${advisor.id}/`;
    if (!logoS3Key.startsWith(prefix)) {
      return new NextResponse(null, { status: 404 });
    }

    const { data, contentType } = await getBrandingLogoObjectBytes(logoS3Key);

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": advisor.logoContentType || contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isS3ObjectNotFound(error)) {
      return new NextResponse(null, { status: 404 });
    }
    console.error("Client advisor logo error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
