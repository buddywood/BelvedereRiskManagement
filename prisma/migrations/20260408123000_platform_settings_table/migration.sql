-- Baseline DBs that used `migrate resolve --applied` on the squashed migration without running SQL:
-- PlatformSettings may be missing even though migration history says "up to date".
-- IF NOT EXISTS keeps this safe when the table was already created by a full squashed apply.

CREATE TABLE IF NOT EXISTS "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "advisorGovernanceDashboardEnabled" BOOLEAN NOT NULL DEFAULT true,
    "advisorRiskIntelligenceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PlatformSettings" ("id", "advisorGovernanceDashboardEnabled", "advisorRiskIntelligenceEnabled", "updatedAt")
VALUES ('default', true, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
