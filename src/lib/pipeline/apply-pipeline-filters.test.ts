import { describe, expect, it } from "vitest";

import { applyPipelineFilters } from "./apply-pipeline-filters";
import type { PipelineClient } from "./types";

function makeClient(
  overrides: Partial<PipelineClient> & Pick<PipelineClient, "id" | "assignedAdvisorProfileId">,
): PipelineClient {
  return {
    name: "Client",
    firstName: null,
    lastName: null,
    email: "client@example.com",
    clientReferenceCode: "CL-AAAA-BBBB",
    pseudonymousWorkspaceLabeling: false,
    assignedAt: new Date("2026-01-01"),
    assignedAdvisorLabel: null,
    stage: "REGISTERED",
    progress: 10,
    lastActivity: new Date("2026-01-02"),
    stalled: false,
    awaitingIntakeReview: false,
    intakeReviewInterviewId: null,
    documentsNeeded: false,
    staleScores: false,
    invitation: null,
    intake: null,
    assessment: null,
    documents: { required: 0, fulfilled: 0 },
    ...overrides,
  };
}

describe("applyPipelineFilters", () => {
  it("filters clients to the selected assigned advisor", () => {
    const clients = [
      makeClient({ id: "c1", assignedAdvisorProfileId: "adv-a" }),
      makeClient({ id: "c2", assignedAdvisorProfileId: "adv-b" }),
    ];

    const filtered = applyPipelineFilters(clients, {
      assignedAdvisorId: "adv-a",
      sortBy: "lastActivity",
      sortDir: "desc",
    });

    expect(filtered.map((c) => c.id)).toEqual(["c1"]);
  });
});
