import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationList } from "@/components/advisor/NotificationList";
import { getAdvisorNotificationsAction, markAllNotificationsReadAction } from "@/lib/actions/advisor-actions";
import { redirect } from "next/navigation";

async function MarkAllReadButton({ hasUnread }: { hasUnread: boolean }) {
  async function markAllRead() {
    "use server";
    await markAllNotificationsReadAction();
  }

  if (!hasUnread) {
    return null;
  }

  return (
    <form action={markAllRead}>
      <Button type="submit" variant="outline" size="sm" className="min-h-9 shrink-0">
        Mark all as read
      </Button>
    </form>
  );
}

export default async function NotificationsPage() {
  const result = await getAdvisorNotificationsAction();

  if (!result.success) {
    redirect("/advisor");
  }

  const notifications = result.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm ring-1 ring-border/30 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60"
              aria-hidden
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-snug text-foreground">
                {unreadCount > 0 ? "You have unread activity" : "You're all caught up"}
              </p>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {unreadCount > 0 ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="h-6 rounded-full px-2.5 font-semibold tabular-nums"
                      aria-label={`${unreadCount} unread notifications`}
                    >
                      {unreadCount} unread
                    </Badge>
                    <span className="leading-relaxed">Open a notification or mark all as read.</span>
                  </>
                ) : (
                  <span className="leading-relaxed">No unread notifications right now.</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" size="sm" asChild className="min-h-9">
              <Link href="/advisor/settings/notifications" className="inline-flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Notification settings
              </Link>
            </Button>
            <MarkAllReadButton hasUnread={unreadCount > 0} />
          </div>
        </div>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}
