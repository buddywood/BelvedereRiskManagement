import { test, expect } from "@playwright/test";
import { SignInPage } from "../page-objects/SignInPage";
import { USERS } from "../fixtures/users";

/**
 * Cross-advisor isolation: an advisor cannot view another advisor's client
 * via direct URL navigation. Enforced in `getClientDetail` (src/lib/pipeline/queries.ts):
 * if no ACTIVE ClientAdvisorAssignment exists for (advisor, client), it
 * throws "Client not found or not assigned to you", which the page handler
 * funnels into Next.js notFound().
 *
 * Setup:
 * - advisor@test.com has assigned clients (seeded)
 * - advisor2@test.com has no assigned clients (seeded)
 *
 * Test:
 * 1. Sign in as advisor1, walk to a client detail URL via the pipeline,
 *    capture the clientId from the URL.
 * 2. Sign out, sign in as advisor2.
 * 3. Navigate to /advisor/pipeline/{capturedClientId}.
 * 4. Assert Next.js 404 ("This page could not be found.") renders.
 */
test.describe("tenant isolation", () => {
  test("advisor cannot open another advisor's client via direct URL", async ({ page }) => {
    test.setTimeout(90_000);

    await new SignInPage(page).signInAs("advisor");
    await page.goto("/advisor/pipeline");

    const clientLink = page
      .getByRole("link")
      .filter({ hasText: USERS.client.email })
      .first();
    await expect(clientLink).toBeVisible();
    const clientHref = await clientLink.getAttribute("href");
    expect(clientHref).toMatch(/^\/advisor\/pipeline\/[^/]+$/);
    const clientPathOwnedByAdvisor1 = clientHref!;

    await page.context().clearCookies();

    await new SignInPage(page).signInAs("advisor2");

    await page.goto(clientPathOwnedByAdvisor1);

    await expect(
      page.getByRole("heading", { name: /^404$/ })
    ).toBeVisible();
    await expect(
      page.getByText(/This page could not be found/i)
    ).toBeVisible();
    await expect(
      page.getByText(USERS.client.email)
    ).not.toBeVisible();
  });
});
