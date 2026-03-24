import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible proxy using getToken (no NextAuth config in Edge).
 * Protects routes and enforces MFA redirect using JWT claims only.
 */
export default async function proxy(req: NextRequest) {
  // Must match Auth.js cookie naming: `__Secure-authjs.session-token` on HTTPS,
  // `authjs.session-token` on HTTP (local dev). Wrong salt/cookieName breaks JWT
  // decode and makes getToken() always null on Vercel.
  const proto = req.headers.get("x-forwarded-proto");
  const secureCookie =
    proto === "https" || req.nextUrl.protocol === "https:";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });

  const isAuthenticated = !!token;
  const pathname = req.nextUrl.pathname;

  const protectedRoutes = ["/dashboard", "/assessment", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const mfaRoutes = ["/mfa/verify", "/mfa/setup"];
  const isMFARoute = mfaRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && !isMFARoute && isProtectedRoute) {
    const mfaEnabled = Boolean((token as { mfaEnabled?: boolean })?.mfaEnabled);
    const mfaVerified = Boolean(
      (token as { mfaVerified?: boolean })?.mfaVerified
    );
    if (mfaEnabled && !mfaVerified) {
      const mfaVerifyUrl = new URL("/mfa/verify", req.url);
      mfaVerifyUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(mfaVerifyUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
