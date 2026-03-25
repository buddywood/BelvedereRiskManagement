import { describe, expect, it } from "vitest";

import { mapStripeSubscriptionStatus } from "./stripe-status";

describe("mapStripeSubscriptionStatus", () => {
  it("maps active and trialing to ACTIVE", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("ACTIVE");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("ACTIVE");
  });

  it("maps past_due and unpaid", () => {
    expect(mapStripeSubscriptionStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("UNPAID");
  });

  it("maps terminal states to CANCELLED", () => {
    expect(mapStripeSubscriptionStatus("canceled")).toBe("CANCELLED");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("CANCELLED");
  });
});
