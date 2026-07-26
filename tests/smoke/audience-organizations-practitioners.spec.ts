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

  test("apex header shows five audience entries in order", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByTestId("site-nav-audience-families")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-advisors")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-organizations")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-practitioners")).toBeVisible();
    await expect(nav.getByTestId("site-nav-audience-overview")).toBeVisible();

    const labels = await nav.locator("[data-testid^='site-nav-audience-']").allTextContents();
    expect(labels.map((label) => label.trim())).toEqual([
      "Families",
      "Firms",
      "Organizations",
      "Practitioners",
      "How It Works",
    ]);
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

    await expect(page.getByTestId("site-nav-audience-families")).toBeVisible();
    await expect(page.getByTestId("site-nav-audience-advisors")).toBeVisible();
    await expect(page.getByTestId("site-nav-audience-overview")).toBeVisible();

    await expect(page.getByTestId("site-nav-audience-organizations")).toHaveCount(0);
    await expect(page.getByTestId("site-nav-audience-practitioners")).toHaveCount(0);
  });
});
