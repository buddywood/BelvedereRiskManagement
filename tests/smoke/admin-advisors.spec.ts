import { test, expect } from "@playwright/test";
import { SignInPage } from "../page-objects/SignInPage";
import { USERS } from "../fixtures/users";

test.describe("admin advisors", () => {
  test("admin can view advisors list with at least one row", async ({ page }) => {
    await new SignInPage(page).signInAs("admin");

    await page.goto("/admin/advisors");

    await expect(
      page.getByRole("heading", { name: /^advisor accounts \(\d+\)$/i })
    ).toBeVisible();

    await expect(page.getByText(USERS.advisor.email).first()).toBeVisible();
  });
});
