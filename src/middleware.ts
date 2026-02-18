import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protected route patterns
  const protectedRoutes = ["/dashboard", "/assessment", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // MFA-related routes that should be accessible without MFA verification
  const mfaRoutes = ["/mfa/verify", "/mfa/setup"];
  const isMFARoute = mfaRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check MFA verification for authenticated users with MFA enabled
  if (isAuthenticated && !isMFARoute && isProtectedRoute) {
    const user = req.auth?.user;

    // If user has MFA enabled but hasn't verified yet, redirect to MFA verify
    if (user?.mfaEnabled && !user?.mfaVerified) {
      const mfaVerifyUrl = new URL("/mfa/verify", req.url);
      mfaVerifyUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(mfaVerifyUrl);
    }
  }

  return NextResponse.next();
});

// Only run middleware on specific paths (exclude static files, images, api routes)
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled by route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
