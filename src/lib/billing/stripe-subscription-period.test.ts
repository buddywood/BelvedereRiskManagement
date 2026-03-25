import { describe, expect, it } from "vitest";

import { currentPeriodEndFromStripeSubscription } from "./stripe-subscription-period";

describe("currentPeriodEndFromStripeSubscription", () => {
  it("uses current_period_end when present on payload", () => {
    const sub = {
      latest_invoice: null,
      cancel_at: null,
      trial_end: null,
      current_period_end: 1_700_000_000,
    } as unknown as import("stripe").Stripe.Subscription;

    const d = currentPeriodEndFromStripeSubscription(sub);
    expect(d.getTime()).toBe(1_700_000_000_000);
  });

  it("uses expanded latest_invoice.period_end when legacy field missing", () => {
    const sub = {
      latest_invoice: { period_end: 1_800_000_000 },
      cancel_at: null,
      trial_end: null,
    } as unknown as import("stripe").Stripe.Subscription;

    const d = currentPeriodEndFromStripeSubscription(sub);
    expect(d.getTime()).toBe(1_800_000_000_000);
  });
});
