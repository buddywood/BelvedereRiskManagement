-- AlterTable
ALTER TABLE "GovernanceReviewLead" ADD COLUMN     "assignedAdvisorId" TEXT,
ADD COLUMN     "assignedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "GovernanceReviewLead_assignedAdvisorId_idx" ON "GovernanceReviewLead"("assignedAdvisorId");

-- AddForeignKey
ALTER TABLE "GovernanceReviewLead" ADD CONSTRAINT "GovernanceReviewLead_assignedAdvisorId_fkey" FOREIGN KEY ("assignedAdvisorId") REFERENCES "AdvisorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
