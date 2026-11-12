/* global process, console, localStorage, document, innerWidth, getComputedStyle, URL */
// Layout/behavior checks use fixture accounts and intercept every API request.
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
const base = process.env.AUTH_TEST_URL || "http://127.0.0.1:5187";
const output = join(tmpdir(), "campuscare-auth-responsive");
await mkdir(output, { recursive: true });
const requestedWidths = process.env.AUTH_TEST_WIDTHS?.split(",").map(Number);
const viewports = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 900],
  [1280, 900],
].filter(([width]) => !requestedWidths || requestedWidths.includes(width));
const paths = [
  "/",
  "/start",
  "/register?role=student",
  "/register?role=mentor",
  "/register?role=admin",
  "/login?role=student",
  "/login?role=mentor",
  "/login?role=admin",
  "/forgot-password?role=admin",
  "/not-a-campuscare-page",
];
const stats = {
  totalUsers: 1,
  totalHelpRequests: 0,
  openHelpRequests: 0,
  totalSkills: 0,
  totalStudentSkills: 0,
  totalStressRecords: 0,
  averageStressLevel: 0,
  moodCounts: {},
  totalMoodRecords: 0,
  totalLostFoundItems: 0,
  lostFoundOpen: 0,
  lostFoundResolved: 0,
  recentActivity: [],
};
const profile = {
  id: "fixture-profile",
  userId: "fixture-user",
  studyYear: "2",
  department: "Computer Science and Engineering",
  reasonForJoining: "Fixture account setup",
  supportInterest: "collaboration",
  expertiseAreas: "Web development",
  canHelpWith: "Projects",
  availability: "Weekly",
  mentoringReason: "Fixture mentoring",
  preferredSupportType: "Projects",
  adminPosition: "Platform administration",
  adminDepartmentUnit: "Campus services",
  adminAccessReason: "Fixture administration",
  onboardingCompleted: true,
  createdAt: "2026-11-12T09:00:00Z",
  updatedAt: "2026-11-12T09:00:00Z",
};
const qr =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><rect x="15" y="15" width="60" height="60" fill="black"/><rect x="125" y="15" width="60" height="60" fill="black"/><rect x="15" y="125" width="60" height="60" fill="black"/><text x="90" y="120" font-size="15">DEMO QR</text></svg>',
  );
let cases = 0;
try {
  for (const [width, height] of viewports)
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      await context.addInitScript(
        (theme) => localStorage.setItem("campuscare-theme", theme),
        theme,
      );
      const page = await context.newPage(),
        errors = [],
        requests = [];
      let currentRole = "admin",
        enabled = false;
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/api/**", async (route) => {
        const req = route.request(),
          url = new URL(req.url()),
          path = url.pathname.replace(/^\/api/, "");
        const body = req.postDataJSON();
        requests.push({
          path,
          method: req.method(),
          body,
          authorization: req.headers().authorization,
        });
        let data = [];
        if (path === "/auth/me")
          data = {
            user: {
              id: "fixture-user",
              fullName: "Fixture Account Administrator",
              email: "admin.responsiveness.audit@example.invalid",
              role: currentRole,
              createdAt: "2026-11-12T09:00:00Z",
            },
          };
        else if (path === "/auth/register")
          data = {
            user: { id: "fixture-new", role: body.role },
            token: "fixture-registration-token",
          };
        else if (path === "/auth/login")
          data = {
            requiresTwoFactor: true,
            challengeToken: "fixture-challenge-token",
          };
        else if (path === "/auth/2fa/verify") {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              message: "Fixture verification response",
            }),
          });
          return;
        } else if (path === "/profile" || path === "/profile/onboarding")
          data = profile;
        else if (path === "/dashboard/stats") data = stats;
        else if (path === "/security/activity") data = { items: [], total: 0 };
        else if (path === "/security/2fa/status") data = { enabled };
        else if (path === "/security/2fa/setup")
          data = { qrCodeDataUrl: qr, manualSecret: "DEMOONLY".repeat(20) };
        else if (path === "/security/2fa/enable") {
          assert.equal(body.code, "123456");
          enabled = true;
          data = { enabled };
        } else if (path === "/security/2fa/disable") {
          assert.equal(body.code, "123456");
          enabled = false;
          data = { enabled };
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "Fixture", data }),
        });
      });
      await page
        .addStyleTag({
          content:
            "*{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
        })
        .catch(() => {});
      const check = async (label, screenshot = false) => {
        await page.waitForTimeout(80);
        // Temporarily unmask the existing global overflow rule so clipping cannot pass.
        const result = await page.evaluate(() => {
          document.documentElement.style.overflowX = "visible";
          document.body.style.overflowX = "visible";
          const visible = (el) => {
            const r = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return (
              r.width > 0 &&
              r.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden"
            );
          };
          const intentional = (el) =>
            !!el.closest(
              '[aria-label="Mobile module navigation"],[aria-label="Quick mobile navigation"]',
            );
          const offenders = [
            ...document.querySelectorAll(
              "main,section,article,aside,header,h1,h2,p,input,select,textarea,button,a",
            ),
          ]
            .filter((el) => visible(el) && !intentional(el))
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.left < -2 || r.right > innerWidth + 2;
            })
            .slice(0, 8)
            .map((el) => ({
              tag: el.tagName,
              classes: el.className,
              text: el.textContent.slice(0, 45),
            }));
          const clipped = [
            ...document.querySelectorAll(
              ".auth-hero h1,.auth-hero p,.auth-form-panel h2,.auth-top-action,.register-role-heading,.register-section-helper,.security-manual-key",
            ),
          ]
            .filter(
              (el) =>
                visible(el) &&
                el.clientWidth > 0 &&
                el.scrollWidth > el.clientWidth + 2,
            )
            .map((el) => ({
              classes: el.className,
              text: el.textContent.slice(0, 45),
            }));
          return {
            viewport: innerWidth,
            scroll: document.documentElement.scrollWidth,
            offenders,
            clipped,
          };
        });
        assert.ok(
          result.scroll <= width + 2,
          `${label} ${theme} ${width}: document overflow ${JSON.stringify(result)}`,
        );
        assert.deepEqual(
          result.offenders,
          [],
          `${label} ${theme} ${width}: off-screen elements`,
        );
        assert.deepEqual(
          result.clipped,
          [],
          `${label} ${theme} ${width}: clipped auth text`,
        );
        const lowContrast = await page.evaluate(() => {
          const luminance = (rgb) =>
            rgb
              .slice(0, 3)
              .map((n) => n / 255)
              .map((n) =>
                n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4,
              )
              .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
          const parse = (color) => color.match(/[\d.]+/g)?.map(Number);
          return [
            ...document.querySelectorAll(
              '.auth-page .input,.auth-page .badge-green,.auth-page [class~="bg-white/70"]',
            ),
          ]
            .filter((el) => el.getClientRects().length)
            .filter((el) => {
              const style = getComputedStyle(el),
                fg = parse(style.color),
                bg = parse(style.backgroundColor);
              if (!fg || !bg || (bg.length === 4 && bg[3] < 1)) return false;
              const a = luminance(fg),
                b = luminance(bg);
              return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 4.5;
            })
            .map((el) => el.className);
        });
        assert.deepEqual(
          lowContrast,
          [],
          `${label} ${theme} ${width}: low-contrast auth fields/badges`,
        );
        for (const control of await page
          .locator('main input:not([type="hidden"]),main select,main textarea')
          .all()) {
          if (!(await control.isVisible())) continue;
          const box = await control.boundingBox();
          assert.ok(
            box.x >= -1 && box.x + box.width <= width + 1,
            `${label}: offscreen form field`,
          );
        }
        if (screenshot)
          await page.screenshot({
            path: join(output, `${label}-${theme}-${width}.png`),
            fullPage: true,
          });
        cases++;
      };
      const primary = async (locator) => {
        await locator.scrollIntoViewIfNeeded();
        const box = await locator.boundingBox();
        assert.ok(box && box.width > 0 && box.height >= 42);
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
        await locator.click({ trial: true });
      };
      for (const path of paths) {
        await page.goto(base + path);
        await page.locator("main").waitFor();
        const label =
          path === "/"
            ? "landing"
            : path.split("?")[0].replaceAll("/", "") +
              (path.includes("role=") ? "-" + path.split("role=")[1] : "");
        if (path.startsWith("/register?role=") && !path.endsWith("admin")) {
          await page
            .getByRole("heading", { name: "Create account", exact: true })
            .waitFor();
          const first = await page
            .getByLabel("Full name", { exact: true })
            .boundingBox();
          if (width <= 430)
            assert.ok(
              first.y < height + 140,
              `Register ${width}: form pushed below a decorative hero`,
            );
          await page.locator(".register-details summary").click();
          await primary(
            page.getByRole("button", { name: "Create account", exact: true }),
          );
        } else if (path === "/")
          await primary(page.locator(".lp-hero-actions a").first());
        else if (path.startsWith("/login"))
          await primary(
            page.getByRole("button", { name: "Sign in", exact: true }),
          );
        else if (path === "/start") {
          const roles = page.locator(".role-entry-card");
          assert.equal(await roles.count(), 3);
          if (width <= 430) {
            const a = await roles.nth(0).boundingBox(),
              b = await roles.nth(1).boundingBox();
            assert.ok(b.y >= a.y + a.height - 1);
          }
          await primary(roles.first());
        } else if (path.startsWith("/forgot-password"))
          await primary(
            page.getByRole("button", {
              name: "Continue recovery",
              exact: true,
            }),
          );
        else if (path === "/not-a-campuscare-page")
          await primary(
            page.getByRole("link", { name: "Back to home", exact: true }),
          );
        await check(label, width <= 430 || width === 1280);
      }
      await page.goto(base + "/login?role=admin");
      await page
        .getByLabel("Email", { exact: true })
        .fill("admin@example.invalid");
      await page.locator('input[type="password"]').fill("fixture-password");
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page
        .getByRole("heading", { name: "Verify your identity", exact: true })
        .waitFor();
      await page
        .getByLabel("Verification code", { exact: true })
        .fill("12ab34");
      assert.equal(
        await page
          .getByLabel("Verification code", { exact: true })
          .inputValue(),
        "1234",
      );
      await page
        .getByLabel("Verification code", { exact: true })
        .fill("123456");
      await check("admin-2fa-verification", true);
      await primary(
        page.getByRole("button", { name: "Verify and continue", exact: true }),
      );
      await page
        .getByRole("button", { name: "Verify and continue", exact: true })
        .click();
      await page
        .getByText("Fixture verification response", { exact: true })
        .waitFor();
      const verify = requests.findLast((r) => r.path === "/auth/2fa/verify");
      assert.deepEqual(verify.body, {
        challengeToken: "fixture-challenge-token",
        code: "123456",
      });
      await page
        .getByRole("button", { name: "Back to sign in", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Sign in to CampusCare", exact: true })
        .waitFor();
      if (width === 375 && theme === "light")
        for (const role of ["student", "mentor"]) {
          await page.goto(base + `/register?role=${role}`);
          await page
            .getByLabel("Full name", { exact: true })
            .fill("Fixture Registration");
          await page
            .getByLabel("Email", { exact: true })
            .fill("registration@example.invalid");
          await page
            .getByLabel("Password", { exact: true })
            .fill("fixture-password");
          await page
            .getByRole("button", { name: "Create account", exact: true })
            .click();
          await page.waitForURL(`**/login?role=${role}`);
          const registered = requests.findLast(
            (r) => r.path === "/auth/register",
          );
          assert.equal(registered.body.role, role);
          assert.equal(
            requests.findLast((r) => r.path === "/profile/onboarding")
              .authorization,
            "Bearer fixture-registration-token",
          );
          assert.equal(
            await page.evaluate(() => localStorage.getItem("campuscare_token")),
            null,
          );
        }
      await page.evaluate(() =>
        localStorage.setItem("campuscare_token", "fixture-session"),
      );
      for (const role of ["student", "mentor", "admin"]) {
        currentRole = role;
        await page.goto(base + "/onboarding");
        await page
          .getByRole("heading", { name: "Profile details", exact: true })
          .waitFor();
        await primary(
          page.getByRole("button", { name: "Save onboarding", exact: true }),
        );
        await check(`onboarding-${role}`, width <= 430);
      }
      currentRole = "admin";
      await page.goto(base + "/profile");
      await page
        .getByRole("button", { name: "Set up 2FA", exact: true })
        .waitFor();
      await check("admin-profile", width <= 430);
      await page
        .getByRole("button", { name: "Set up 2FA", exact: true })
        .click();
      await page.getByAltText("Authenticator setup QR code").waitFor();
      await check("admin-2fa-setup", true);
      const qrBox = await page
        .getByAltText("Authenticator setup QR code")
        .boundingBox();
      assert.ok(Math.abs(qrBox.width - qrBox.height) <= 1);
      await page
        .getByLabel("Verification code", { exact: true })
        .fill("123456");
      await primary(
        page.getByRole("button", { name: "Verify and enable", exact: true }),
      );
      await page
        .getByRole("button", { name: "Verify and enable", exact: true })
        .click();
      await page
        .getByLabel("Verification code to disable", { exact: true })
        .waitFor();
      await check("admin-2fa-disable", true);
      await page
        .getByLabel("Verification code to disable", { exact: true })
        .fill("123456");
      await page
        .getByRole("button", { name: "Disable 2FA", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Set up 2FA", exact: true })
        .waitFor();
      assert.deepEqual(errors, []);
      await context.close();
      console.log(
        `PASS public/auth/account/2FA layouts and fixture flows: ${width}x${height} ${theme}`,
      );
    }
  // First visit must also fit before a theme preference has been chosen.
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
  });
  const page = await context.newPage();
  await page.goto(base + "/");
  await page
    .getByRole("button", { name: "Continue in Light Mode", exact: true })
    .waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 2,
    ),
  );
  await context.close();
  console.log(
    `PASS ${cases} layout states plus first-visit theme chooser. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
