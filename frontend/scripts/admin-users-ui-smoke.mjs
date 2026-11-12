/* global process, console, localStorage, URL, document, innerWidth */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const base = process.env.USERS_TEST_URL || "http://127.0.0.1:5187";
const output = join(tmpdir(), "campuscare-admin-users-ui");
await mkdir(output, { recursive: true });
const records = Array.from({ length: 45 }, (_, i) => ({
  id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  full_name: `Alex ${String(i + 1).padStart(2, "0")}`,
  email:
    i === 0
      ? "a.long.registered.account.name@example.invalid"
      : `user${i + 1}@example.invalid`,
  role: ["student", "mentor", "admin"][i % 3],
  created_at: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
  profile_completed: i % 2 === 0,
  last_login_at: i % 2 === 0 ? "2026-11-12T09:00:00Z" : null,
}));
try {
  for (const width of [320, 375, 430, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    await context.addInitScript(() => {
      localStorage.setItem("campuscare_token", "fixture-only");
      localStorage.setItem("campuscare-theme", "light");
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let unavailable = false;
    await page.route("**/api/**", async (route) => {
      const req = route.request(),
        url = new URL(req.url()),
        path = url.pathname.replace(/^\/api/, "");
      assert.equal(req.headers().authorization, "Bearer fixture-only");
      let data = [];
      if (path === "/auth/me")
        data = {
          user: {
            id: "10000000-0000-4000-8000-000000000001",
            fullName: "Fixture Admin",
            email: "admin@example.invalid",
            role: "admin",
          },
        };
      else if (path === "/admin/users") {
        if (unavailable) {
          await route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ success: false, message: "Unavailable" }),
          });
          return;
        }
        const search = (url.searchParams.get("search") || "").toLowerCase(),
          role = url.searchParams.get("role"),
          number = Number(url.searchParams.get("page") || 1);
        const matches = records.filter(
          (row) =>
            (!role || row.role === role) &&
            `${row.full_name} ${row.email}`.toLowerCase().includes(search),
        );
        if (url.searchParams.get("sort") !== "oldest") matches.reverse();
        data = {
          items: matches.slice((number - 1) * 20, number * 20),
          page: number,
          limit: 20,
          total: matches.length,
          summary: { total_users: 45, students: 15, mentors: 15, admins: 15 },
        };
      } else if (path.startsWith("/admin/users/"))
        data = {
          ...records.find((row) => path.endsWith(row.id)),
          department: "Computer Science",
          study_year: "2",
          admin_position: null,
          admin_department_unit: null,
        };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Fixture", data }),
      });
    });
    const check = async (label) => {
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${label}: overflow at ${width}px`,
      );
      await page.screenshot({
        path: join(output, `${label}-${width}.png`),
        fullPage: true,
      });
    };
    await page.goto(`${base}/admin/users`);
    await page
      .getByRole("button", { name: "View Alex 45", exact: true })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: /^View Alex/ }).count(),
      20,
    );
    assert.ok(
      await page.getByRole("link", { name: "Users", exact: true }).count(),
    );
    await check("users-list");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByText("Page 2 of 3", { exact: true }).waitFor();
    await page.getByLabel("Role", { exact: true }).selectOption("mentor");
    await page.getByText("15 accounts found", { exact: true }).waitFor();
    assert.equal(
      await page.getByRole("button", { name: /^View Alex/ }).count(),
      15,
    );
    await page
      .getByLabel("Search users", { exact: true })
      .fill("user44@example.invalid");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByText("1 account found", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "View Alex 44", exact: true })
      .click();
    const details = page.getByRole("complementary", {
      name: "User details",
      exact: true,
    });
    await details.getByText("Computer Science", { exact: true }).waitFor();
    await check("users-detail");
    assert.ok(
      !(await page.locator("body").innerText()).includes(records[43].id),
    );
    await page
      .getByRole("button", { name: "Close user details", exact: true })
      .click();
    await page
      .getByLabel("Search users", { exact: true })
      .fill("not-a-registered-account");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByText("No registered users found.", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await page
      .getByRole("button", { name: "View Alex 45", exact: true })
      .waitFor();
    unavailable = true;
    await page.reload();
    await page.getByRole("alert").waitFor();
    assert.equal(
      await page
        .getByText("No registered users found.", { exact: true })
        .count(),
      0,
    );
    unavailable = false;
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await page
      .getByRole("button", { name: "View Alex 45", exact: true })
      .waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `PASS Admin list/detail/search/filter/pagination/empty/error and overflow at ${width}px`,
    );
  }
  for (const role of ["student", "mentor"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 900 },
    });
    await context.addInitScript(() => {
      localStorage.setItem("campuscare_token", "fixture-only");
      localStorage.setItem("campuscare-theme", "light");
    });
    const page = await context.newPage();
    let usersRequests = 0;
    await page.route("**/api/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let data = [];
      if (path === "/api/auth/me")
        data = {
          user: {
            id: "fixture",
            role,
            fullName: "Fixture User",
            email: "fixture@example.invalid",
          },
        };
      if (path.startsWith("/api/admin/users")) usersRequests++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data }),
      });
    });
    await page.goto(`${base}/admin/users`);
    await page
      .getByRole("heading", { name: "Admin access required" })
      .waitFor();
    assert.equal(
      await page.getByRole("link", { name: "Users", exact: true }).count(),
      0,
    );
    assert.equal(usersRequests, 0);
    await context.close();
    console.log(
      `PASS ${role} navigation hidden and direct route denied before fetching users`,
    );
  }
  console.log(`Screenshots: ${output}`);
} finally {
  await browser.close();
}
