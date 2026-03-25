import "server-only";

import type { BillingCycle, SubscriptionTier } from "@prisma/client";

export { TIER_LIMITS } from "./constants";

export type TierBillingKey = `${SubscriptionTier}_${BillingCycle}`;

/** Map env-backed Stripe Price IDs to tier + billing cycle (set in Dashboard). */
export function getPriceIdPlanMap(): Record<
  string,
  { tier: SubscriptionTier; billingCycle: BillingCycle }
> {
  const entries: [string, { tier: SubscriptionTier; billingCycle: BillingCycle }][] = [];

  const add = (
    envVal: string | undefined,
    tier: SubscriptionTier,
    billingCycle: BillingCycle
  ) => {
    if (envVal?.trim()) {
      entries.push([envVal.trim(), { tier, billingCycle }]);
    }
  };

  add(process.env.STRIPE_PRICE_STARTER_MONTHLY, "STARTER", "MONTHLY");
  add(process.env.STRIPE_PRICE_STARTER_ANNUAL, "STARTER", "ANNUAL");
  add(process.env.STRIPE_PRICE_GROWTH_MONTHLY, "GROWTH", "MONTHLY");
  add(process.env.STRIPE_PRICE_GROWTH_ANNUAL, "GROWTH", "ANNUAL");
  add(process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY, "PROFESSIONAL", "MONTHLY");
  add(process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL, "PROFESSIONAL", "ANNUAL");

  return Object.fromEntries(entries);
}

export function getPriceIdForTier(
  tier: SubscriptionTier,
  billingCycle: BillingCycle
): string | undefined {
  const key =
    tier === "STARTER"
      ? billingCycle === "MONTHLY"
        ? "STRIPE_PRICE_STARTER_MONTHLY"
        : "STRIPE_PRICE_STARTER_ANNUAL"
      : tier === "GROWTH"
        ? billingCycle === "MONTHLY"
          ? "STRIPE_PRICE_GROWTH_MONTHLY"
          : "STRIPE_PRICE_GROWTH_ANNUAL"
        : billingCycle === "MONTHLY"
          ? "STRIPE_PRICE_PROFESSIONAL_MONTHLY"
          : "STRIPE_PRICE_PROFESSIONAL_ANNUAL";

  return process.env[key]?.trim() || undefined;
}

export function isBillingEnabled(): boolean {
  return process.env.ENABLE_BILLING_FEATURES !== "false";
}

export function billingGracePeriodDays(): number {
  const raw = process.env.BILLING_GRACE_PERIOD_DAYS;
  const n = raw ? Number.parseInt(raw, 10) : 14;
  return Number.isFinite(n) && n > 0 ? n : 14;
}
