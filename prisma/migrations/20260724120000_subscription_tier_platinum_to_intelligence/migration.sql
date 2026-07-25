-- Rename SubscriptionTier value PLATINUM -> INTELLIGENCE.
-- Label rename preserves the enum's ordinal position and automatically covers
-- Subscription.tier, SubscriptionAuditLog.previousTier, and .newTier.
-- Idempotent: skip if already renamed (shadow DB replays).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PLATINUM' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SubscriptionTier'))
     AND NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INTELLIGENCE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SubscriptionTier'))
  THEN
    ALTER TYPE "SubscriptionTier" RENAME VALUE 'PLATINUM' TO 'INTELLIGENCE';
  END IF;
END $$;
