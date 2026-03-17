import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAdminUser } from "@/lib/admin/auth";
import { AdminPageHeaderFromPath } from "@/components/layout/AdminPageHeader";
import { AdminNav } from "@/components/admin/AdminNav";

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeaderFromPath />
      <AdminNav />
      {children}
    </div>
  );
}
