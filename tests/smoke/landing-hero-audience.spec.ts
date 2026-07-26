import { test, expect } from "@playwright/test";

test.describe("landing hero audience paths", () => {
  test("advisors tab is default and exposes practice CTAs", async ({ page }) => {
    await page.goto("/");

    const panel = page.getByTestId("landing-hero-panel");
    await expect(panel).toHaveAttribute("data-audience", "advisors");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /governance intelligence for family offices, RIAs, and broker-dealers/i,
      })
    ).toBeVisible();

    const primary = page.getByTestId("landing-hero-primary-cta");
    await expect(primary).toHaveText(/Advisor Sign In/i);
    await expect(primary).toHaveAttribute("href", "/signin/advisor");

    const secondary = page.getByTestId("landing-hero-secondary-cta");
    await expect(secondary).toHaveText(/Request Demo/i);
    await expect(secondary).toHaveAttribute("href", "/contact/demo");

    await expect(page.getByTestId("landing-hero-feature-cards")).toBeVisible();
    await expect(page.getByText("Multi-household pipeline")).toBeVisible();
    await expect(page.getByText("Practice-ready scoring")).toBeVisible();
    await expect(page.getByText("Built for offices & RIAs")).toBeVisible();
  });

  test("advisors nav shows wealth-practice workspace copy and CTAs", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.getByTestId("site-nav-audience-advisors").click();

    const panel = page.getByTestId("landing-hero-panel");
    await expect(panel).toHaveAttribute("data-audience", "advisors");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /governance intelligence for family offices, RIAs, and broker-dealers/i,
      })
    ).toBeVisible();
  });

  test("how it works nav shows workflow copy and practice CTAs", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("site-nav-audience-overview").click();

    const panel = page.getByTestId("landing-hero-panel");
    await expect(panel).toHaveAttribute("data-audience", "overview");
    await expect(
      page.getByRole("heading", { level: 1, name: /Assess\. Analyze\. Act\./i })
    ).toBeVisible();
    await expect(page.getByTestId("landing-hero-overview-steps")).toBeVisible();

    const primary = page.getByTestId("landing-hero-primary-cta");
    await expect(primary).toHaveText(/Advisor Sign In/i);
    await expect(primary).toHaveAttribute("href", "/signin/advisor");

    const secondary = page.getByTestId("landing-hero-secondary-cta");
    await expect(secondary).toHaveText(/Request Demo/i);
    await expect(secondary).toHaveAttribute("href", "/contact/demo");

    await expect(page.getByTestId("landing-hero-workflow-link")).toHaveAttribute(
      "href",
      "#how-it-works"
    );
  });

  test("?audience=overview deep-links the overview tab", async ({ page }) => {
    await page.goto("/?audience=overview");

    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "overview"
    );
    await expect(page).toHaveURL(/\/how-it-works|audience=overview/);
    await expect(
      page.getByRole("button", { name: /How it works/i, pressed: true })
    ).toBeVisible();
  });

  test("?audience=advisors deep-links the advisor tab", async ({ page }) => {
    await page.goto("/?audience=advisors");

    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "advisors"
    );
    await expect(page).toHaveURL(/\/advisors|audience=advisors/);
    await expect(
      page.getByRole("button", { name: /Advisors/i, pressed: true })
    ).toBeVisible();
  });

  test("legacy ?audience=families redirects into advisors", async ({ page }) => {
    await page.goto("/?audience=families");

    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "advisors"
    );
    await expect(page).toHaveURL(/\/advisors/);
  });

  test("#advisors hash deep-links the advisor tab", async ({ page }) => {
    await page.goto("/#advisors");

    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "advisors"
    );
  });

  test("request demo pre-fills the contact form", async ({ page }) => {
    await page.goto("/?audience=advisors");
    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "advisors"
    );
    const demoCta = page.getByTestId("landing-hero-secondary-cta");
    await expect(demoCta).toHaveText(/Request Demo/i);
    await demoCta.click();

    await expect(page).toHaveURL(/\/contact\/demo/);
    const subject = page.getByTestId("contact-form-subject");
    await expect(subject).toHaveValue(/demonstration request/i);
  });

  test("remembers last audience in session storage", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("site-nav-audience-overview").click();

    await page.goto("/");
    await expect(page.getByTestId("landing-hero-panel")).toHaveAttribute(
      "data-audience",
      "overview"
    );
  });

  test("platform product preview renders the pillar radar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("landing-product-preview")).toBeVisible();
    await expect(page.getByTestId("platform-pillar-radar-preview")).toBeVisible();
  });
});
