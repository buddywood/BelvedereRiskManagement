-- CreateTable
CREATE TABLE "AssessmentBankQuestion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "riskAreaId" TEXT NOT NULL,
    "sortOrderGlobal" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "text" TEXT NOT NULL,
    "helpText" TEXT,
    "learnMore" TEXT,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL,
    "weight" INTEGER NOT NULL,
    "scoreMap" JSONB NOT NULL,
    "branchingDependsOn" TEXT,
    "branchingPredicate" JSONB,
    "profileConditionKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentBankQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentBankQuestion_questionId_key" ON "AssessmentBankQuestion"("questionId");

-- CreateIndex
CREATE INDEX "AssessmentBankQuestion_riskAreaId_idx" ON "AssessmentBankQuestion"("riskAreaId");

-- CreateIndex
CREATE INDEX "AssessmentBankQuestion_riskAreaId_sortOrderGlobal_idx" ON "AssessmentBankQuestion"("riskAreaId", "sortOrderGlobal");

-- CreateIndex
CREATE INDEX "AssessmentBankQuestion_isVisible_sortOrderGlobal_idx" ON "AssessmentBankQuestion"("isVisible", "sortOrderGlobal");
