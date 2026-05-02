import type { SubscriptionStatus } from "@prisma/client";

function subscriptionAllowsProductUse(
  status: SubscriptionStatus,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean
): boolean {
  if (status === "UNPAID") return false;
  if (status === "CANCELLED") {
    if (cancelAtPeriodEnd && currentPeriodEnd > new Date()) return true;
    return false;
  }
  if (status === "GRACE_PERIOD") {
    return currentPeriodEnd > new Date();
  }
  return status === "ACTIVE" || status === "PAST_DUE";
}

/** Subscription row exists and status allows advisor hub (aligned with client-limit rules). */
export function subscriptionEntitlesAdvisorPortal(
  sub: {
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null
): boolean {
  if (!sub) return false;
  return subscriptionAllowsProductUse(sub.status, sub.currentPeriodEnd, sub.cancelAtPeriodEnd);
}

/**
 * Admin may turn portal on when the subscription entitles portal use. With billing on, a Stripe
 * subscription id is required for most statuses; **grace period** before `currentPeriodEnd` can
 * qualify without one (time-bounded access, e.g. migration rows or Stripe id not yet synced).
 */
export function subscriptionQualifiesForPortalEnablement(
  sub: {
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId: string | null;
  } | null,
  billingFeaturesEnabled: boolean
): boolean {
  if (!sub || !subscriptionEntitlesAdvisorPortal(sub)) return false;
  if (!billingFeaturesEnabled) return true;
  if (sub.stripeSubscriptionId?.trim()) return true;
  return sub.status === "GRACE_PERIOD" && sub.currentPeriodEnd > new Date();
}
