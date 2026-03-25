import type { SubscriptionTier } from "@prisma/client";

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  STARTER: 10,
  GROWTH: 25,
  PROFESSIONAL: 75,
};
