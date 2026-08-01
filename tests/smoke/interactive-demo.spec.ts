import { test, expect } from "@playwright/test";

test.describe("interactive demo", () => {
  test("scores answers live and reaches the snapshot", async ({ page }) => {
    await page.goto("/demo");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /See your household risk profile take shape/i,
      }),
    ).toBeVisible();

    // Nothing scored before the first answer.
    await expect(page.getByTestId("demo-score-percent")).toHaveText("—");
    await expect(page.getByTestId("demo-next")).toBeDisabled();

    // Answer every question at "Critical gap" so the snapshot is deterministic.
    for (let index = 0; index < 6; index += 1) {
      await page.getByTestId("demo-option-0").click();
      await expect(page.getByTestId("demo-next")).toBeEnabled();
      await page.getByTestId("demo-next").click();
    }

    await expect(page.getByTestId("demo-result-heading")).toBeVisible();
    await expect(page.getByTestId("demo-score-percent")).toHaveText("0");
    await expect(page.getByTestId("demo-gap-list").getByRole("listitem")).toHaveCount(
      6,
    );

    // The demo is the site's primary CTA destination, so it must close on its
    // own: self-serve, talk-to-sales, and pricing all present.
    await expect(page.getByTestId("demo-self-serve-cta")).toHaveAttribute(
      "href",
      "/signup/advisor",
    );
    await expect(page.getByTestId("demo-sales-cta")).toHaveAttribute(
      "href",
      "/contact/demo",
    );
    await expect(page.getByTestId("demo-pricing-link")).toHaveAttribute(
      "href",
      "/pricing",
    );
  });

  test("live preview updates as answers are given", async ({ page }) => {
    await page.goto("/demo");

    await page.getByTestId("demo-option-3").click();
    await page.getByTestId("demo-next").click();

    // One question answered at maturity 3 → 100% resilience so far.
    await expect(page.getByTestId("demo-score-percent")).toHaveText("100");

    await page.getByTestId("demo-option-1").click();
    await expect(page.getByTestId("demo-score-percent")).toHaveText("67");
  });

  test("start over clears answers", async ({ page }) => {
    await page.goto("/demo");

    for (let index = 0; index < 6; index += 1) {
      await page.getByTestId("demo-option-2").click();
      await page.getByTestId("demo-next").click();
    }

    await expect(page.getByTestId("demo-score-percent")).toHaveText("67");
    await page.getByTestId("demo-restart").click();

    await expect(page.getByTestId("demo-score-percent")).toHaveText("—");
    await expect(page.getByTestId("demo-question-prompt")).toHaveText(
      /How are major household financial decisions made\?/i,
    );
  });

  test("audience variants render their own questions", async ({ page }) => {
    await page.goto("/demo/organizations");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /See where your organization's risk sits/i,
      }),
    ).toBeVisible();
    await expect(page.getByTestId("demo-question-prompt")).toHaveText(
      /How does your board oversee organizational risk\?/i,
    );
    await expect(page.getByTestId("demo-self-serve-cta")).toHaveCount(0);

    await page.getByTestId("demo-variant-practitioners").click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Walk a client engagement as a contract CISO/i,
      }),
    ).toBeVisible();
    await expect(page.getByTestId("demo-question-prompt")).toHaveText(
      /How does this client's leadership oversee information security\?/i,
    );
  });

  test("/demo/families redirects to the canonical demo URL", async ({ page }) => {
    await page.goto("/demo/families");
    await expect(page).toHaveURL(/\/demo$/);
  });
});
