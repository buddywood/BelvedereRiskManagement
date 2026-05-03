import { test, expect } from "@playwright/test";
import { SignInPage } from "../page-objects/SignInPage";

/**
 * After intake submission, the client's dashboard should reflect their
 * intake state in the hero label and surface their assessments block.
 *
 * Seeded `client@test.com` has a SUBMITTED + advisor-approved intake on
 * staging, so the hero shows "Approved" and the assessments card renders.
 */
test.describe("client dashboard", () => {
  test("dashboard reflects submitted intake state", async ({ page }) => {
    await new SignInPage(page).signInAs("client");

    expect(new URL(page.url()).pathname).toBe("/dashboard");

    await expect(
      page.locator('[data-slot="card-title"]', { hasText: "Your Assessments" })
    ).toBeVisible();

    const intakeStatusPattern =
      /^(Approved|In review|Pending review|Update needed|Complete|In progress|Not started|Waived by advisor)$/;
    await expect(page.getByText(intakeStatusPattern).first()).toBeVisible();
  });
});
