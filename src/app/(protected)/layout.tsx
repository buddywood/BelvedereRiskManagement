import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen py-3 sm:py-6">
      <div className="page-shell">
        <div className="hero-surface overflow-hidden rounded-[2rem]">
          <header className="border-b section-divider bg-background/55">
            <div className="px-4 py-3 sm:px-8 sm:py-4 lg:px-10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="editorial-kicker">Belvedere Risk Management</p>
                  <h1 className="text-lg font-semibold leading-tight tracking-[-0.03em] sm:text-3xl sm:leading-none">
                    Governance Assessment Workspace
                  </h1>
                </div>

                <div className="flex shrink-0 items-center gap-3">
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

              <div className="mt-3 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
                <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:grid-cols-5">
                  <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                    <Link href="/intake">Intake</Link>
                  </Button>
                  {(session?.user?.role === 'ADVISOR' || session?.user?.role === 'ADMIN') && (
                    <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                      <Link href="/advisor">Advisor</Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                    <Link href="/assessment">Assessment</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                    <Link href="/profiles">Profiles</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-9 w-full px-3">
                    <Link href="/settings">Settings</Link>
                  </Button>
                </nav>

                <div className="hidden rounded-full border section-divider bg-background/70 px-4 py-2 text-sm text-muted-foreground md:block lg:hidden md:max-w-[24rem]">
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
