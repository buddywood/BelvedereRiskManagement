import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isS3ObjectNotFound,
  resolveBrandingLogoS3Key,
} from "@/lib/branding/advisor-logo-display";
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
        logoUrl: true,
        logoContentType: true,
        brandingEnabled: true,
        enterprise: {
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

    if (!profile) {
      return new NextResponse(null, { status: 404 });
    }

    // Enterprise branding takes priority when it has a resolvable logo key
    const ent = profile.enterprise;
    if (ent?.brandingEnabled) {
      const entLogoKey = resolveBrandingLogoS3Key(ent);
      if (entLogoKey) {
        const prefix = `enterprises/${ent.id}/`;
        if (entLogoKey.startsWith(prefix)) {
          try {
            const { data, contentType } = await getBrandingLogoObjectBytes(entLogoKey);
            return new NextResponse(Buffer.from(data), {
              headers: {
                "Content-Type": ent.logoContentType || contentType,
                "Cache-Control": "private, no-store",
              },
            });
          } catch (error) {
            if (!isS3ObjectNotFound(error)) throw error;
            // Fall through to personal branding when firm object is missing
          }
        }
      }
    }

    // Fall back to advisor's own branding
    if (!profile.brandingEnabled) {
      return new NextResponse(null, { status: 404 });
    }

    const advisorLogoKey = resolveBrandingLogoS3Key(profile);
    if (!advisorLogoKey) {
      return new NextResponse(null, { status: 404 });
    }

    const prefix = `advisors/${profile.id}/`;
    if (!advisorLogoKey.startsWith(prefix)) {
      return new NextResponse(null, { status: 404 });
    }

    const { data, contentType } = await getBrandingLogoObjectBytes(advisorLogoKey);
    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": profile.logoContentType || contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isS3ObjectNotFound(error)) {
      return new NextResponse(null, { status: 404 });
    }
    console.error("Advisor logo error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
