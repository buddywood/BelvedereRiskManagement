-- Advisor-managed CRM-style client ID (distinct from system clientReferenceCode).
-- Stored on the advisor↔client assignment; staged on InviteCode until provision.
-- Postgres UNIQUE allows multiple NULLs, so unset IDs do not collide.

ALTER TABLE "InviteCode"
ADD COLUMN IF NOT EXISTS "external_client_id" TEXT;

ALTER TABLE "ClientAdvisorAssignment"
ADD COLUMN IF NOT EXISTS "external_client_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ClientAdvisorAssignment_advisorId_externalClientId_key"
ON "ClientAdvisorAssignment" ("advisorId", "external_client_id");

CREATE INDEX IF NOT EXISTS "InviteCode_createdBy_externalClientId_idx"
ON "InviteCode" ("createdBy", "external_client_id");
