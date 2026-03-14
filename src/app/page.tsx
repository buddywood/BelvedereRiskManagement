import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen py-6 sm:py-8">
      <div className="page-shell">
        <div className="hero-surface app-grid grid min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-10">
          <section className="flex flex-col justify-between gap-8 lg:gap-10">
            <div className="space-y-7">
              <div className="space-y-4">
                <p className="editorial-kicker">Belvedere Risk Management</p>
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-semibold leading-none text-balance sm:text-6xl lg:text-[4.5rem]">
                    Modern governance intelligence for discerning families.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    A discreet digital assessment experience inspired by the
                    Belvedere brand ethos: calm authority, precise guidance, and
                    security that empowers confident decision-making.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {session?.user ? (
                  <>
                    <Button asChild size="lg" className="sm:min-w-44">
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <Button type="submit" size="lg" variant="outline" className="w-full sm:min-w-44">
                        Sign Out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="sm:min-w-44">
                      <Link href="/signin">
                        Sign In
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="sm:min-w-44">
                      <Link href="/signup">Create Account</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-0 bg-background/50 shadow-none">
                <CardContent className="space-y-3 pt-6">
                  <ShieldCheck className="size-5 text-brand" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Risk-first design</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Confidential workflows built for clarity, not noise.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-background/50 shadow-none">
                <CardContent className="space-y-3 pt-6">
                  <Waypoints className="size-5 text-brand" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Guided assessment</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Structured prompts surface governance gaps with precision.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-background/50 shadow-none">
                <CardContent className="space-y-3 pt-6">
                  <Sparkles className="size-5 text-brand" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Actionable insight</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Receive recommendations designed for advisors and family leadership.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <aside className="mt-10 flex items-center lg:mt-0 lg:pl-10">
            <Card className="w-full overflow-hidden">
              <CardContent className="space-y-8 pt-8">
                <div className="space-y-2">
                  <p className="editorial-kicker">Our Company Ethos</p>
                  <p className="text-xl font-medium leading-8 text-balance text-foreground/90">
                    Security should empower, not restrict. This assessment
                    translates that principle into a contemporary client
                    experience.
                  </p>
                </div>

                <div className="space-y-5 text-sm leading-7 text-muted-foreground">
                  <p>
                    Wealth managers grow the portfolio. Lawyers protect the
                    structure. Accountants track the flow. A chief risk officer
                    protects the family.
                  </p>
                  <p>
                    The product experience is built to mirror that posture:
                    discreet, confident, and deeply intentional at every touchpoint.
                  </p>
                </div>

                <div className="section-divider border-t pt-6 text-sm text-muted-foreground">
                  {session?.user ? (
                    <>
                      Signed in as{" "}
                      <span className="font-semibold text-foreground">{session.user.email}</span>.
                      Continue to the dashboard, review recommendations, and manage account
                      security settings.
                    </>
                  ) : (
                    <>
                      Existing clients can sign in to continue an assessment, review
                      recommendations, and manage account security settings.
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
