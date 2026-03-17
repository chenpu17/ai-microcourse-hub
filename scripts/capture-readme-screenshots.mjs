import { execSync, spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

const rootDir = process.cwd();
const managedPort = process.env.README_SCREENSHOT_PORT || "3100";
const baseUrl = process.env.README_SCREENSHOT_BASE_URL || `http://127.0.0.1:${managedPort}`;
const outputDir = path.join(rootDir, "artifacts", "readme-screenshots");
const databasePath = path.join(outputDir, "readme-screenshots.db");
const databaseUrl = `file:${databasePath}`;
const adminPassword = process.env.ADMIN_PASSWORD || "microwave-admin";
const shouldManageServer = !process.env.README_SCREENSHOT_BASE_URL;

let serverProcess = null;

function log(message) {
  console.log(`[readme-screenshots] ${message}`);
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(`dev server exited early with code ${serverProcess.exitCode}`);
    }

    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {}

    await delay(1000);
  }

  throw new Error(`server did not become ready in time: ${url}`);
}

async function stabilize(page) {
  await page.waitForLoadState("domcontentloaded");

  try {
    await page.waitForLoadState("networkidle", { timeout: 10_000 });
  } catch {}

  await delay(350);
}

async function capture(target, filename) {
  const filepath = path.join(outputDir, filename);
  await target.screenshot({ path: filepath });
  log(`saved ${filename}`);
}

async function loginAdmin(page) {
  await page.goto(`${baseUrl}/admin`);
  await stabilize(page);

  const trustedHeaderHint = page.getByText("当前启用内网透传认证");
  if (await trustedHeaderHint.isVisible().catch(() => false)) {
    throw new Error(
      "current environment uses trusted_header auth; set README_SCREENSHOT_BASE_URL to an already authenticated admin URL or switch local auth to password mode"
    );
  }

  const passwordField = page.getByLabel("管理员口令");
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill(adminPassword);
    await page.getByRole("button", { name: "进入轻运营后台" }).click();
    await stabilize(page);
  }
}

async function startLocalServer() {
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl
  };

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  log(`using isolated sqlite database: ${databasePath}`);
  log("syncing database schema");
  execSync("npm run db:push", {
    cwd: rootDir,
    env,
    stdio: "inherit"
  });

  log("resetting demo data");
  execSync("npm run db:seed", {
    cwd: rootDir,
    env,
    stdio: "inherit"
  });

  log(`starting local dev server on ${baseUrl}`);
  serverProcess = spawn(
    "npm",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", managedPort],
    {
      cwd: rootDir,
      env,
      stdio: "inherit"
    }
  );

  await waitForServer(baseUrl);
}

async function main() {
  if (shouldManageServer) {
    await startLocalServer();
  } else {
    log(`using existing app: ${baseUrl}`);
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    colorScheme: "light",
    locale: "zh-CN",
    reducedMotion: "reduce"
  });
  const page = await context.newPage();

  await page.addStyleTag({
    content: `
      * {
        caret-color: transparent !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `
  });

  log("capturing homepage hero");
  await page.goto(baseUrl);
  await stabilize(page);
  await capture(page, "01-home-hero.png");

  log("capturing homepage archive grid");
  const archiveSection = page.locator("#archive");
  await archiveSection.scrollIntoViewIfNeeded();
  await delay(250);
  await capture(archiveSection, "02-home-archive-grid.png");

  log("capturing course detail page");
  const detailHref = await page.locator('a[href^="/micro-courses/"]').first().getAttribute("href");
  if (!detailHref) {
    throw new Error("no micro course detail link found on homepage");
  }

  await page.goto(new URL(detailHref, baseUrl).toString());
  await stabilize(page);
  await capture(page, "03-course-detail.png");

  log("capturing submit success page");
  await page.goto(baseUrl);
  await stabilize(page);
  await page.getByRole("button", { name: "我要热一下" }).click();
  await page.getByLabel("你想讲什么").fill(`README 截图示例 ${Date.now()}`);
  await page.getByLabel("你是谁").fill("README 截图机器人");
  await page.getByLabel("补充一点上下文").fill("这是一条用于 README 截图采集的自动化演示报名。");
  await page.getByRole("button", { name: "收下这个话题" }).click();
  await stabilize(page);
  await capture(page, "04-submit-success.png");

  log("capturing admin submissions view");
  await loginAdmin(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(250);
  await capture(page, "05-admin-submissions.png");

  log("capturing admin archive view");
  await page.getByRole("link", { name: "历史活动", exact: true }).click();
  await stabilize(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(250);
  await capture(page, "06-admin-history-table.png");

  await browser.close();
  log(`done, screenshots are in ${path.relative(rootDir, outputDir)}`);
}

async function shutdown() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM");
    await delay(500);
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await shutdown();
}
