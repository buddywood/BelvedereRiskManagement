-- Advisor may waive governance intake so the client can use assessment without submit/approve flow.
ALTER TABLE "ClientAdvisorAssignment"
ADD COLUMN "intakeWaivedAt" TIMESTAMP(3),
ADD COLUMN "intakeWaivedByAdvisorId" TEXT;

ALTER TABLE "ClientAdvisorAssignment"
ADD CONSTRAINT "ClientAdvisorAssignment_intakeWaivedByAdvisorId_fkey"
FOREIGN KEY ("intakeWaivedByAdvisorId") REFERENCES "AdvisorProfile" ("id")
ON DELETE SET NULL ON UPDATE CASCADE;
