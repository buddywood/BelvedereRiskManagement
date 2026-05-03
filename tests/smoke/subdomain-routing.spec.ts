import { test, expect } from "@playwright/test";

/**
 * Subdomain-based white-label routing.
 *
 * Architecture (Next.js 16 `proxy.ts` convention):
 *  - `src/proxy.ts` extracts subdomain from `Host`, looks up `AdvisorSubdomain`
 *    via `getAdvisorBySubdomain` (requires `isActive=true` AND `brandingEnabled=true`)
 *  - If `isActive && dnsVerified` -> rewrites to `/branded/<path>` with
 *    `x-advisor-id`/`x-subdomain` headers; the branded layout reads those
 *    and applies the advisor's branding.
 *  - If the row exists but `dnsVerified=false` -> static 404 HTML
 *    "Subdomain Not Available"
 *
 * Seeded fixtures (scripts/seed-advisor-test-data.js):
 *  - advisor2 -> AdvisorSubdomain `independent-wealth` (active+verified)
 *  - advisor3 -> AdvisorSubdomain `inactive-tenant` (active, NOT verified)
 *
 * Vercel: both `<sub>.akilirisk.com` are bound to the staging branch.
 */

const ACTIVE_SUBDOMAIN_URL = "https://independent-wealth.akilirisk.com/";
const INACTIVE_SUBDOMAIN_URL = "https://inactive-tenant.akilirisk.com/";

test.describe("subdomain routing", () => {
  test("active subdomain serves the branded client portal", async ({ page }) => {
    const response = await page.goto(ACTIVE_SUBDOMAIN_URL);
    expect(response?.status()).toBe(200);

    // Note: <title> is set to the root metadata "Belvedere Risk Management"
    // because src/app/layout.tsx exports static metadata that overrides the
    // branded layout's <title>. Body content reflects the correct advisor.

    await expect(
      page.getByRole("heading", { level: 1, name: /Independent Wealth Group/i })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /Comprehensive Family Risk Assessment/i })
    ).toBeVisible();

    const brandedMode = await page.evaluate(
      () => document.body.dataset.brandedMode
    );
    expect(brandedMode).toBe("true");

    await expect(page.getByText(/Powered by AkiliRisk Platform/i)).toBeVisible();

    const signInLink = page.getByRole("link", { name: /^Sign In$/i });
    await expect(signInLink.first()).toHaveAttribute(
      "href",
      "/branded/auth/signin"
    );
  });

  test("subdomain row that is active but not dnsVerified shows the Not Available page", async ({ page }) => {
    const response = await page.goto(INACTIVE_SUBDOMAIN_URL);
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", { name: /^Subdomain Not Available$/i })
    ).toBeVisible();
    await expect(
      page.getByText(/This subdomain is not currently active/i)
    ).toBeVisible();

    await expect(
      page.getByText(/Independent Wealth Group/i)
    ).not.toBeVisible();
  });
});
