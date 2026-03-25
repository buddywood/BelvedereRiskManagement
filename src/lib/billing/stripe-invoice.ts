import type Stripe from "stripe";

/** Resolves subscription id from Invoice (Stripe API 2026+ uses parent.subscription_details). */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (
    parent &&
    parent.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === "string" ? sub : sub.id;
  }
  const legacy = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;
  if (!legacy) return null;
  return typeof legacy === "string" ? legacy : legacy.id;
}
