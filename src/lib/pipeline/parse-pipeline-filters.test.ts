import { describe, expect, it } from "vitest";

import {
  buildPipelineHref,
  parsePipelineFiltersFromSearchParams,
} from "./parse-pipeline-filters";

describe("parse-pipeline-filters", () => {
  it("parses assessmentInProgress from search params", () => {
    expect(
      parsePipelineFiltersFromSearchParams({ assessmentInProgress: "1" }),
    ).toMatchObject({
      assessmentInProgress: true,
    });
  });

  it("builds assessmentInProgress href", () => {
    expect(
      buildPipelineHref({ assessmentInProgress: true, sortBy: "lastActivity", sortDir: "desc" }, 1),
    ).toBe("/advisor/pipeline?assessmentInProgress=1");
  });

  it("parses and builds assigned advisor filter", () => {
    expect(
      parsePipelineFiltersFromSearchParams({ advisor: "adv-profile-1" }),
    ).toMatchObject({
      assignedAdvisorId: "adv-profile-1",
    });
    expect(
      buildPipelineHref(
        {
          assignedAdvisorId: "adv-profile-1",
          sortBy: "lastActivity",
          sortDir: "desc",
        },
        2,
      ),
    ).toBe("/advisor/pipeline?advisor=adv-profile-1&page=2");
  });
});
