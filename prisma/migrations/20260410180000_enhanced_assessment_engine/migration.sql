-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- CreateTable
CREATE TABLE "ServiceRecommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "estimatedCost" TEXT,
    "timeframe" TEXT,
    "provider" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "conditions" JSONB NOT NULL,
    "scoreModifiers" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationRule" (
    "id" TEXT NOT NULL,
    "serviceRecommendationId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "description" TEXT,
    "triggerConditions" JSONB NOT NULL,
    "pillarThresholds" JSONB,
    "questionConditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentRecommendation" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "serviceRecommendationId" TEXT NOT NULL,
    "triggerReason" JSONB NOT NULL,
    "customization" JSONB,
    "priority" INTEGER NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "advisorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillarConfiguration" (
    "id" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "thresholds" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PillarConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategoryConfiguration" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "pillarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategoryConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleExecution" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRecommendation_category_priority_idx" ON "ServiceRecommendation"("category", "priority");

-- CreateIndex
CREATE INDEX "ServiceRecommendation_isActive_idx" ON "ServiceRecommendation"("isActive");

-- CreateIndex
CREATE INDEX "ScoringRule_questionId_idx" ON "ScoringRule"("questionId");

-- CreateIndex
CREATE INDEX "ScoringRule_isActive_priority_idx" ON "ScoringRule"("isActive", "priority");

-- CreateIndex
CREATE INDEX "RecommendationRule_serviceRecommendationId_idx" ON "RecommendationRule"("serviceRecommendationId");

-- CreateIndex
CREATE INDEX "RecommendationRule_isActive_priority_idx" ON "RecommendationRule"("isActive", "priority");

-- CreateIndex
CREATE INDEX "AssessmentRecommendation_assessmentId_idx" ON "AssessmentRecommendation"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentRecommendation_status_idx" ON "AssessmentRecommendation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentRecommendation_assessmentId_serviceRecommendation_key" ON "AssessmentRecommendation"("assessmentId", "serviceRecommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "PillarConfiguration_pillarId_key" ON "PillarConfiguration"("pillarId");

-- CreateIndex
CREATE INDEX "PillarConfiguration_pillarId_idx" ON "PillarConfiguration"("pillarId");

-- CreateIndex
CREATE INDEX "PillarConfiguration_isActive_idx" ON "PillarConfiguration"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategoryConfiguration_subcategoryId_key" ON "SubCategoryConfiguration"("subcategoryId");

-- CreateIndex
CREATE INDEX "SubCategoryConfiguration_pillarId_sortOrder_idx" ON "SubCategoryConfiguration"("pillarId", "sortOrder");

-- CreateIndex
CREATE INDEX "SubCategoryConfiguration_isActive_idx" ON "SubCategoryConfiguration"("isActive");

-- CreateIndex
CREATE INDEX "RuleExecution_assessmentId_idx" ON "RuleExecution"("assessmentId");

-- CreateIndex
CREATE INDEX "RuleExecution_ruleType_executedAt_idx" ON "RuleExecution"("ruleType", "executedAt");

-- AddForeignKey
ALTER TABLE "RecommendationRule" ADD CONSTRAINT "RecommendationRule_serviceRecommendationId_fkey" FOREIGN KEY ("serviceRecommendationId") REFERENCES "ServiceRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecommendation" ADD CONSTRAINT "AssessmentRecommendation_serviceRecommendationId_fkey" FOREIGN KEY ("serviceRecommendationId") REFERENCES "ServiceRecommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleExecution" ADD CONSTRAINT "RuleExecution_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
