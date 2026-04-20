import { auth } from "@/lib/auth";
import { getClientIntakeGateState } from "@/lib/client/intake-gate";
import { redirect } from "next/navigation";

/**
 * For clients (USER role): only allow access to /assessment when intake is
 * submitted and approved, or the assigned advisor has waived the intake requirement.
 */
export default async function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) return <>{children}</>;

  const role = session.user.role?.toString().toUpperCase();
  if (role === "ADVISOR" || role === "ADMIN") {
    return <>{children}</>;
  }

  const gate = await getClientIntakeGateState(session.user.id);
  if (!gate.assessmentUnlocked) {
    if (!gate.hasSubmittedInterview) {
      redirect("/dashboard?assessment=complete-intake");
    }
    redirect("/dashboard?assessment=awaiting-approval");
  }

  return <>{children}</>;
}
