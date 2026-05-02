import { auth } from "@/lib/auth";
import { isAdvisorPortalAccessEnabled } from "@/lib/advisor/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AdvisorSrOnlyHeading } from "@/components/advisor/AdvisorSrOnlyHeading";

export default async function AdvisorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const role = session?.user?.role?.toString().toUpperCase();
  if (!role || (role !== "ADVISOR" && role !== "ADMIN")) {
    redirect("/dashboard?error=unauthorized");
  }

  if (role === "ADVISOR" && userId) {
    const portalOk = await isAdvisorPortalAccessEnabled(userId);
    if (!portalOk) {
      redirect("/settings?notice=advisor_portal_disabled");
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdvisorSrOnlyHeading />
      {children}
    </div>
  );
}
