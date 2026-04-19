-- Cybersecurity subcategory rows (runs after SubCategoryConfiguration exists in 20260410180000).
-- Idempotent upserts for the six rubric blocks referenced by cyber bank questions.

INSERT INTO "SubCategoryConfiguration" (
    "id",
    "subcategoryId",
    "pillarId",
    "name",
    "description",
    "baseWeight",
    "sortOrder",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
(
    replace(gen_random_uuid()::text, '-', ''),
    'household_governance',
    'cybersecurity',
    'Household Governance',
    'Family cyber governance and responsibility',
    1.0,
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    replace(gen_random_uuid()::text, '-', ''),
    'devices_network',
    'cybersecurity',
    'Devices & Network',
    'Device management and network security',
    1.0,
    2,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    replace(gen_random_uuid()::text, '-', ''),
    'accounts_access',
    'cybersecurity',
    'Accounts & Access',
    'Account security and access control',
    1.0,
    3,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    replace(gen_random_uuid()::text, '-', ''),
    'data_privacy',
    'cybersecurity',
    'Data & Privacy',
    'Data protection and privacy controls',
    1.0,
    4,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    replace(gen_random_uuid()::text, '-', ''),
    'financial_identity',
    'cybersecurity',
    'Financial & Identity Risk',
    'Financial and identity protection',
    1.0,
    5,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    replace(gen_random_uuid()::text, '-', ''),
    'incident_response',
    'cybersecurity',
    'Incident Response & Recovery',
    'Incident preparedness and recovery',
    1.0,
    6,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("subcategoryId") DO UPDATE SET
    "pillarId" = EXCLUDED."pillarId",
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "baseWeight" = EXCLUDED."baseWeight",
    "sortOrder" = EXCLUDED."sortOrder",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = EXCLUDED."updatedAt";
