import { test, expect } from "@playwright/test";

import {
  ADVISOR2_TENANT_SLUG,
  tenantHostOrigin,
} from "../helpers/tenant-host";

test.describe("organizations and practitioners audience pages", () => {
  test("organizations page loads with hero and self-serve CTAs", async ({
    page,
  }) => {
    await page.goto("/organizations");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Know where you're exposed — without hiring a risk team/i,
      }),
    ).toBeVisible();

    const primary = page.getByTestId("organizations-primary-cta");
    await expect(primary).toHaveAttribute("href", "/signup/organization");
    await expect(primary).toHaveText(/Start your assessment/i);

    const secondary = page.getByTestId("organizations-secondary-cta");
    await expect(secondary).toHaveAttribute("href", "#pricing");

    await expect(page.getByText(/^Illustrative$/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Riverbend Community Foundation/i }),
    ).toBeVisible();
  });

  test("practitioners page loads with hero and self-serve CTAs", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Add a productized risk assessment to your practice/i,
      }),
    ).toBeVisible();

    const primary = page.getByTestId("practitioners-primary-cta");
    await expect(primary).toHaveAttribute("href", "/signup/practitioner");
    await expect(primary).toHaveText(/Create your practitioner workspace/i);

    const secondary = page.getByTestId("practitioners-secondary-cta");
    await expect(secondary).toHaveAttribute("href", "#pricing");

    await expect(page.getByText(/^Illustrative$/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Marta Kessler — Kessler Fractional Security/i,
      }),
    ).toBeVisible();
  });

  test("apex header shows four audience entries in order", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByTestId("site-nav-audience-advisors")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-organizations")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-practitioners")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-overview")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-families")).toHaveCount(0);

    const labels = await nav.locator("[data-testid^='site-nav-audience-']").allTextContents();
    expect(labels.map((label) => label.trim())).toEqual([
      "Advisors",
      "Organizations",
      "Practitioners",
      "How it works",
    ]);
  });

  test("organizations and practitioners pages include platform output samples", async ({
    page,
  }) => {
    await page.goto("/organizations");
    await expect(page.getByTestId("landing-product-preview")).toHaveAttribute(
      "data-audience",
      "organizations",
    );
    await expect(page.getByText(/Riverbend Community Foundation/i).first()).toBeVisible();

    await page.goto("/practitioners");
    await expect(page.getByTestId("landing-product-preview")).toHaveAttribute(
      "data-audience",
      "practitioners",
    );
    await expect(
      page.getByText(/Northline Architecture · Kessler Fractional Security/i).first(),
    ).toBeVisible();
  });

  test("organizations and practitioners nav items navigate to dedicated pages", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("site-nav-audience-organizations").click();
    await expect(page).toHaveURL(/\/organizations$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /without hiring a risk team/i,
      }),
    ).toBeVisible();

    await page.getByTestId("site-nav-audience-practitioners").click();
    await expect(page).toHaveURL(/\/practitioners$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /productized risk assessment/i,
      }),
    ).toBeVisible();
  });

  test("tenant pass-through about page hides Organizations and Practitioners nav", async ({
    page,
  }) => {
    const aboutUrl = `${tenantHostOrigin(ADVISOR2_TENANT_SLUG)}/about`;
    const response = await page.goto(aboutUrl);
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId("site-nav-audience-advisors")).toBeVisible();
    await expect(page.getByTestId("site-nav-audience-overview")).toBeVisible();

    await expect(page.getByTestId("site-nav-audience-families")).toHaveCount(0);
    await expect(page.getByTestId("site-nav-audience-organizations")).toHaveCount(0);
    await expect(page.getByTestId("site-nav-audience-practitioners")).toHaveCount(0);
  });

  test("tenant pass-through page hides every AKILI platform link", async ({
    page,
  }) => {
    // Demo / Pricing / Docs / About describe AKILI itself, so they must not
    // appear in the chrome of a white-labeled advisor portal.
    const response = await page.goto(
      `${tenantHostOrigin(ADVISOR2_TENANT_SLUG)}/about`,
    );
    expect(response?.status()).toBe(200);

    for (const label of ["Demo", "Pricing", "Docs"]) {
      await expect(
        page.getByRole("link", { name: label, exact: true }),
      ).toHaveCount(0);
    }
  });
});
