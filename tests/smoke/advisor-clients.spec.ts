import { test, expect } from "@playwright/test";
import { SignInPage } from "../page-objects/SignInPage";
import { USERS } from "../fixtures/users";

test.describe("advisor pipeline", () => {
  test("advisor can view client list and open a client", async ({ page }) => {
    await new SignInPage(page).signInAs("advisor");

    await page.goto("/advisor/pipeline");
    await expect(
      page.getByRole("heading", { name: /pipeline overview/i })
    ).toBeVisible();

    const seededClientEmail = USERS.client.email;
    const clientRow = page
      .getByRole("link")
      .filter({ hasText: seededClientEmail })
      .first();

    await expect(clientRow).toBeVisible();
    const href = await clientRow.getAttribute("href");
    expect(href).toMatch(/^\/advisor\/pipeline\/[^/]+$/);

    await clientRow.click();

    await page.waitForURL(/\/advisor\/pipeline\/[^/]+$/, { timeout: 30_000 });
    await expect(page.getByText(seededClientEmail).first()).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
