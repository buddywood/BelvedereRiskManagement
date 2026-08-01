import { describe, expect, it } from "vitest";
import {
  parseHeroAudienceHash,
  parseHeroAudienceParam,
  resolveHeroAudience,
} from "@/components/home/hero/hero-audience-persistence";

describe("parseHeroAudienceParam", () => {
  it("accepts canonical and alias values", () => {
    expect(parseHeroAudienceParam("advisors")).toBe("advisors");
    expect(parseHeroAudienceParam("advisor")).toBe("advisors");
    expect(parseHeroAudienceParam("firms")).toBe("advisors");
    expect(parseHeroAudienceParam("families")).toBe("advisors");
    expect(parseHeroAudienceParam("family")).toBe("advisors");
    expect(parseHeroAudienceParam("consumer")).toBe("advisors");
    expect(parseHeroAudienceParam("overview")).toBe("overview");
  });

  it("rejects unknown values", () => {
    expect(parseHeroAudienceParam("")).toBeNull();
    expect(parseHeroAudienceParam("invalid")).toBeNull();
  });
});

describe("parseHeroAudienceHash", () => {
  it("parses hash fragments", () => {
    expect(parseHeroAudienceHash("#advisors")).toBe("advisors");
    expect(parseHeroAudienceHash("families")).toBe("advisors");
    expect(parseHeroAudienceHash("#overview")).toBe("overview");
  });
});

describe("resolveHeroAudience", () => {
  it("prefers pathname over query, hash, and storage", () => {
    expect(
      resolveHeroAudience({
        pathname: "/advisors",
        search: "?audience=overview",
        hash: "#overview",
        storage: "overview",
      })
    ).toBe("advisors");
  });

  it("maps legacy /families pathname to advisors", () => {
    expect(
      resolveHeroAudience({
        pathname: "/families",
        search: "",
        hash: "",
        storage: null,
      }),
    ).toBe("advisors");
  });

  it("prefers query over hash and storage", () => {
    expect(
      resolveHeroAudience({
        search: "?audience=overview",
        hash: "#advisors",
        storage: "advisors",
      })
    ).toBe("overview");
  });

  it("uses hash when query is absent", () => {
    expect(
      resolveHeroAudience({
        search: "",
        hash: "#advisors",
        storage: "overview",
      })
    ).toBe("advisors");
  });

  it("uses storage when query and hash are absent", () => {
    expect(
      resolveHeroAudience({
        search: "",
        hash: "",
        storage: "advisors",
      })
    ).toBe("advisors");
  });

  it("defaults to advisors", () => {
    expect(resolveHeroAudience({ search: "", hash: "", storage: null })).toBe(
      "advisors"
    );
  });
});
