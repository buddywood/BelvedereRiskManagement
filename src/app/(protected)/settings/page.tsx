import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorPersonalDetailsForm } from "@/components/settings/AdvisorPersonalDetailsForm";
import { ClientPersonalDetailsForm } from "@/components/settings/ClientPersonalDetailsForm";
import { getAdvisorPersonalDetails, getClientPersonalDetails } from "@/lib/actions/personal-profile";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const role = session.user.role?.toString().toUpperCase();

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      mfaEnabled: true,
      mfaRecoveryCodes: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Fetch personal details for profile section (advisor or client by role)
  let advisorDetails: Awaited<ReturnType<typeof getAdvisorPersonalDetails>>["data"] = null;
  let clientDetails: Awaited<ReturnType<typeof getClientPersonalDetails>>["data"] = null;
  if (role === "ADVISOR" || role === "ADMIN") {
    const res = await getAdvisorPersonalDetails();
    if (res.success && res.data) advisorDetails = res.data;
  }
  if (role === "USER") {
    const res = await getClientPersonalDetails();
    if (res.success && res.data) clientDetails = res.data;
  }

  const recoveryCodesRemaining = user.mfaRecoveryCodes
    ? (user.mfaRecoveryCodes as string[]).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <section className="hero-surface rounded-[1.75rem] p-4 sm:p-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-2 sm:space-y-3">
            <p className="editorial-kicker">Account Settings</p>
            <h1 className="text-3xl font-semibold text-balance sm:text-5xl">
              Security posture and access controls
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Review account identity, secure your workspace with multi-factor authentication,
              and keep recovery access in good standing.
            </p>
          </div>

          <Card className="bg-background/60">
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 sm:pt-6">
              <div>
                <p className="editorial-kicker">Email</p>
                <p className="mt-2 text-lg font-semibold break-all">{user.email}</p>
              </div>
              <div>
                <p className="editorial-kicker">MFA Status</p>
                <p className="mt-2 text-lg font-semibold">
                  {user.mfaEnabled ? "Enabled" : "Not Enabled"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Account Information</CardTitle>
            <CardDescription>
              Primary identity details for your assessment workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
              <p className="editorial-kicker">Email Address</p>
              <p className="mt-2 text-base font-semibold">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {(advisorDetails !== null || clientDetails !== null) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Personal details</CardTitle>
              <CardDescription>
                {advisorDetails !== null
                  ? "Contact and professional details for your advisor profile."
                  : "Contact and address details visible to your advisor."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {advisorDetails !== null && (
                <AdvisorPersonalDetailsForm initialData={advisorDetails} />
              )}
              {clientDetails !== null && (
                <ClientPersonalDetailsForm initialData={clientDetails} />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Strengthen sign-in security with a second verification factor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.mfaEnabled ? (
              <>
                <div className="flex flex-col gap-3 rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="editorial-kicker">Protection Status</p>
                    <p className="mt-2 text-base font-semibold">MFA is active on this account</p>
                  </div>
                  <Badge variant="success">Protected</Badge>
                </div>

                <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
                  <p className="editorial-kicker">Recovery Codes</p>
                  <p className="mt-2 text-base font-semibold">
                    {recoveryCodesRemaining} recovery code
                    {recoveryCodesRemaining !== 1 ? "s" : ""} remaining
                  </p>
                  {recoveryCodesRemaining <= 2 ? (
                    <p className="mt-3 text-sm leading-6 text-amber-700 dark:text-amber-300">
                      You&apos;re running low on recovery codes. Regeneration and disable controls are not yet implemented.
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Your saved recovery codes provide secure fallback access if your authenticator is unavailable.
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
                    <p className="editorial-kicker">Planned Control</p>
                    <p className="mt-2 text-sm font-semibold">Regenerate recovery codes</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This control is planned for a future iteration and is not yet available.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
                    <p className="editorial-kicker">Planned Control</p>
                    <p className="mt-2 text-sm font-semibold">Disable MFA</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Direct MFA deactivation has not been implemented yet.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="editorial-kicker">Protection Status</p>
                    <p className="mt-2 text-base font-semibold">MFA is not enabled</p>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>

                <div className="rounded-[1.25rem] border border-brand/25 bg-brand/10 px-4 py-4">
                  <p className="text-sm leading-6 text-foreground">
                    Enable two-factor authentication to add a second layer of protection.
                    You&apos;ll need an authenticator app such as Google Authenticator,
                    Authy, or 1Password.
                  </p>
                </div>

                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/mfa/setup">Enable Two-Factor Authentication</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Security Actions</CardTitle>
          <CardDescription>
            Additional account controls will expand here as the workspace evolves.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.25rem] border section-divider bg-background/55 px-4 py-4">
            <p className="editorial-kicker">Planned Control</p>
            <p className="mt-2 text-sm font-semibold">Change Password</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Password management flows are planned but not yet implemented in this workspace.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
