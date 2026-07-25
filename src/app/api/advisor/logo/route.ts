import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBrandingLogoObjectBytes } from "@/lib/s3/branding-uploads";

/**
 * Logo image for the advisor's own branding (or their enterprise's branding).
 * Used in the branded advisor workspace header.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const userRole = session.user.role?.toString().toUpperCase();
    if (userRole !== "ADVISOR" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return new NextResponse(null, { status: 403 });
    }

    const profile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        logoS3Key: true,
        logoContentType: true,
        brandingEnabled: true,
        enterprise: {
          select: {
            id: true,
            logoS3Key: true,
            logoContentType: true,
            brandingEnabled: true,
          },
        },
      },
    });

    if (!profile) {
      return new NextResponse(null, { status: 404 });
    }

    // Enterprise branding takes priority
    const entLogoKey = profile.enterprise?.logoS3Key;
    if (profile.enterprise?.brandingEnabled && entLogoKey) {
      const ent = profile.enterprise;
      const prefix = `enterprises/${ent.id}/`;
      if (!entLogoKey.startsWith(prefix)) {
        return new NextResponse(null, { status: 404 });
      }

      const { data, contentType } = await getBrandingLogoObjectBytes(entLogoKey);
      return new NextResponse(Buffer.from(data), {
        headers: {
          "Content-Type": ent.logoContentType || contentType,
          "Cache-Control": "private, no-store",
        },
      });
    }

    // Fall back to advisor's own branding
    if (!profile.brandingEnabled || !profile.logoS3Key) {
      return new NextResponse(null, { status: 404 });
    }

    const prefix = `advisors/${profile.id}/`;
    if (!profile.logoS3Key.startsWith(prefix)) {
      return new NextResponse(null, { status: 404 });
    }

    const { data, contentType } = await getBrandingLogoObjectBytes(profile.logoS3Key);
    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": profile.logoContentType || contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Advisor logo error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
