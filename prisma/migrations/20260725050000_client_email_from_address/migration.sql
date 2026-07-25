-- Add custom "from" email address for white-label client emails

-- Add to AdvisorEnterprise (firm-level)
ALTER TABLE "AdvisorEnterprise" ADD COLUMN "clientEmailFromAddress" TEXT;

-- Add to AdvisorProfile (solo advisor level)
ALTER TABLE "AdvisorProfile" ADD COLUMN "clientEmailFromAddress" TEXT;
