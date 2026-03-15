import "server-only";

import { auth } from "@/lib/auth";

/** Email that is allowed to hold the ADMIN role. */
export const ADMIN_ALLOWED_EMAIL = "buddy@ebilly.com";

export function isAdminUser(email: string | null | undefined, role: string | null | undefined): boolean {
  const r = role?.toString().toUpperCase();
  return r === "ADMIN" && email === ADMIN_ALLOWED_EMAIL;
}

/**
 * Require the current user to be the designated admin (ADMIN role and buddy@ebilly.com).
 * Use for admin-only routes and actions.
 */
export async function requireAdminRole() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  if (!isAdminUser(session.user.email ?? null, session.user.role)) {
    throw new Error("Unauthorized: Admin access is restricted to the designated admin account.");
  }

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}
