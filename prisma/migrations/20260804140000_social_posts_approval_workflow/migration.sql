-- Social media posts with human-approval workflow for marketing campaigns.
-- Posts follow: DRAFT -> PENDING_REVIEW -> APPROVED -> PUBLISHED
-- Supports scheduled publishing via cron job.

-- Approval workflow status enum
CREATE TYPE "SocialPostStatus" AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'FAILED',
  'REJECTED',
  'CANCELLED'
);

-- Supported social platforms enum (extensible)
CREATE TYPE "SocialPlatform" AS ENUM ('X');

-- Content theme/category enum for organization and analytics
CREATE TYPE "SocialContentTheme" AS ENUM (
  'CYBER_SECURITY',
  'IDENTITY_PROTECTION',
  'FAMILY_SAFETY',
  'RISK_ASSESSMENT',
  'PRODUCT_UPDATE',
  'INDUSTRY_NEWS',
  'THOUGHT_LEADERSHIP',
  'ENGAGEMENT',
  'PROMOTIONAL',
  'OTHER'
);

-- Main social posts table
CREATE TABLE "social_posts" (
  "id" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL DEFAULT 'X',
  "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',

  -- Content
  "content" TEXT NOT NULL,
  "thread_content" JSONB,
  "is_thread" BOOLEAN NOT NULL DEFAULT false,
  "theme" "SocialContentTheme" NOT NULL DEFAULT 'OTHER',
  "tags" JSONB,

  -- Scheduling
  "scheduled_at" TIMESTAMP(3),
  "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,

  -- Workflow tracking
  "created_by_id" TEXT NOT NULL,
  "approved_by_id" TEXT,
  "approved_at" TIMESTAMP(3),
  "rejection_reason" TEXT,
  "rejected_by_id" TEXT,
  "rejected_at" TIMESTAMP(3),

  -- Publish result tracking
  "platform_post_id" TEXT,
  "platform_post_url" TEXT,
  "published_at" TIMESTAMP(3),
  "publish_response" JSONB,
  "publish_error" TEXT,
  "publish_attempts" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" TIMESTAMP(3),

  -- Performance metrics (populated by analytics job)
  "impressions" INTEGER,
  "engagements" INTEGER,
  "metrics_synced_at" TIMESTAMP(3),

  -- Timestamps
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- Foreign key constraints
ALTER TABLE "social_posts"
ADD CONSTRAINT "social_posts_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "social_posts"
ADD CONSTRAINT "social_posts_approved_by_id_fkey"
FOREIGN KEY ("approved_by_id") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "social_posts"
ADD CONSTRAINT "social_posts_rejected_by_id_fkey"
FOREIGN KEY ("rejected_by_id") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for common queries
CREATE INDEX "social_posts_status_idx" ON "social_posts"("status");
CREATE INDEX "social_posts_status_scheduled_at_idx" ON "social_posts"("status", "scheduled_at");
CREATE INDEX "social_posts_platform_status_idx" ON "social_posts"("platform", "status");
CREATE INDEX "social_posts_theme_idx" ON "social_posts"("theme");
CREATE INDEX "social_posts_created_by_id_idx" ON "social_posts"("created_by_id");
CREATE INDEX "social_posts_scheduled_at_idx" ON "social_posts"("scheduled_at");
