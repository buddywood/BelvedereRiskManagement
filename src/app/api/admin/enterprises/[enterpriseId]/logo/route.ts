import { NextResponse } from "next/server";

import { resolveAdminEnterpriseLogo } from "@/lib/admin/enterprise-logo";
import { getAuditAdminActorOrNull } from "@/lib/audit/admin-gate";
import { getBrandingLogoObjectBytes } from "@/lib/s3/branding-uploads";

/**
 * Admin-only: stream an enterprise's branding logo from S3 for the firms list.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ enterpriseId: string }> },
) {
  const actor = await getAuditAdminActorOrNull();
  if (!actor) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { enterpriseId } = await context.params;
    const logo = await resolveAdminEnterpriseLogo(enterpriseId);
    if (!logo) {
      return new NextResponse(null, { status: 404 });
    }

    const { data, contentType } = await getBrandingLogoObjectBytes(logo.logoS3Key);

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": logo.logoContentType || contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("Admin enterprise logo error:", e);
    return new NextResponse(null, { status: 500 });
  }
}
