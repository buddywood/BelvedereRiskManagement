import Link from "next/link";
import { UserPlus, Send, Settings, GitBranch, Shield, UserSearch, ArrowRight } from "lucide-react";
import { getAdvisorDashboardData } from "@/lib/actions/advisor-actions";
import { getClientPipelineData } from "@/lib/actions/pipeline-actions";
import { NotificationBell } from "@/components/advisor/NotificationBell";
import { AdvisorNeedsAttention } from "@/components/advisor/AdvisorNeedsAttention";
import { Button } from "@/components/ui/button";

export default async function AdvisorHomePage() {
  const [dash, pipelineRes] = await Promise.all([
    getAdvisorDashboardData(),
    getClientPipelineData(),
  ]);

  if (!dash.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">
            Error loading advisor home: {dash.error}
          </p>
        </div>
      </div>
    );
  }

  const { profile, unreadNotificationCount, pendingInvitationsCount } = dash.data!;

  const pipelineOk = pipelineRes.success;
  const pipelineClients = pipelineOk ? pipelineRes.data!.clients : [];
  const metrics = pipelineOk ? pipelineRes.data!.metrics : null;

  const byStage = metrics?.byStage;
  const activeInFlight =
    (byStage?.INTAKE_IN_PROGRESS ?? 0) + (byStage?.ASSESSMENT_IN_PROGRESS ?? 0);
  const totalAssigned = metrics?.total ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Welcome back{profile.user.firstName ? `, ${profile.user.firstName}` : ""}
            {profile.firmName ? ` · ${profile.firmName}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Use <span className="font-medium text-foreground">Pipeline</span> for the full client list, stages, and filters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="default">
            <Link href="/advisor/pipeline" className="inline-flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Open pipeline
              <ArrowRight className="h-4 w-4 opacity-80" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/advisor/invitations" className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite client
            </Link>
          </Button>
          <NotificationBell initialCount={unreadNotificationCount} />
        </div>
      </div>

      {!pipelineOk && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          Could not load pipeline metrics.{" "}
          <Link href="/advisor/pipeline" className="font-medium underline underline-offset-2">
            Try the pipeline page
          </Link>
          {pipelineRes.success === false && ` (${pipelineRes.error})`}
        </div>
      )}

      {pipelineOk && metrics && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Pipeline at a glance</h2>
            <Link
              href="/advisor/pipeline"
              className="text-xs font-medium text-primary hover:underline"
            >
              View full pipeline
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{totalAssigned}</p>
              <p className="text-xs text-muted-foreground">Assigned clients</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{pendingInvitationsCount}</p>
              <p className="text-xs text-muted-foreground">Pending invitations</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{byStage!.INTAKE_COMPLETE}</p>
              <p className="text-xs text-muted-foreground">Awaiting your review</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{activeInFlight}</p>
              <p className="text-xs text-muted-foreground">Intake / assessment active</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{metrics.documentsNeeded}</p>
              <p className="text-xs text-muted-foreground">Need documents</p>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{metrics.stalled}</p>
              <p className="text-xs text-muted-foreground">Stalled (7+ days)</p>
            </div>
          </div>
        </div>
      )}

      {pipelineOk && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Needs attention</h2>
            <Link
              href="/advisor/pipeline"
              className="text-sm font-medium text-primary hover:underline"
            >
              All clients
            </Link>
          </div>
          {totalAssigned === 0 && pendingInvitationsCount === 0 ? (
            <div className="hero-surface rounded-lg p-8 text-center">
              <div className="space-y-3">
                <p className="text-muted-foreground">No clients assigned yet.</p>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/advisor/invitations"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Invite a client
                  </Link>{" "}
                  or contact your administrator to get started.
                </p>
              </div>
            </div>
          ) : (
            <AdvisorNeedsAttention clients={pipelineClients} />
          )}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Shortcuts</h2>
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
                    Stages, filters, and client drill-down with live updates
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
                    Client cyber risk scores and assessment status
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
                    Identity exposure and privacy risk scores
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
                  <h3 className="font-semibold group-hover:text-primary">Invitations</h3>
                  <p className="text-sm text-muted-foreground">Send and manage invitations</p>
                  {pendingInvitationsCount > 0 && (
                    <p className="text-xs text-amber-600">
                      {pendingInvitationsCount} pending invitation
                      {pendingInvitationsCount === 1 ? "" : "s"}
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
                  <p className="text-sm text-muted-foreground">Branding and preferences</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
