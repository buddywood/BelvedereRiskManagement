const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const dotenv = require(path.resolve(__dirname, "../node_modules/dotenv"));
const argon2 = require(path.resolve(__dirname, "../node_modules/argon2"));
const { PrismaClient } = require(path.resolve(__dirname, "../node_modules/@prisma/client"));
const { PrismaPg } = require(path.resolve(__dirname, "../node_modules/@prisma/adapter-pg"));
const { Pool } = require(path.resolve(__dirname, "../node_modules/pg"));

const baseURL = "http://localhost:3000";
const stamp = Date.now();
const email = `qa+${stamp}@example.com`;
const password = `Qa!${stamp}StrongPass`;
const outDir = path.resolve(__dirname, "qa-screens/session-protected");
let signupIssue = null;

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function safeName(input) {
  return input.replaceAll("/", "-").replaceAll(":", "").replaceAll(" ", "-");
}

async function waitSettled(page, ms = 600) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {}
  await page.waitForTimeout(ms);
}

async function auditPage(page, label) {
  await waitSettled(page);
  return page.evaluate((pageLabel) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const scroll = {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    };

    const overflows = Array.from(document.querySelectorAll("body *"))
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

async function saveShot(page, name) {
  await fs.promises.mkdir(outDir, { recursive: true });
  await page.screenshot({
    path: path.join(outDir, `${safeName(name)}.png`),
    fullPage: true,
  });
}

async function goto(page, route) {
  console.log(`NAVIGATE ${route}`);
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  await waitSettled(page);
}

async function ensureAuthed(page) {
  await goto(page, "/dashboard");

  if (page.url().includes("/signin") || page.url().includes("/signup")) {
    await goto(page, "/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();
    try {
      await page.waitForURL((url) => !url.pathname.includes("/signup"), { timeout: 5000 });
      await waitSettled(page, 1200);
    } catch {
      signupIssue = await page.locator('[role="alert"]').first().innerText().catch(() => "Signup did not navigate away from /signup");
      console.log(`SIGNUP_ISSUE ${signupIssue}`);
      await createUserInDb();
      await goto(page, "/signin");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL((url) => !url.pathname.includes("/signin"), { timeout: 15000 });
      await waitSettled(page, 1200);
    }
  }

  await goto(page, "/dashboard");
}

async function openQuestion(page) {
  await goto(page, "/assessment/family-governance/0");
  if (page.url().includes("/assessment/family-governance/0")) {
    return;
  }

  await goto(page, "/assessment");
  const begin = page.getByRole("button", { name: /begin assessment/i });
  const continueBtn = page.getByRole("button", { name: /continue assessment/i });

  if (await begin.count()) {
    await begin.click();
  } else if (await continueBtn.count()) {
    await continueBtn.click();
  }

  await page.waitForURL(/\/assessment\/family-governance\/\d+/, { timeout: 15000 });
  await waitSettled(page);
}

async function captureSet(page, modeLabel) {
  const audits = [];

  for (const route of ["/dashboard", "/settings", "/assessment"]) {
    await goto(page, route);
    const label = `${modeLabel} ${route}`;
    audits.push(await auditPage(page, label));
    await saveShot(page, label);
    console.log(`CAPTURED ${label}`);
  }

  await openQuestion(page);
  audits.push(await auditPage(page, `${modeLabel} /assessment/family-governance/0`));
  await saveShot(page, `${modeLabel} /assessment/family-governance/0`);
  console.log(`CAPTURED ${modeLabel} /assessment/family-governance/0`);

  return audits;
}

async function maybeCapture(page, modeLabel, route) {
  await goto(page, route);
  if (!page.url().includes(route)) {
    return null;
  }
  const label = `${modeLabel} ${route}`;
  const audit = await auditPage(page, label);
  await saveShot(page, label);
  console.log(`CAPTURED ${label}`);
  return audit;
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const desktopPage = await desktop.newPage();
  desktopPage.setDefaultTimeout(15000);
  desktopPage.setDefaultNavigationTimeout(15000);

  await ensureAuthed(desktopPage);
  const desktopAudits = await captureSet(desktopPage, "desktop");

  const completionAudit = await maybeCapture(desktopPage, "desktop", "/assessment/complete");
  const resultsAudit = await maybeCapture(desktopPage, "desktop", "/assessment/results");

  if (completionAudit) {
    desktopAudits.push(completionAudit);
  }
  if (resultsAudit) {
    desktopAudits.push(resultsAudit);
  }

  const storageState = await desktop.storageState();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storageState,
  });
  const mobilePage = await mobile.newPage();
  mobilePage.setDefaultTimeout(15000);
  mobilePage.setDefaultNavigationTimeout(15000);

  const mobileAudits = await captureSet(mobilePage, "mobile");

  if (completionAudit) {
    const mobileCompletion = await maybeCapture(mobilePage, "mobile", "/assessment/complete");
    if (mobileCompletion) {
      mobileAudits.push(mobileCompletion);
    }
  }

  if (resultsAudit) {
    const mobileResults = await maybeCapture(mobilePage, "mobile", "/assessment/results");
    if (mobileResults) {
      mobileAudits.push(mobileResults);
    }
  }

  const summary = {
    email,
    password,
    signupIssue,
    completionReachable: Boolean(completionAudit),
    resultsReachable: Boolean(resultsAudit),
    desktop: desktopAudits,
    mobile: mobileAudits,
  };

  await fs.promises.mkdir(outDir, { recursive: true });
  await fs.promises.writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(`SUMMARY ${path.join(outDir, "summary.json")}`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function createUserInDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
      });
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      console.log("SEEDED_USER");
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
