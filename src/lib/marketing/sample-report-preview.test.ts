import { describe, expect, it } from "vitest";
import {
  PLATFORM_PILLAR_COUNT,
  SAMPLE_PILLAR_SCORES,
  SAMPLE_PILLARS_IN_SCOPE,
  getSampleReportPreview,
} from "@/lib/marketing/sample-report-preview";
import { maturityScoreToPercent } from "@/lib/assessment/governance-rubric";

describe("sample report preview", () => {
  it("models all ten platform pillars with advisor scoping", () => {
    expect(PLATFORM_PILLAR_COUNT).toBe(10);
    expect(SAMPLE_PILLAR_SCORES).toHaveLength(10);
    expect(SAMPLE_PILLARS_IN_SCOPE.length).toBeGreaterThan(0);
    expect(SAMPLE_PILLARS_IN_SCOPE.length).toBeLessThan(PLATFORM_PILLAR_COUNT);
    expect(SAMPLE_PILLAR_SCORES.some((pillar) => !pillar.inScope)).toBe(true);
  });

  it("provides short labels and scores for the pillar radar preview", () => {
    const outOfScope = SAMPLE_PILLAR_SCORES.filter((pillar) => !pillar.inScope);
    expect(outOfScope.map((pillar) => pillar.shortName).sort()).toEqual([
      "AI Risk",
      "Geographic",
    ]);

    for (const pillar of SAMPLE_PILLARS_IN_SCOPE) {
      expect(pillar.shortName.length).toBeLessThanOrEqual(12);
      expect(maturityScoreToPercent(pillar.maturity)).toBeGreaterThan(0);
    }
  });

  it("returns organization-specific board-ready sample output", () => {
    const sample = getSampleReportPreview("organizations");
    expect(sample.subjectLabel).toMatch(/Riverbend/i);
    expect(sample.resilienceLabel).toMatch(/Organizational/i);
    expect(sample.risks.some((risk) => /succession/i.test(risk.title))).toBe(true);
    expect(sample.pillarsInScope.map((pillar) => pillar.name)).toEqual(
      expect.arrayContaining([
        "Board & Oversight",
        "Funding & Financial Resilience",
        "Leadership Succession",
        "Regulatory & Funder Compliance",
        "Reputation & Safeguarding",
      ]),
    );
    expect(sample.pillarsInScope.some((pillar) => /Estate|Tax Exposure/i.test(pillar.name))).toBe(
      false,
    );
  });

  it("returns practitioner-specific client engagement sample output", () => {
    const sample = getSampleReportPreview("practitioners");
    expect(sample.subjectLabel).toMatch(/Kessler/i);
    expect(sample.resilienceLabel).toMatch(/Client/i);
    expect(sample.risks.some((risk) => /questionnaire|cyber/i.test(risk.title))).toBe(
      true,
    );
    expect(sample.pillarsInScope.map((pillar) => pillar.name)).toEqual(
      expect.arrayContaining([
        "Cyber & Access Controls",
        "Key-Person Continuity",
        "Insurance Adequacy",
        "Governance & Controls",
      ]),
    );
    expect(sample.pillarsInScope.some((pillar) => pillar.emphasized)).toBe(true);
    expect(
      sample.pillarsInScope.some((pillar) => /Estate & Succession|Tax Exposure/i.test(pillar.name)),
    ).toBe(false);
  });
});
