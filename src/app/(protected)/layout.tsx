import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProtectedNav } from "@/components/layout/ProtectedNav";
import { RedirectIncompleteIntake } from "@/components/layout/RedirectIncompleteIntake";
import { BelvedereLogoLockup } from "@/components/home/BelvedereLogoLockup";
import { prisma } from "@/lib/db";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Belt-and-suspenders: redirect if no session (middleware should catch this too)
  if (!session?.user) {
    redirect("/signin");
  }

  const role = session?.user?.role?.toString().toUpperCase();
  const showAdvisor = role === "ADVISOR" || role === "ADMIN";
  const showAdmin = role === "ADMIN";

  // For clients: restrict nav to Intake until they have submitted intake; Assessment stays disabled until advisor approves
  let restrictNavToIntake = false;
  let intakeApprovedForClient = false;
  if (role === "USER" && session.user.id) {
    const submittedInterview = await prisma.intakeInterview.findFirst({
      where: { userId: session.user.id, status: "SUBMITTED" },
      select: { id: true },
    });
    restrictNavToIntake = !submittedInterview;
    if (submittedInterview) {
      const approval = await prisma.intakeApproval.findUnique({
        where: { interviewId: submittedInterview.id },
        select: { status: true },
      });
      intakeApprovedForClient = approval?.status === "APPROVED";
    }
  }

  return (
    <div className="min-h-screen py-3 sm:py-6">
      {restrictNavToIntake && (
        <RedirectIncompleteIntake restrictNavToIntake={restrictNavToIntake} />
      )}
      <div className="page-shell">
        <div className="hero-surface overflow-x-hidden rounded-[2rem]">
          <header className="border-b section-divider bg-background/55 overflow-visible">
            <div className="pl-0 pr-4 py-3 sm:pl-4 sm:pr-8 sm:py-4 lg:pl-6 lg:pr-10">
              {" "}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:gap-8">
                  {" "}
                  <div className="min-w-0">
                    <Link
                      href="/"
                      className="block text-foreground"
                      aria-label="Belvedere home"
                    >
                      <BelvedereLogoLockup className="h-auto w-full max-w-[190px] lg:max-w-[220px]" />
                    </Link>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <p className="text-sm text-muted-foreground">
                        Signed in as{" "}
                        <span className="font-semibold text-foreground break-all">
                          {session.user.email}
                        </span>
                      </p>
                      <form
                        action={async () => {
                          "use server";
                          await signOut({ redirectTo: "/" });
                        }}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="min-w-[110px] px-4"
                        >
                          Sign Out
                        </Button>
                      </form>
                    </div>
                  </div>
                  <div className="min-w-0 xl:max-w-[560px] xl:text-right">
                    <p className="editorial-kicker mb-1">
                      Belvedere Risk Management
                    </p>
                    <h1 className="text-2xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-3xl lg:text-[3.25rem]">
                      Governance Assessment Workspace
                    </h1>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 mt-3">
                  <ProtectedNav
                    showAdvisor={showAdvisor}
                    showAdmin={showAdmin}
                    restrictNavToIntake={restrictNavToIntake}
                    intakeApprovedForClient={intakeApprovedForClient}
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
