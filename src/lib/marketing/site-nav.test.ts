import { describe, expect, it } from "vitest";

import {
  filterAudienceNavForHost,
  SITE_AUDIENCE_NAV,
} from "@/lib/marketing/site-nav";

describe("filterAudienceNavForHost", () => {
  it("returns four audience entries on Akili apex", () => {
    const items = filterAudienceNavForHost(true);
    expect(items.map((item) => item.id)).toEqual([
      "advisors",
      "organizations",
      "practitioners",
      "overview",
    ]);
    expect(items).toHaveLength(SITE_AUDIENCE_NAV.length);
  });

  it("omits akiliApexOnly entries on tenant hosts", () => {
    const items = filterAudienceNavForHost(false);
    expect(items.map((item) => item.id)).toEqual(["advisors", "overview"]);
    expect(items.every((item) => !item.akiliApexOnly)).toBe(true);
  });

  it("keeps Organizations and Practitioners as kind link", () => {
    const orgs = SITE_AUDIENCE_NAV.find((item) => item.id === "organizations");
    const pract = SITE_AUDIENCE_NAV.find((item) => item.id === "practitioners");
    expect(orgs).toMatchObject({
      kind: "link",
      href: "/organizations",
      akiliApexOnly: true,
    });
    expect(pract).toMatchObject({
      kind: "link",
      href: "/practitioners",
      akiliApexOnly: true,
    });
  });

  it("does not expose a separate Families audience tab", () => {
    expect(SITE_AUDIENCE_NAV.some((item) => item.id === "families")).toBe(false);
  });
});
