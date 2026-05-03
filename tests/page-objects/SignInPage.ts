import { expect, type Page } from "@playwright/test";

export class SignInPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/signin");
    await expect(this.page.locator("#email")).toBeVisible();
  }

  async signIn(email: string, password: string) {
    await this.page.locator("#email").fill(email);
    await this.page.locator("#password").fill(password);
    await this.page.getByRole("button", { name: /^sign in$/i }).click();
  }
}
