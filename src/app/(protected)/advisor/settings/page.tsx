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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/advisor">
            <ArrowLeft className="h-4 w-4" />
            Back to portal
          </Link>
        </Button>
        <div className="space-y-1">
          <p className="editorial-kicker">Account management</p>
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your branding and contact information.
          </p>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-6">
        <AdvisorBrandingForm
          profile={profile}
          updateBrandingAction={updateAdvisorBranding}
        />

        {/* Contact Information Display */}
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Contact Information</h2>
              <p className="text-sm text-muted-foreground">
                This information is displayed in client invitation emails.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm">
                  {profile.user.firstName && profile.user.lastName
                    ? `${profile.user.firstName} ${profile.user.lastName}`
                    : profile.user.name || 'Not set'
                  }
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{profile.user.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{profile.phone || 'Not set'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Firm Name</p>
                <p className="text-sm">{profile.firmName || 'Not set'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                <p className="text-sm">{profile.jobTitle || 'Not set'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">License Number</p>
                <p className="text-sm">{profile.licenseNumber || 'Not set'}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                To update your contact information, please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}