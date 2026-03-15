import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAdminUser } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (
    !session?.user ||
    !isAdminUser(session.user.email ?? null, session.user.role)
  ) {
    redirect("/dashboard?error=unauthorized");
  }

  return <>{children}</>;
}
