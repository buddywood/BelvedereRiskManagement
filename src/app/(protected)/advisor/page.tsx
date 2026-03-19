import Link from "next/link";
import { UserPlus, Send, Settings, GitBranch, Shield, UserSearch } from "lucide-react";
import { getAdvisorDashboardData } from "@/lib/actions/advisor-actions";
import { ClientCard } from "@/components/advisor/ClientCard";
import { NotificationBell } from "@/components/advisor/NotificationBell";
import { Button } from "@/components/ui/button";
import type { AdvisorDashboardClient } from "@/lib/advisor/types";

function pipelineStages(clients: AdvisorDashboardClient[]) {
  const notStarted = clients.filter(
    (c) => !c.latestInterview || c.latestInterview.status === "NOT_STARTED",
  ).length;
  const inProgress = clients.filter(
    (c) => c.latestInterview?.status === "IN_PROGRESS",
  ).length;
  const submitted = clients.filter(
    (c) => c.latestInterview?.status === "SUBMITTED",
  ).length;
  const completed = clients.filter(
    (c) => c.latestInterview?.status === "COMPLETED",
  ).length;
  return { notStarted, inProgress, submitted, completed };
}

export default async function AdvisorClientsPage() {
  const result = await getAdvisorDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">
            Error loading clients: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const { clients, profile, unreadNotificationCount, pendingInvitationsCount } = result.data!;
  const pipeline = pipelineStages(clients);

  return (
    <div className="space-y-8">
      {/* Primary actions + optional greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Welcome back{profile.user.firstName ? `, ${profile.user.firstName}` : ""}
            {profile.firmName ? ` · ${profile.firmName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/advisor/invitations" className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite client
            </Link>
          </Button>
          <NotificationBell initialCount={unreadNotificationCount} />
        </div>
      </div>

      {/* Pipeline: stages at a glance */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Pipeline
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
            <p className="text-lg font-semibold">{pendingInvitationsCount}</p>
            <p className="text-xs text-muted-foreground">Pending invitations</p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
            <p className="text-lg font-semibold">{pipeline.notStarted}</p>
            <p className="text-xs text-muted-foreground">Not started</p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
            <p className="text-lg font-semibold">{pipeline.inProgress}</p>
            <p className="text-xs text-muted-foreground">In progress</p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
            <p className="text-lg font-semibold">{pipeline.submitted}</p>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
            <p className="text-lg font-semibold">{pipeline.completed}</p>
            <p className="text-xs text-muted-foreground">Intake complete</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/advisor/pipeline" className="group">
          <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">Pipeline</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time client workflow tracking — click any client for drill-down timeline view
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/advisor/cyber-risk" className="group">
          <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">Cyber Risk</h3>
                <p className="text-sm text-muted-foreground">
                  View client cyber risk scores and assessment status
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/advisor/identity-risk" className="group">
          <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <UserSearch className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">Identity Risk</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor client identity exposure and privacy risk scores
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/advisor/invitations" className="group">
          <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">Client Invitations</h3>
                <p className="text-sm text-muted-foreground">
                  Send and manage client invitations
                </p>
                {pendingInvitationsCount > 0 && (
                  <p className="text-xs text-amber-600">
                    {pendingInvitationsCount} pending invitation{pendingInvitationsCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>

        <Link href="/advisor/settings" className="group">
          <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your branding and preferences
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Client list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Clients</h2>

        {clients.length === 0 ? (
          <div className="hero-surface rounded-lg p-8 text-center">
            <div className="space-y-3">
              <p className="text-muted-foreground">No clients assigned yet.</p>
              <p className="text-sm text-muted-foreground">
                <Link href="/advisor/invitations" className="font-medium text-primary underline underline-offset-2">
                  Invite a client
                </Link>{" "}
                or contact your administrator to get started.
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
