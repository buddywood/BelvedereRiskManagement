import type { SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "unpaid":
      return "UNPAID";
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED";
    case "incomplete":
    case "paused":
      return "ACTIVE";
    default:
      return "ACTIVE";
  }
}
