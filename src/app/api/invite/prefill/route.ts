import { NextRequest, NextResponse } from "next/server";
import { getPrefillEmailForToken } from "@/lib/invite";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ prefillEmail: null }, { status: 200 });
  }
  const prefillEmail = await getPrefillEmailForToken(token);
  return NextResponse.json({ prefillEmail });
}
