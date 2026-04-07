import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationList } from "@/components/advisor/NotificationList";
import { getAdvisorNotificationsAction, markAllNotificationsReadAction } from "@/lib/actions/advisor-actions";
import { redirect } from "next/navigation";

async function MarkAllReadButton({ notificationsExist }: { notificationsExist: boolean }) {
  async function markAllRead() {
    "use server";
    await markAllNotificationsReadAction();
  }

  if (!notificationsExist) {
    return null;
  }

  return (
    <form action={markAllRead}>
      <Button type="submit" variant="outline" size="sm">
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
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {unreadCount > 0 ? (
              <>
                <Badge
                  variant="default"
                  className="tabular-nums"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount}
                </Badge>
                <span>unread</span>
              </>
            ) : (
              "You're all caught up."
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/advisor/settings/notifications" className="inline-flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" />
              Notification Settings
            </Link>
          </Button>
          <MarkAllReadButton notificationsExist={notifications.length > 0} />
        </div>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}