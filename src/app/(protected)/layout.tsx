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
    <div className="min-h-screen py-4 sm:py-6">
      <div className="page-shell">
        <div className="hero-surface overflow-hidden rounded-[2rem]">
          <header className="border-b section-divider bg-background/55">
            <div className="px-5 py-4 sm:px-8 lg:px-10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="editorial-kicker">Belvedere Risk Management</p>
                  <h1 className="text-xl font-semibold leading-none sm:text-3xl">
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
                    <Button type="submit" variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <nav className="grid grid-cols-2 gap-2 md:flex md:grid-cols-4">
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/assessment">Assessment</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/profiles">Profiles</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/settings">Settings</Link>
                  </Button>
                </nav>

                <div className="hidden rounded-full border section-divider bg-background/70 px-4 py-2 text-sm text-muted-foreground md:block lg:hidden md:max-w-[24rem]">
                  Signed in as <span className="font-semibold text-foreground">{session.user.email}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
