import { expect, type Page } from "@playwright/test";
import { USERS, type Role } from "../fixtures/users";

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

  async signInAs(role: Role) {
    await this.goto();
    const user = USERS[role];
    await this.signIn(user.email, user.password);
    await this.page.waitForURL(
      new RegExp(`${user.expectedLandingPath}(/|$|\\?)`),
      { timeout: 30_000 }
    );
  }
}
