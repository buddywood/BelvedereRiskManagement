import type { NextRequest } from "next/server";

import { handlers } from "@/lib/auth";
import { rewriteAuthRedirectToRequestOrigin } from "@/lib/auth/rewrite-auth-redirect-origin";

export async function GET(req: NextRequest) {
  return rewriteAuthRedirectToRequestOrigin(req, await handlers.GET(req));
}

export async function POST(req: NextRequest) {
  return rewriteAuthRedirectToRequestOrigin(req, await handlers.POST(req));
}
