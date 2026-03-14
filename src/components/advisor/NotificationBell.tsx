"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  initialCount: number;
}

export function NotificationBell({ initialCount }: NotificationBellProps) {
  return (
    <Button asChild variant="ghost" size="sm" className="relative p-2">
      <Link href="/advisor/notifications">
        <Bell className="h-5 w-5" />
        {initialCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {initialCount > 99 ? '99+' : initialCount}
          </div>
        )}
        <span className="sr-only">
          {initialCount > 0
            ? `${initialCount} unread notifications`
            : 'No new notifications'
          }
        </span>
      </Link>
    </Button>
  );
}