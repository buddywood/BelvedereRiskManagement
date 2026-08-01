import { describe, expect, it } from "vitest";
import {
  resolveBuildFromEnv,
  rollUpPlatformHealth,
  summarizeIntegrationCoverage,
  type ServiceHealth,
} from "@/lib/admin/operations-health";

function svc(
  partial: Pick<ServiceHealth, "id" | "status" | "configured"> &
    Partial<ServiceHealth>
): ServiceHealth {
  return {
    label: partial.label ?? partial.id,
    description: partial.description ?? partial.id,
    ...partial,
  };
}

describe("resolveBuildFromEnv", () => {
  it("prefers Vercel SHA/ref with build-injected commit date", () => {
    expect(
      resolveBuildFromEnv({
        VERCEL_GIT_COMMIT_SHA: "89984027039ff6231b4bad849cfb710683e0c265",
        VERCEL_GIT_COMMIT_REF: "staging",
        BUILD_GIT_COMMIT_DATE: "2026-05-19T03:00:00.000Z",
      })
    ).toEqual({
      shortSha: "8998402",
      ref: "staging",
      committedAt: "2026-05-19T03:00:00.000Z",
    });
  });

  it("falls back to BUILD_GIT_* for local dev", () => {
    expect(
      resolveBuildFromEnv({
        BUILD_GIT_COMMIT_SHA: "abcdef1234567890",
        BUILD_GIT_COMMIT_REF: "staging",
        BUILD_GIT_COMMIT_DATE: "2026-05-18T12:00:00-05:00",
      })
    ).toEqual({
      shortSha: "abcdef1",
      ref: "staging",
      committedAt: "2026-05-18T12:00:00-05:00",
    });
  });

  it("returns nulls when no git metadata is present", () => {
    expect(resolveBuildFromEnv({})).toEqual({
      shortSha: null,
      ref: null,
      committedAt: null,
    });
  });
});

describe("rollUpPlatformHealth", () => {
  it("stays healthy when unconfigured integrations are unknown", () => {
    expect(
      rollUpPlatformHealth(
        svc({ id: "app", status: "healthy", configured: true }),
        svc({ id: "database", status: "healthy", configured: true }),
        svc({ id: "auth", status: "healthy", configured: true }),
        svc({
          id: "openai-narratives",
          status: "unknown",
          configured: false,
          label: "AI Narratives (GPT-4o)",
        }),
        svc({ id: "redis", status: "unknown", configured: false })
      )
    ).toBe("healthy");
  });

  it("reports down when any included service is down", () => {
    expect(
      rollUpPlatformHealth(
        svc({ id: "app", status: "healthy", configured: true }),
        svc({ id: "database", status: "down", configured: true }),
        svc({ id: "narratives", status: "unknown", configured: false })
      )
    ).toBe("down");
  });

  it("reports degraded for missing CRON_SECRET even when configured=false", () => {
    expect(
      rollUpPlatformHealth(
        svc({ id: "app", status: "healthy", configured: true }),
        svc({ id: "cron-secret", status: "degraded", configured: false })
      )
    ).toBe("degraded");
  });

  it("reports unknown when a configured probe returns unknown", () => {
    expect(
      rollUpPlatformHealth(
        svc({ id: "app", status: "healthy", configured: true }),
        svc({ id: "stripe", status: "unknown", configured: true })
      )
    ).toBe("unknown");
  });
});

describe("summarizeIntegrationCoverage", () => {
  it("lists not-configured dependency labels", () => {
    expect(
      summarizeIntegrationCoverage([
        svc({
          id: "stripe",
          label: "Stripe (billing)",
          status: "healthy",
          configured: true,
        }),
        svc({
          id: "openai-narratives",
          label: "AI Narratives (GPT-4o)",
          status: "unknown",
          configured: false,
        }),
      ])
    ).toEqual({
      configured: 1,
      total: 2,
      notConfiguredLabels: ["AI Narratives (GPT-4o)"],
    });
  });
});
