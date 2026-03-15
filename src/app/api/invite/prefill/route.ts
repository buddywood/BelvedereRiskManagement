import { NextRequest, NextResponse } from "next/server";
import { getPrefillDataForToken, getPrefillEmailForToken } from "@/lib/invite";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ prefillEmail: null, clientName: null, advisorName: null }, { status: 200 });
  }

  // Use the new comprehensive prefill function
  const prefillData = await getPrefillDataForToken(token);
  if (!prefillData) {
    // Fallback to original behavior for backward compatibility
    const prefillEmail = await getPrefillEmailForToken(token);
    return NextResponse.json({
      prefillEmail,
      clientName: null,
      advisorName: null
    });
  }

  return NextResponse.json(prefillData);
}
