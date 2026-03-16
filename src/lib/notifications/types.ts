import "server-only";

/**
 * Notification categories for logical grouping
 */
export type NotificationCategory = 'registration' | 'milestone' | 'reminder' | 'stalled' | 'system';

/**
 * Available notification delivery channels
 */
export type NotificationChannel = 'email' | 'in_app';

/**
 * Parameters for sending notifications
 */
export interface SendNotificationParams {
  /** User ID of the notification recipient */
  recipientUserId: string;
  /** Email address of the recipient */
  recipientEmail: string;
  /** Logical category of the notification */
  category: NotificationCategory;
  /** Notification title for in-app display */
  title: string;
  /** Notification message for in-app display */
  message: string;
  /** Optional reference ID for linking to specific records */
  referenceId?: string;
  /** Required for creating in-app notifications */
  advisorProfileId?: string;
  /** Email subject override (auto-generated if not provided) */
  emailSubject?: string;
  /** Email HTML content override (uses templates if not provided) */
  emailHtml?: string;
}

/**
 * Mapping from notification categories to preference field names
 */
export const CATEGORY_TO_PREFERENCE_FIELD: Record<NotificationCategory, string> = {
  'registration': 'emailRegistrations',
  'milestone': 'emailMilestones',
  'reminder': 'emailReminders',
  'stalled': 'emailStalled',
  'system': 'emailEnabled' // System notifications use the general email enabled flag
};