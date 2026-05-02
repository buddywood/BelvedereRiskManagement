import { auth } from "@/lib/auth";
import { getAdvisorHubAccessForUserId } from "@/lib/advisor/auth";
import { headers } from "next/headers";
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
    const pathname = (await headers()).get("x-akili-pathname") ?? "";
    const onBillingPage = pathname === "/advisor/billing";
    if (!onBillingPage) {
      const hub = await getAdvisorHubAccessForUserId(userId);
      if (!hub.allowed) {
        redirect(
          hub.blockReason === "disabled"
            ? "/settings?notice=advisor_portal_disabled"
            : "/advisor/billing"
        );
      }
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdvisorSrOnlyHeading />
      {children}
    </div>
  );
}
