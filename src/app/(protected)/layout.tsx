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

  // For clients: restrict nav to Intake until they have submitted intake (assessment not yet assigned/started)
  let restrictNavToIntake = false;
  if (role === "USER" && session.user.id) {
    const submitted = await prisma.intakeInterview.findFirst({
      where: { userId: session.user.id, status: "SUBMITTED" },
      select: { id: true },
    });
    restrictNavToIntake = !submitted;
  }

  return (
    <div className="min-h-screen py-3 sm:py-6">
      {restrictNavToIntake && <RedirectIncompleteIntake restrictNavToIntake={restrictNavToIntake} />}
      <div className="page-shell">
        <div className="hero-surface overflow-x-hidden rounded-[2rem]">
          <header className="border-b section-divider bg-background/55 overflow-visible">
            <div className="px-4 py-3 sm:px-8 sm:py-4 lg:px-10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="editorial-kicker">Belvedere Risk Management</p>
                  <h1 className="text-lg font-semibold leading-tight tracking-[-0.03em] sm:text-3xl sm:leading-none">
                    Governance Assessment Workspace
                  </h1>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                  <Link href="/" className="hidden text-foreground sm:block" aria-label="Belvedere home">
                    <BelvedereLogoLockup className="h-auto w-full max-w-[200px] lg:max-w-[240px]" />
                  </Link>
                  <div className="hidden rounded-full border section-divider bg-background/70 px-4 py-2 text-sm text-muted-foreground lg:block">
                    Signed in as <span className="font-semibold text-foreground">{session.user.email}</span>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <Button type="submit" variant="outline" size="sm" className="px-3 sm:px-4">
                      Sign Out
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="min-w-0 flex-1">
                  <ProtectedNav showAdvisor={showAdvisor} showAdmin={showAdmin} restrictNavToIntake={restrictNavToIntake} />
                </div>
                <div className="hidden shrink-0 rounded-full border section-divider bg-background/70 px-4 py-2 text-sm text-muted-foreground md:block lg:hidden md:max-w-[24rem]">
                  Signed in as <span className="font-semibold text-foreground">{session.user.email}</span>
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
