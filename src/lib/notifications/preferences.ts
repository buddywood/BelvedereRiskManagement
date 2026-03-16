import "server-only";

import { prisma } from "../db";
import { NotificationCategory, NotificationChannel, CATEGORY_TO_PREFERENCE_FIELD } from "./types";
import type { NotificationPreference } from "@prisma/client";

/**
 * Default notification preferences for new users
 */
export function getDefaultPreferences(): Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    emailEnabled: true,
    emailMilestones: true,
    emailReminders: true,
    emailStalled: true,
    emailRegistrations: true,
    reminderFrequencyDays: 7,
    quietStart: null,
    quietEnd: null,
  };
}

/**
 * Retrieves user notification preferences from database
 * Returns default preferences if none exist
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreference> {
  const existing = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  // Return defaults with placeholder IDs/dates (not saved to DB yet)
  const defaults = getDefaultPreferences();
  return {
    id: '',
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...defaults,
  };
}

/**
 * Updates user notification preferences (upsert operation)
 */
export async function updatePreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<NotificationPreference> {
  return await prisma.notificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      ...getDefaultPreferences(),
      ...updates,
    },
    update: updates,
  });
}

/**
 * Checks if current time is within user's quiet hours
 * Quiet hours are stored as UTC time strings (e.g., "22:00", "08:00")
 */
function isInQuietHours(quietStart: string | null, quietEnd: string | null): boolean {
  if (!quietStart || !quietEnd) {
    return false;
  }

  try {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const nowMinutes = utcHour * 60 + utcMinute;

    const parseTimeString = (timeStr: string) => {
      const [hours, minutes = 0] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTimeString(quietStart);
    const endMinutes = parseTimeString(quietEnd);

    // Handle quiet hours spanning midnight
    if (startMinutes > endMinutes) {
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    } else {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
  } catch {
    // Invalid time format - assume not in quiet hours
    return false;
  }
}

/**
 * Determines if a notification should be sent based on user preferences
 */
export async function shouldSendNotification(
  userId: string,
  category: NotificationCategory,
  channel: NotificationChannel
): Promise<boolean> {
  if (channel === 'in_app') {
    // In-app notifications are always sent (user can control via UI)
    return true;
  }

  if (channel === 'email') {
    const preferences = await getUserPreferences(userId);

    // Check if email notifications are enabled globally
    if (!preferences.emailEnabled) {
      return false;
    }

    // Check category-specific preference
    const preferenceField = CATEGORY_TO_PREFERENCE_FIELD[category];
    const categoryEnabled = preferences[preferenceField as keyof NotificationPreference] as boolean;

    if (!categoryEnabled) {
      return false;
    }

    // Check quiet hours for email notifications
    if (isInQuietHours(preferences.quietStart, preferences.quietEnd)) {
      return false;
    }

    return true;
  }

  return false;
}