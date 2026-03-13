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
            <div className="flex flex-col gap-6 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="editorial-kicker">Belvedere Risk Management</p>
                  <h1 className="text-3xl font-semibold leading-none">
                    Governance Assessment Workspace
                  </h1>
                </div>
                <nav className="flex flex-wrap gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/assessment">Assessment</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/settings">Settings</Link>
                  </Button>
                </nav>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="rounded-full border section-divider bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                  Signed in as <span className="font-semibold text-foreground">{session.user.email}</span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button type="submit" variant="outline">
                    Sign Out
                  </Button>
                </form>
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
