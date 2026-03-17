import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

const adminPassword = "microwave-admin";

test("homepage shows archive and detail page is reachable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "最近谁在把 AI 真用进工作里" })).toBeVisible();
  await expect(page.getByText("当前每页最多 16 条历史微课")).toBeVisible();

  await page
    .getByRole("link", { name: "让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/micro-courses\/ai-daily-report-template/);
  await expect(page.getByRole("heading", { name: "让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板" })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开会议回放" })).toBeVisible();
  await expect(page.getByText("资料链接")).toBeVisible();
});

test("public signup flow submits successfully", async ({ page }) => {
  const topic = `Playwright 报名测试 ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "我要热一下" }).click();

  await page.getByLabel("你想讲什么").fill(topic);
  await page.getByLabel("你是谁").fill("端到端测试");
  await page.getByLabel("补充一点上下文").fill("这是一条由 Playwright 自动创建的测试报名。");
  await page.getByRole("button", { name: "收下这个话题" }).click();

  await expect(page).toHaveURL(/\/success/);
  await expect(page.getByRole("heading", { name: "这次分享，已经热起来了" })).toBeVisible();
  await expect(page.getByRole("button", { name: "再报一个话题" })).toBeVisible();
});

test("admin can login, update submission status, archive from submission, and review completed items", async ({
  page
}) => {
  const topic = `Playwright 归档测试 ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "我要热一下" }).click();
  await page.getByLabel("你想讲什么").fill(topic);
  await page.getByLabel("你是谁").fill("自动归档用户");
  await page.getByLabel("补充一点上下文").fill("分享会讲一个真实的 AI 提效例子。");
  await page.getByRole("button", { name: "收下这个话题" }).click();
  await expect(page).toHaveURL(/\/success/);

  await page.goto("/admin");
  await page.getByLabel("管理员口令").fill(adminPassword);
  await page.getByRole("button", { name: "进入轻运营后台" }).click();

  await expect(page.getByRole("heading", { name: "把已经成熟的话题，尽快推上本周微课排期" })).toBeVisible();

  const item = page.locator(".admin-item", { hasText: topic }).first();
  await expect(item).toBeVisible();

  await item.getByRole("combobox").selectOption("NEED_FOLLOW_UP");
  await item.getByPlaceholder("联系备注 / 下一步").fill(
    "Playwright 已确认这条需要补充案例。"
  );
  await item.getByRole("button", { name: "记一下" }).click();

  await expect(item.getByRole("combobox")).toHaveValue("NEED_FOLLOW_UP");

  await item.getByRole("link", { name: "转成归档草稿" }).click();

  await expect(page).toHaveURL(/archiveFrom=/);
  await expect(page.getByRole("link", { name: "历史活动", exact: true })).toHaveClass(
    /admin-mode-link-active/
  );
  await expect(page.getByText("当前正在从报名生成归档草稿")).toBeVisible();
  await expect(page.getByLabel("标题")).toHaveValue(topic);
  await expect(page.getByRole("textbox", { name: "主讲人", exact: true })).toHaveValue(
    "自动归档用户"
  );

  await page.getByLabel("活动日期").fill("2026-03-20");
  await page.getByLabel("开始时间").fill("11:00");
  await page.getByLabel("结束时间").fill("11:20");
  await page.getByLabel("回放链接").fill("https://intranet.example.com/replay/playwright");
  await page
    .getByLabel("资料链接")
    .fill(
      "https://intranet.example.com/materials/playwright\nhttps://intranet.example.com/materials/playwright-template"
    );
  await page.getByLabel("3 个收获点，按换行分隔").fill(
    "先找到一个真实场景。\n再把方法压缩成 20 分钟。\n最后把链接归档进社区。"
  );
  await page.getByLabel("主讲人介绍").fill("这是 Playwright 自动归档时补上的主讲人介绍。");
  await page.getByLabel("反馈摘录，按换行分隔").fill("这是一条自动化测试反馈。");
  await page.getByRole("button", { name: "发布并归档这条报名" }).click();

  await expect(page).toHaveURL(/adminTab=archive/);
  await expect(page.getByRole("link", { name: topic }).first()).toBeVisible();

  await page.getByRole("link", { name: "报名信息", exact: true }).click();
  await expect(page.locator(".admin-item", { hasText: topic })).toHaveCount(0);
  await page.getByRole("link", { name: /已完成/ }).click();
  const archivedItem = page.locator(".admin-item", { hasText: topic }).first();
  await expect(archivedItem).toBeVisible();
  await expect(archivedItem.getByRole("combobox")).toHaveValue("ARCHIVED");

  await page.getByRole("link", { name: "历史活动", exact: true }).click();
  await expect(page.locator(".ledger-table")).toContainText(topic);
  await expect(page.locator(".ledger-table")).toContainText("11:00~11:20");

  await page.goto("/");
  await expect(page.getByRole("link", { name: topic }).first()).toBeVisible();
  await page.getByRole("link", { name: topic }).first().click();
  await expect(page.getByRole("link", { name: "查看资料 1" })).toBeVisible();
  await expect(page.getByRole("link", { name: "查看资料 2" })).toBeVisible();
});

test("admin can edit an existing micro course", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("管理员口令").fill(adminPassword);
  await page.getByRole("button", { name: "进入轻运营后台" }).click();
  await page.getByRole("link", { name: "历史活动", exact: true }).click();

  const recentItem = page.locator(".recent-course-item", {
    hasText: "让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板"
  });
  await recentItem.getByRole("link", { name: "编辑" }).click();

  await expect(page).toHaveURL(/editCourse=/);
  await expect(page.getByText("当前正在编辑历史微课")).toBeVisible();
  await expect(page.getByLabel("活动日期")).toHaveValue("2026-03-06");
  await expect(page.getByLabel("开始时间")).toHaveValue("11:00");
  await expect(page.getByLabel("结束时间")).toHaveValue("11:28");

  const editedTitle = `让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板（已编辑）`;
  await page.getByLabel("标题").fill(editedTitle);
  await page
    .getByLabel("摘要")
    .fill("这是 Playwright 编辑后的摘要，用来确认历史微课编辑流已经打通。");
  await page.getByRole("button", { name: "保存这条历史微课" }).click();

  await expect(page).toHaveURL(/adminTab=archive/);
  await page.getByRole("link", { name: "首页", exact: true }).click();
  await expect(page.getByRole("link", { name: editedTitle }).first()).toBeVisible();
});

test("admin can export archive ledger as csv", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("管理员口令").fill(adminPassword);
  await page.getByRole("button", { name: "进入轻运营后台" }).click();
  await page.getByRole("link", { name: "历史活动", exact: true }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "导出 CSV" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toBe("ai-microwave-ledger.csv");
  expect(downloadPath).not.toBeNull();

  const content = await readFile(downloadPath!, "utf8");
  expect(content).toContain("主题,主讲人,活动日期");
  expect(content).toContain("让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板");
  expect(content).toContain("11:00~11:28");
});

test.describe("@sso trusted header auth without header", () => {
  test("admin page shows hint when header is missing", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("当前启用内网透传认证")).toBeVisible();
    await expect(page.getByText("x-e2e-user")).toBeVisible();
  });
});

test.describe("@sso trusted header auth with header", () => {
  test.use({
    extraHTTPHeaders: {
      "x-e2e-user": "e2e-admin"
    }
  });

  test("admin page is accessible with trusted header", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "把已经成熟的话题，尽快推上本周微课排期" })).toBeVisible();
    await expect(page.getByText("当前认证：SSO 透传 / e2e-admin")).toBeVisible();
  });
});
