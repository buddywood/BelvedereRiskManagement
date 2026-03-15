import { getAdvisorDashboardData, updateAdvisorBranding } from "@/lib/actions/advisor-actions";
import { AdvisorBrandingForm } from "@/components/advisor/settings/AdvisorBrandingForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdvisorSettingsPage() {
  const result = await getAdvisorDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">
            Error loading settings: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const { profile } = result.data!;
  const displayName =
    profile.user.firstName && profile.user.lastName
      ? `${profile.user.firstName} ${profile.user.lastName}`
      : profile.user.name || "—";

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/advisor" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <p className="editorial-kicker">Account management</p>
        <h1 className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage branding and view your profile used in invitations.
        </p>
      </div>

      <div className="space-y-6">
        <AdvisorBrandingForm
          profile={profile}
          updateBrandingAction={updateAdvisorBranding}
        />

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Contact information</h2>
            <p className="text-sm text-muted-foreground">
              Shown in client invitation emails. Updated by your administrator.
            </p>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</dt>
              <dd className="mt-1 text-sm">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm">{profile.user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm">{profile.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Firm</dt>
              <dd className="mt-1 text-sm">{profile.firmName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Job title</dt>
              <dd className="mt-1 text-sm">{profile.jobTitle || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">License</dt>
              <dd className="mt-1 text-sm">{profile.licenseNumber || "—"}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
            To change this information, contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}