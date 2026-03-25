import type Stripe from "stripe";

/**
 * Stripe API 2026+ types omit `current_period_end` on Subscription, but the API may
 * still return it. Derive a sensible period end for our DB when missing.
 */
export function currentPeriodEndFromStripeSubscription(sub: Stripe.Subscription): Date {
  const withLegacy = sub as Stripe.Subscription & { current_period_end?: number };
  if (typeof withLegacy.current_period_end === "number") {
    return new Date(withLegacy.current_period_end * 1000);
  }

  const latest = sub.latest_invoice;
  if (latest && typeof latest === "object" && "period_end" in latest) {
    const inv = latest as Stripe.Invoice;
    if (typeof inv.period_end === "number") {
      return new Date(inv.period_end * 1000);
    }
  }

  if (sub.cancel_at) {
    return new Date(sub.cancel_at * 1000);
  }
  if (sub.trial_end) {
    return new Date(sub.trial_end * 1000);
  }

  const fallback = new Date();
  fallback.setMonth(fallback.getMonth() + 1);
  return fallback;
}
