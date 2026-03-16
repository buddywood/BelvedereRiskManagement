import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AdvisorPageHeaderFromPath } from "@/components/advisor/AdvisorPageHeader";

export default async function AdvisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  const role = session?.user?.role?.toString().toUpperCase();
  if (!role || (role !== "ADVISOR" && role !== "ADMIN")) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdvisorPageHeaderFromPath />
      {children}
    </div>
  );
}
