import { test, expect } from "@playwright/test";
import fs from "node:fs";

const baseURL = "http://localhost:3000";
const stamp = Date.now();
const email = `qa+${stamp}@example.com`;
const password = `Qa!${stamp}StrongPass`;
const outDir = "qa-screens/session-protected";

type PageAudit = {
  label: string;
  url: string;
  title: string;
  viewport: { width: number; height: number };
  scroll: { width: number; height: number };
  horizontalOverflow: boolean;
  overflows: Array<{
    text: string;
    tag: string;
    id: string | null;
    className: string;
    rect: { left: number; right: number; top: number; bottom: number; width: number; height: number };
  }>;
};

function safeName(input: string) {
  return input.replaceAll("/", "-").replaceAll(":", "").replaceAll(" ", "-");
}

async function auditPage(page: import("@playwright/test").Page, label: string): Promise<PageAudit> {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);

  return page.evaluate((pageLabel) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const scroll = {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    };

    const overflows = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
        return {
          text,
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: typeof el.className === "string" ? el.className : "",
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          },
        };
      })
      .filter((item) => item.rect.width > 0 && item.rect.height > 0)
      .filter((item) => item.rect.left < -1 || item.rect.right > viewport.width + 1)
      .slice(0, 12);

    return {
      label: pageLabel,
      url: window.location.href,
      title: document.title,
      viewport,
      scroll,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      overflows,
    };
  }, label);
}

async function saveShot(page: import("@playwright/test").Page, name: string) {
  await fs.promises.mkdir(outDir, { recursive: true });
  await page.screenshot({
    path: `${outDir}/${safeName(name)}.png`,
    fullPage: true,
  });
}

async function ensureAuthed(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/signin") || page.url().includes("/signup")) {
    await page.goto(`${baseURL}/signup`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/signup"), { timeout: 15000 });
  }

  await page.goto(`${baseURL}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard/);
}

async function openQuestion(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/assessment/family-governance/0`);
  await page.waitForTimeout(800);

  if (!page.url().includes("/assessment/family-governance/0")) {
    await page.goto(`${baseURL}/assessment`);
    const begin = page.getByRole("button", { name: /begin assessment/i });
    if (await begin.count()) {
      await begin.click();
    } else {
      await page.getByRole("button", { name: /continue assessment/i }).click();
    }
    await page.waitForURL(/\/assessment\/family-governance\/\d+/);
  }
}

test("qa protected routes redesign", async ({ browser }) => {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await desktop.newPage();

  await ensureAuthed(page);

  const desktopAudits: PageAudit[] = [];

  for (const route of ["/dashboard", "/settings", "/assessment"]) {
    await page.goto(`${baseURL}${route}`);
    const label = `desktop ${route}`;
    desktopAudits.push(await auditPage(page, label));
    await saveShot(page, label);
  }

  await openQuestion(page);
  desktopAudits.push(await auditPage(page, "desktop /assessment/family-governance/0"));
  await saveShot(page, "desktop /assessment/family-governance/0");

  let resultsReachable = false;
  let completionReachable = false;

  await page.goto(`${baseURL}/assessment/complete`);
  await page.waitForTimeout(2800);
  completionReachable = page.url().includes("/assessment/complete");
  if (completionReachable) {
    desktopAudits.push(await auditPage(page, "desktop /assessment/complete"));
    await saveShot(page, "desktop /assessment/complete");
  }

  if (page.url().includes("/assessment/results")) {
    resultsReachable = true;
    desktopAudits.push(await auditPage(page, "desktop /assessment/results"));
    await saveShot(page, "desktop /assessment/results");
  } else {
    await page.goto(`${baseURL}/assessment/results`);
    await page.waitForTimeout(1200);
    if (page.url().includes("/assessment/results")) {
      resultsReachable = true;
      desktopAudits.push(await auditPage(page, "desktop /assessment/results"));
      await saveShot(page, "desktop /assessment/results");
    }
  }

  const storage = await desktop.storageState();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storageState: storage,
  });
  const mobilePage = await mobile.newPage();
  const mobileAudits: PageAudit[] = [];

  for (const route of ["/dashboard", "/settings", "/assessment"]) {
    await mobilePage.goto(`${baseURL}${route}`);
    const label = `mobile ${route}`;
    mobileAudits.push(await auditPage(mobilePage, label));
    await saveShot(mobilePage, label);
  }

  await openQuestion(mobilePage);
  mobileAudits.push(await auditPage(mobilePage, "mobile /assessment/family-governance/0"));
  await saveShot(mobilePage, "mobile /assessment/family-governance/0");

  if (completionReachable) {
    await mobilePage.goto(`${baseURL}/assessment/complete`);
    await mobilePage.waitForTimeout(1200);
    if (mobilePage.url().includes("/assessment/complete")) {
      mobileAudits.push(await auditPage(mobilePage, "mobile /assessment/complete"));
      await saveShot(mobilePage, "mobile /assessment/complete");
    }
  }

  if (resultsReachable) {
    await mobilePage.goto(`${baseURL}/assessment/results`);
    await mobilePage.waitForTimeout(1200);
    if (mobilePage.url().includes("/assessment/results")) {
      mobileAudits.push(await auditPage(mobilePage, "mobile /assessment/results"));
      await saveShot(mobilePage, "mobile /assessment/results");
    }
  }

  const summary = {
    email,
    resultsReachable,
    completionReachable,
    desktop: desktopAudits,
    mobile: mobileAudits,
  };

  await fs.promises.writeFile(`${outDir}/summary.json`, JSON.stringify(summary, null, 2));

  await mobile.close();
  await desktop.close();
});
