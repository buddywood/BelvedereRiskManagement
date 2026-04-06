-- Enhanced Advisor Branding System Migration
-- Extends AdvisorProfile with comprehensive branding fields

-- Add branding fields to AdvisorProfile
ALTER TABLE "AdvisorProfile" ADD COLUMN "brandName" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "tagline" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "primaryColor" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "secondaryColor" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "accentColor" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "websiteUrl" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "emailFooterText" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "supportEmail" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "supportPhone" TEXT;

-- S3 Asset Management (replace logoUrl with structured approach)
ALTER TABLE "AdvisorProfile" ADD COLUMN "logoS3Key" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "logoContentType" TEXT;
ALTER TABLE "AdvisorProfile" ADD COLUMN "logoFileSize" INTEGER;
ALTER TABLE "AdvisorProfile" ADD COLUMN "logoUploadedAt" TIMESTAMP;

-- Feature Control
ALTER TABLE "AdvisorProfile" ADD COLUMN "brandingEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AdvisorProfile" ADD COLUMN "customDomainEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Add constraints for data validation
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_tagline_length" CHECK (length("tagline") <= 150);
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_emailFooterText_length" CHECK (length("emailFooterText") <= 300);
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_primaryColor_hex" CHECK ("primaryColor" IS NULL OR "primaryColor" ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_secondaryColor_hex" CHECK ("secondaryColor" IS NULL OR "secondaryColor" ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_accentColor_hex" CHECK ("accentColor" IS NULL OR "accentColor" ~ '^#[0-9A-Fa-f]{6}$');

-- Add indexes for common queries
CREATE INDEX "AdvisorProfile_brandingEnabled_idx" ON "AdvisorProfile"("brandingEnabled");
CREATE INDEX "AdvisorProfile_logoS3Key_idx" ON "AdvisorProfile"("logoS3Key") WHERE "logoS3Key" IS NOT NULL;

-- Extend Subscription table with branding feature flags
ALTER TABLE "Subscription" ADD COLUMN "basicBrandingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN "advancedBrandingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN "customSubdomainEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN "whiteLabel" BOOLEAN NOT NULL DEFAULT false;

-- Update existing subscription tiers with branding features
UPDATE "Subscription" SET
  "basicBrandingEnabled" = true
  WHERE "tier" IN ('STARTER', 'GROWTH', 'PROFESSIONAL');

UPDATE "Subscription" SET
  "advancedBrandingEnabled" = true,
  "customSubdomainEnabled" = true
  WHERE "tier" IN ('GROWTH', 'PROFESSIONAL');

UPDATE "Subscription" SET
  "whiteLabel" = true
  WHERE "tier" = 'PROFESSIONAL';

-- Create AdvisorSubdomain table for custom subdomains
CREATE TABLE "AdvisorSubdomain" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "advisorId" TEXT NOT NULL UNIQUE,
  "subdomain" TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "dnsVerified" BOOLEAN NOT NULL DEFAULT false,
  "sslProvisioned" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP,
  "lastCheckedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT "AdvisorSubdomain_advisorId_fkey"
    FOREIGN KEY ("advisorId") REFERENCES "AdvisorProfile"("id")
    ON DELETE CASCADE,

  CONSTRAINT "AdvisorSubdomain_subdomain_format"
    CHECK ("subdomain" ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),

  CONSTRAINT "AdvisorSubdomain_subdomain_length"
    CHECK (length("subdomain") >= 3 AND length("subdomain") <= 20)
);

CREATE UNIQUE INDEX "AdvisorSubdomain_subdomain_key" ON "AdvisorSubdomain"("subdomain");
CREATE INDEX "AdvisorSubdomain_advisorId_idx" ON "AdvisorSubdomain"("advisorId");
CREATE INDEX "AdvisorSubdomain_active_idx" ON "AdvisorSubdomain"("isActive") WHERE "isActive" = true;

-- Create ReservedSubdomains table
CREATE TABLE "ReservedSubdomains" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "subdomain" TEXT NOT NULL UNIQUE,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Insert reserved subdomains
INSERT INTO "ReservedSubdomains" ("subdomain", "reason") VALUES
  ('api', 'API endpoint'),
  ('www', 'Main website'),
  ('app', 'Main application'),
  ('admin', 'Administrative interface'),
  ('mail', 'Email services'),
  ('ftp', 'File transfer'),
  ('blog', 'Blog platform'),
  ('help', 'Help documentation'),
  ('support', 'Customer support'),
  ('dashboard', 'Main dashboard'),
  ('portal', 'Client portal'),
  ('billing', 'Billing system'),
  ('payment', 'Payment processing'),
  ('secure', 'Security services'),
  ('cdn', 'Content delivery network'),
  ('test', 'Testing environment'),
  ('staging', 'Staging environment'),
  ('dev', 'Development environment'),
  ('docs', 'Documentation'),
  ('status', 'Status page');

-- Create AdvisorBrandingAuditLog table
CREATE TABLE "AdvisorBrandingAuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "advisorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "previousValues" JSONB,
  "newValues" JSONB,
  "metadata" JSONB,
  "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
  "userId" TEXT NOT NULL,

  CONSTRAINT "AdvisorBrandingAuditLog_advisorId_fkey"
    FOREIGN KEY ("advisorId") REFERENCES "AdvisorProfile"("id")
    ON DELETE CASCADE
);

CREATE INDEX "AdvisorBrandingAuditLog_advisorId_idx" ON "AdvisorBrandingAuditLog"("advisorId");
CREATE INDEX "AdvisorBrandingAuditLog_timestamp_idx" ON "AdvisorBrandingAuditLog"("timestamp");
CREATE INDEX "AdvisorBrandingAuditLog_action_idx" ON "AdvisorBrandingAuditLog"("action");