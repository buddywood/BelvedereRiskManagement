-- Six-pillar taxonomy: add governance; health → insurance (financial-asset-protection); dma/dc → governance
UPDATE "AssessmentBankQuestion"
SET "riskAreaId" = 'financial-asset-protection'
WHERE "riskAreaId" = 'health-medical-preparedness';

UPDATE "AssessmentBankQuestion"
SET "riskAreaId" = 'governance'
WHERE "questionId" IN (
  'dma-01', 'dma-02', 'dma-03', 'dma-04', 'dma-05', 'dma-06', 'dma-07', 'dma-08',
  'dc-01', 'dc-02', 'dc-03', 'dc-04', 'dc-05', 'dc-06', 'dc-07', 'dc-08'
);
