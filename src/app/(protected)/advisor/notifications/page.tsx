import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="p-0">
          <Link href="/advisor" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="editorial-kicker text-gray-600">Notifications</p>
          <h1 className="editorial-heading-2 text-gray-900">
            All Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} unread
              </span>
            )}
          </h1>
        </div>

        <MarkAllReadButton notificationsExist={notifications.length > 0} />
      </div>

      {/* Notification List */}
      <NotificationList notifications={notifications} />
    </div>
  );
}