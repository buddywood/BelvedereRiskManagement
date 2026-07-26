import { describe, expect, it } from "vitest";

import {
  filterAudienceNavForHost,
  filterPrimaryNavForHost,
  SITE_AUDIENCE_NAV,
  SITE_PRIMARY_NAV_LINKS,
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

describe("filterPrimaryNavForHost", () => {
  it("surfaces the interactive demo ahead of pricing on Akili apex", () => {
    const hrefs = filterPrimaryNavForHost(true).map((link) => link.href);
    expect(hrefs).toEqual(["/demo", "/pricing", "/docs", "/about"]);
  });

  it("drops every platform link on tenant hosts", () => {
    // Demo, Pricing, Docs, and About all describe AKILI itself — none of them
    // belong in the chrome of an advisor's white-labeled portal.
    expect(filterPrimaryNavForHost(false)).toEqual([]);
  });

  it("marks all primary links akiliApexOnly", () => {
    expect(
      SITE_PRIMARY_NAV_LINKS.every((link) => link.akiliApexOnly === true),
    ).toBe(true);
  });
});
