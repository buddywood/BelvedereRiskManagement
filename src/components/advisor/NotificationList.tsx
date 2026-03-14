"use client";

import { Bell, RefreshCw, Info } from "lucide-react";
import { formatDistanceToNow, isToday, isThisWeek } from "date-fns";
import { useRouter } from "next/navigation";
import { markNotificationReadAction } from "@/lib/actions/advisor-actions";
import type { AdvisorNotification } from "@prisma/client";

interface NotificationListProps {
  notifications: AdvisorNotification[];
}

function getNotificationIcon(type: AdvisorNotification["type"]) {
  switch (type) {
    case "NEW_INTAKE":
      return Bell;
    case "INTAKE_UPDATED":
      return RefreshCw;
    case "SYSTEM":
      return Info;
    default:
      return Bell;
  }
}

function formatNotificationTime(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}

function groupNotificationsByDate(notifications: AdvisorNotification[]) {
  const today: AdvisorNotification[] = [];
  const thisWeek: AdvisorNotification[] = [];
  const older: AdvisorNotification[] = [];

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    if (isToday(date)) {
      today.push(notification);
    } else if (isThisWeek(date)) {
      thisWeek.push(notification);
    } else {
      older.push(notification);
    }
  });

  return { today, thisWeek, older };
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();

  const handleNotificationClick = async (notification: AdvisorNotification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await markNotificationReadAction(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to relevant page if referenceId exists
    if (notification.referenceId && notification.type === "NEW_INTAKE") {
      router.push(`/advisor/review/${notification.referenceId}`);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">No notifications yet</p>
      </div>
    );
  }

  const { today, thisWeek, older } = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {today.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Today</h3>
          <div className="space-y-2">
            {today.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative flex items-start p-4 rounded-lg border cursor-pointer transition-colors
                    ${
                      notification.read
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }
                  `}
                >
                  {!notification.read && (
                    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500"></div>
                  )}

                  <div className="flex-shrink-0 ml-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-gray-900" : "font-medium text-gray-900"}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatNotificationTime(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {thisWeek.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Earlier this week</h3>
          <div className="space-y-2">
            {thisWeek.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative flex items-start p-4 rounded-lg border cursor-pointer transition-colors
                    ${
                      notification.read
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }
                  `}
                >
                  {!notification.read && (
                    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500"></div>
                  )}

                  <div className="flex-shrink-0 ml-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-gray-900" : "font-medium text-gray-900"}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatNotificationTime(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {older.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Older</h3>
          <div className="space-y-2">
            {older.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative flex items-start p-4 rounded-lg border cursor-pointer transition-colors
                    ${
                      notification.read
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }
                  `}
                >
                  {!notification.read && (
                    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500"></div>
                  )}

                  <div className="flex-shrink-0 ml-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-gray-900" : "font-medium text-gray-900"}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatNotificationTime(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}