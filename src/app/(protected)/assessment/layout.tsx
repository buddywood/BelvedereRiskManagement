import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * For clients (USER role): only allow access to /assessment when their intake
 * has been submitted and approved by an advisor. Otherwise redirect to dashboard.
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

  const submittedInterview = await prisma.intakeInterview.findFirst({
    where: { userId: session.user.id, status: "SUBMITTED" },
    select: { id: true },
  });
  if (!submittedInterview) {
    redirect("/dashboard?assessment=complete-intake");
  }

  const approval = await prisma.intakeApproval.findUnique({
    where: { interviewId: submittedInterview.id },
    select: { status: true },
  });
  if (approval?.status !== "APPROVED") {
    redirect("/dashboard?assessment=awaiting-approval");
  }

  return <>{children}</>;
}
