import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
            logoContentType: true,
            brandingEnabled: true,
          },
        },
      },
    });

    const advisor = assignment?.advisor;
    if (!advisor?.brandingEnabled || !advisor.logoS3Key) {
      return new NextResponse(null, { status: 404 });
    }

    const prefix = `advisors/${advisor.id}/`;
    if (!advisor.logoS3Key.startsWith(prefix)) {
      return new NextResponse(null, { status: 404 });
    }

    const { data, contentType } = await getBrandingLogoObjectBytes(advisor.logoS3Key);

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": advisor.logoContentType || contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Client advisor logo error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
