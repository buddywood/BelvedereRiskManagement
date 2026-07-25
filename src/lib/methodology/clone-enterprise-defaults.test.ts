import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdvisorQuestionSource } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  enterpriseRecommendationRule: {
    count: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  recommendationRule: {
    findMany: vi.fn(),
  },
  advisorRecommendationRule: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  pillar: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import {
  backfillEnterpriseRecommendationRulePillarIds,
  cloneEnterpriseDefaultsIfNeeded,
  syncEnterpriseRulesToAdvisor,
} from "@/lib/methodology/clone-enterprise-defaults";

describe("cloneEnterpriseDefaultsIfNeeded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.pillar.findMany.mockResolvedValue([
      { id: "pillar-geo", slug: "geographic-environmental" },
    ]);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
      fn(prismaMock),
    );
  });

  it("infers pillarId from trigger condition arrays when cloning platform rules", async () => {
    prismaMock.enterpriseRecommendationRule.count.mockResolvedValue(0);
    prismaMock.recommendationRule.findMany.mockResolvedValue([
      {
        id: "platform-1",
        ruleName: "Geo hazard review",
        triggerConditions: [
          {
            type: "risk_level",
            pillarId: "geographic-environmental",
            operator: "in",
            value: ["high"],
          },
        ],
        serviceRecommendationId: "geographic_hazard_review",
        priority: 5,
      },
    ]);
    prismaMock.enterpriseRecommendationRule.create.mockResolvedValue({ id: "ent-1" });

    const cloned = await cloneEnterpriseDefaultsIfNeeded("enterprise-1");

    expect(cloned).toBe(true);
    expect(prismaMock.enterpriseRecommendationRule.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        enterpriseId: "enterprise-1",
        pillarId: "pillar-geo",
        sourceKind: AdvisorQuestionSource.PLATFORM,
        platformSourceId: "platform-1",
      }),
    });
  });
});

describe("backfillEnterpriseRecommendationRulePillarIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.pillar.findMany.mockResolvedValue([
      { id: "pillar-geo", slug: "geographic-environmental" },
    ]);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
      fn(prismaMock),
    );
  });

  it("updates enterprise rules missing pillarId", async () => {
    prismaMock.enterpriseRecommendationRule.findMany.mockResolvedValue([
      {
        id: "ent-rule-1",
        name: "Geo hazard review",
        triggerConditions: [
          {
            type: "risk_level",
            pillarId: "geographic-environmental",
            operator: "in",
            value: ["high"],
          },
        ],
        servicePayload: { serviceRecommendationId: "geographic_hazard_review" },
      },
    ]);
    prismaMock.enterpriseRecommendationRule.update.mockResolvedValue({ id: "ent-rule-1" });

    const updated = await backfillEnterpriseRecommendationRulePillarIds("enterprise-1");

    expect(updated).toBe(1);
    expect(prismaMock.enterpriseRecommendationRule.update).toHaveBeenCalledWith({
      where: { id: "ent-rule-1" },
      data: { pillarId: "pillar-geo" },
    });
  });
});

describe("syncEnterpriseRulesToAdvisor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.pillar.findMany.mockResolvedValue([]);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
      fn(prismaMock),
    );
  });

  it("adopts an existing platform rule instead of inserting a duplicate", async () => {
    prismaMock.enterpriseRecommendationRule.findMany.mockResolvedValue([
      {
        id: "enterprise-rule-1",
        pillarId: "pillar-1",
        sourceKind: AdvisorQuestionSource.PLATFORM,
        platformSourceId: "platform-rule-1",
        name: "Firm rule",
        triggerConditions: { riskLevel: "high" },
        servicePayload: { serviceId: "service-1" },
        priority: 10,
        isActive: true,
        pillar: null,
      },
    ]);
    prismaMock.advisorRecommendationRule.findMany.mockResolvedValue([
      {
        id: "advisor-rule-1",
        enterpriseSourceId: null,
        platformSourceId: "platform-rule-1",
        isActive: true,
      },
    ]);
    prismaMock.advisorRecommendationRule.update.mockResolvedValue({
      id: "advisor-rule-1",
    });

    const result = await syncEnterpriseRulesToAdvisor("enterprise-1", "advisor-1");

    expect(result).toEqual({ added: 1, deactivated: 0 });
    expect(prismaMock.advisorRecommendationRule.create).not.toHaveBeenCalled();
    expect(prismaMock.advisorRecommendationRule.update).toHaveBeenCalledWith({
      where: { id: "advisor-rule-1" },
      data: expect.objectContaining({
        enterpriseSourceId: "enterprise-rule-1",
        platformSourceId: "platform-rule-1",
        name: "Firm rule",
        priority: 10,
        isActive: true,
      }),
    });
  });
});
