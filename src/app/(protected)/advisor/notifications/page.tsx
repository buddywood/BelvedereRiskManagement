import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/advisor" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
          </p>
        </div>
        <MarkAllReadButton notificationsExist={notifications.length > 0} />
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}