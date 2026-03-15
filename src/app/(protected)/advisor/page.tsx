import Link from "next/link";
import { getAdvisorDashboardData } from "@/lib/actions/advisor-actions";
import { ClientCard } from "@/components/advisor/ClientCard";
import { NotificationBell } from "@/components/advisor/NotificationBell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdvisorDashboardPage() {
  const result = await getAdvisorDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">Error loading advisor dashboard: {result.error}</p>
        </div>
      </div>
    );
  }

  const { clients, profile, unreadNotificationCount } = result.data!

  return (
    <div className="space-y-8">
      {/* Header with profile and notifications */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="editorial-kicker">Welcome back</p>
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
            {profile.user.name || "Advisor"}
          </h1>
          {profile.firmName && (
            <p className="text-sm text-muted-foreground">{profile.firmName}</p>
          )}
        </div>
        <NotificationBell initialCount={unreadNotificationCount} />
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-semibold">{clients.length}</p>
          </div>
        </div>

        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-semibold">
              {clients.filter((c) => c.latestInterview?.status === 'SUBMITTED').length}
            </p>
          </div>
        </div>

        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Notifications</p>
            <p className="text-2xl font-semibold">{unreadNotificationCount}</p>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {profile.specializations && profile.specializations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Focus Areas</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec: string) => (
              <div
                key={spec}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
              >
                {spec.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Governance Dashboard */}
      <Card className="hero-surface rounded-lg p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Governance Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              View governance scores and risk levels across your client portfolio
            </p>
          </div>
          <Button asChild>
            <Link href="/advisor/dashboard">
              View Portfolio Dashboard
            </Link>
          </Button>
        </div>
      </Card>

      <div className="section-divider"></div>

      {/* Client list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Assigned Clients</h2>

        {clients.length === 0 ? (
          <div className="hero-surface rounded-lg p-8 text-center">
            <div className="space-y-3">
              <p className="text-muted-foreground">No clients assigned yet.</p>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}