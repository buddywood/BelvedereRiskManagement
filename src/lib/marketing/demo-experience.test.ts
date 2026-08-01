import { describe, expect, it } from "vitest";

import { maturityScoreToPercent } from "@/lib/assessment/governance-rubric";
import {
  DEMO_AUDIENCES,
  demoQuestionOptions,
  getDemoExperience,
  isDemoAudience,
  listDemoExperiences,
  scoreDemoAnswers,
  type DemoAnswers,
  type DemoExperience,
  type DemoMaturityLevel,
} from "@/lib/marketing/demo-experience";
import { getSampleReportPreview } from "@/lib/marketing/sample-report-preview";

function answerAll(
  experience: DemoExperience,
  level: DemoMaturityLevel,
): DemoAnswers {
  return Object.fromEntries(
    experience.questions.map((question) => [question.id, level]),
  );
}

describe("demo experience content", () => {
  it("exposes one experience per audience with unique paths", () => {
    const experiences = listDemoExperiences();
    expect(experiences).toHaveLength(DEMO_AUDIENCES.length);
    expect(new Set(experiences.map((e) => e.path)).size).toBe(experiences.length);
    expect(getDemoExperience().audience).toBe("families");
  });

  it.each(DEMO_AUDIENCES)(
    "%s questions map to domains in that audience's catalog",
    (audience) => {
      const experience = getDemoExperience(audience);
      const slugs = new Set(
        getSampleReportPreview(audience).domains.map((domain) => domain.slug),
      );

      for (const question of experience.questions) {
        expect(slugs).toContain(question.domainSlug);
      }
    },
  );

  it.each(DEMO_AUDIENCES)("%s questions have unique ids and domains", (audience) => {
    const { questions } = getDemoExperience(audience);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    // One question per domain — the radar keys off domainSlug.
    expect(new Set(questions.map((q) => q.domainSlug)).size).toBe(questions.length);
  });

  it.each(DEMO_AUDIENCES)(
    "%s offers a self-serve path, a sales path, and pricing",
    (audience) => {
      // The demo is where the site's primary CTA lands, so every variant has
      // to close on its own rather than dead-ending.
      const { selfServeCta, salesCta, pricingLink } = getDemoExperience(audience);

      expect(selfServeCta.href).toMatch(/^\/signup\//);
      expect(salesCta.href).toBe("/contact/demo");
      expect(pricingLink.href).toBe("/pricing");
      for (const cta of [selfServeCta, salesCta, pricingLink]) {
        expect(cta.label.trim().length).toBeGreaterThan(0);
      }
    },
  );

  it("builds four rubric-labelled options per question", () => {
    const [question] = getDemoExperience("families").questions;
    const options = demoQuestionOptions(question);

    expect(options.map((option) => option.value)).toEqual([0, 1, 2, 3]);
    expect(options[0].label).toBe("Critical gap");
    expect(options[3].label).toBe("Institutionalized");
    expect(options.every((option) => option.description.length > 0)).toBe(true);
  });

  it("recognizes valid audiences only", () => {
    expect(isDemoAudience("practitioners")).toBe(true);
    expect(isDemoAudience("advisors")).toBe(false);
    expect(isDemoAudience(undefined)).toBe(false);
  });
});

describe("scoreDemoAnswers", () => {
  const experience = getDemoExperience("families");

  it("reports an empty state before any answer", () => {
    const result = scoreDemoAnswers(experience, {});

    expect(result.answeredCount).toBe(0);
    expect(result.complete).toBe(false);
    expect(result.maturity).toBe(0);
    expect(result.percent).toBe(0);
    expect(result.gaps).toEqual([]);
    expect(result.domains.every((domain) => !domain.inScope)).toBe(true);
  });

  it("brings answered domains into scope and leaves the rest dimmed", () => {
    const [first] = experience.questions;
    const result = scoreDemoAnswers(experience, { [first.id]: 2 });

    const scored = result.domains.filter((domain) => domain.inScope);
    expect(scored).toHaveLength(1);
    expect(scored[0].slug).toBe(first.domainSlug);
    expect(scored[0].maturity).toBe(2);
    expect(result.answeredCount).toBe(1);
    expect(result.complete).toBe(false);
  });

  it("averages answered questions only", () => {
    const [first, second] = experience.questions;
    const result = scoreDemoAnswers(experience, {
      [first.id]: 3,
      [second.id]: 1,
    });

    expect(result.maturity).toBe(2);
    expect(result.percent).toBe(maturityScoreToPercent(2));
    expect(result.answeredCount).toBe(2);
  });

  it("tiers a fully institutionalized profile as low risk", () => {
    const result = scoreDemoAnswers(experience, answerAll(experience, 3));

    expect(result.complete).toBe(true);
    expect(result.percent).toBe(100);
    expect(result.riskLevel).toBe("low");
    expect(result.gaps).toEqual([]);
    expect(result.strengths).toHaveLength(experience.questions.length);
  });

  it("tiers an absent-control profile as critical", () => {
    const result = scoreDemoAnswers(experience, answerAll(experience, 0));

    expect(result.percent).toBe(0);
    expect(result.riskLevel).toBe("critical");
    expect(result.gaps).toHaveLength(experience.questions.length);
    expect(result.gaps.every((gap) => gap.level === "critical")).toBe(true);
    expect(result.strengths).toEqual([]);
  });

  it("surfaces gaps at or below the remediation threshold, worst first", () => {
    const [absent, partial, formal] = experience.questions;
    const result = scoreDemoAnswers(experience, {
      [absent.id]: 0,
      [partial.id]: 1,
      [formal.id]: 2,
    });

    expect(result.gaps.map((gap) => gap.level)).toEqual(["critical", "high"]);
    expect(result.gaps[0].title).toBe(absent.gap.title);
    expect(result.gaps[1].title).toBe(partial.gap.title);
    expect(result.strengths).toHaveLength(1);
  });

  it("emphasizes the lowest-scoring answered domain", () => {
    const [first, second] = experience.questions;
    const result = scoreDemoAnswers(experience, {
      [first.id]: 3,
      [second.id]: 1,
    });

    const emphasized = result.domains.filter((domain) => domain.emphasized);
    expect(emphasized).toHaveLength(1);
    expect(emphasized[0].slug).toBe(second.domainSlug);
  });

  it("counts catalog domains the demo does not reach", () => {
    const catalogSize = getSampleReportPreview("families").domains.length;
    const result = scoreDemoAnswers(experience, {});

    expect(result.domainsBeyondDemo).toBe(
      catalogSize - experience.questions.length,
    );
    expect(result.domainsBeyondDemo).toBeGreaterThan(0);
  });

  it("ignores answers for questions outside the experience", () => {
    const result = scoreDemoAnswers(experience, { "not-a-question": 3 });

    expect(result.answeredCount).toBe(0);
    expect(result.percent).toBe(0);
  });
});
