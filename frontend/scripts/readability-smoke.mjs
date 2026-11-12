/* global process, console, localStorage, document, getComputedStyle, innerWidth, URL */
// Fixture-only contrast sampling. Gradients require screenshot review and are
// reported separately rather than treated as a solid-color WCAG certification.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const output = join(tmpdir(), "campuscare-readability");
await mkdir(output, { recursive: true });
const date = "2026-11-12T09:00:00Z";
const stats = {
  totalUsers: 45,
  totalHelpRequests: 3,
  openHelpRequests: 1,
  totalSkills: 2,
  totalStudentSkills: 1,
  totalStressRecords: 1,
  averageStressLevel: 3,
  moodCounts: { calm: 1 },
  totalMoodRecords: 1,
  totalLostFoundItems: 1,
  lostFoundOpen: 1,
  lostFoundResolved: 0,
  recentActivity: [],
};
const event = {
  id: "event-fixture",
  title: "Campus Innovation Challenge",
  description: "Build a useful campus prototype.",
  event_type: "Hackathon",
  organizer: "CampusCare",
  location: "Innovation Hub",
  start_date: "2099-11-18T10:00:00Z",
  registration_deadline: "2099-11-17T10:00:00Z",
  max_team_size: 5,
  participation_type: "both",
  status: "registration_open",
  effective_status: "registration_open",
  tags: ["React"],
  requirements: "Presentation",
  interested: false,
  interested_count: 2,
  team_count: 1,
  recruiting_count: 1,
  my_team_id: "team-fixture",
};
const team = {
  id: "team-fixture",
  event_id: event.id,
  name: "Campus Builders",
  match: { skills: ["React"], label: "Strong skill match" },
  description: "Build a campus prototype.",
  goal: "Prepare our presentation",
  note: "Review our prototype",
  leader_user_id: "fixture",
  max_members: 5,
  status: "recruiting",
  needed_skills: ["Design"],
  available_skills: ["React"],
  member_count: 1,
  my_status: "accepted",
  members: [
    {
      user_id: "fixture",
      display_name: "Fixture Student",
      status: "accepted",
      contribution_skills: ["React"],
    },
  ],
  event,
  discord_invite_url: "https://discord.gg/fixture",
};
const records = [
  {
    id: "fixture",
    userId: "fixture",
    title: "Project support",
    description: "Fixture description for readability review.",
    studentName: "Fixture Student",
    reporterName: "Fixture Student",
    category: "subject",
    status: "open",
    isAnonymous: false,
    replies: [],
    createdAt: date,
    updatedAt: date,
    recordedAt: date,
    stressLevel: 3,
    mood: "calm",
    note: "Fixture note",
    subject: "Computing",
    itemType: "lost",
    location: "Library",
    itemDate: date,
  },
];
const results = [];
try {
  for (const theme of ["light", "dark"])
    for (const width of (process.env.READABILITY_WIDTHS || "320,375,430,1280")
      .split(",")
      .map(Number)) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addInitScript((theme) => {
        localStorage.setItem("campuscare-theme", theme);
      }, theme);
      const page = await context.newPage();
      let role = "student";
      const errors = [];
      page.on("pageerror", (e) => errors.push(page.url() + ": " + e.message));
      await page.route("**/api/**", async (route) => {
        const path = new URL(route.request().url()).pathname.replace(
          /^\/api/,
          "",
        );
        let data = [];
        if (path === "/auth/me")
          data = {
            user: {
              id: "fixture",
              fullName: "Fixture Account",
              email: "fixture@example.invalid",
              role,
              createdAt: date,
            },
          };
        else if (path === "/profile")
          data = {
            onboardingCompleted: true,
            department: "Computing",
            studyYear: "2",
            expertiseAreas: "Projects",
            availability: "Weekly",
          };
        else if (path === "/opportunities") data = [event];
        else if (path === "/opportunities/event-fixture") data = event;
        else if (path.endsWith("/teams")) data = [team];
        else if (path === "/opportunities/teams/team-fixture") data = team;
        else if (path.endsWith("/messages"))
          data = [
            {
              id: "message",
              sender_user_id: "fixture",
              display_name: "Fixture Student",
              message: "Prototype ready for review",
              created_at: date,
            },
          ];
        else if (path === "/notifications")
          data = [
            {
              id: "notice",
              type: "system",
              title: "Campus update",
              message: "Your team workspace is ready.",
              link: null,
              isRead: false,
              createdAt: date,
            },
          ];
        else if (path === "/dashboard/stats") data = stats;
        else if (path.startsWith("/analytics/"))
          data = {
            role,
            period: { start: date, end: date },
            metrics: { activity: 3 },
            distributions: { moduleUsage: [{ label: "Skills", value: 3 }] },
            series: {},
            heatmap: [],
            limitations: ["Fixture report"],
            comparison: {},
          };
        else if (
          ["/stress", "/mood", "/lost-found", "/help-requests"].includes(path)
        )
          data = records;
        else if (path === "/stress/summary")
          data = [{ subject: "Computing", count: 1, averageStressLevel: 3 }];
        else if (path === "/mood/summary") data = [{ mood: "calm", count: 1 }];
        else if (path === "/security/2fa/status") data = { enabled: false };
        else if (path === "/skills")
          data = [
            {
              id: "skill",
              name: "React",
              category: "Development",
              createdAt: date,
            },
          ];
        else if (path === "/skills/my-skills")
          data = [
            {
              id: "student-skill",
              userId: "fixture",
              skillId: "skill",
              name: "React",
              category: "Development",
              level: "intermediate",
              availability: "available",
              createdAt: "2026-10-01T09:00:00Z",
            },
          ];
        else if (path === "/skills/students")
          data = [
            {
              userId: "fixture",
              fullName: "Fixture Student",
              role: "student",
              skills: [
                {
                  id: "skill",
                  name: "React",
                  category: "Development",
                  level: "intermediate",
                  availability: "available",
                },
              ],
            },
          ];
        else if (path === "/support/conversations")
          data = [
            {
              id: "support",
              helpRequestId: "fixture",
              participantLabel: "Mentor",
              status: "open",
              isAnonymous: true,
            },
          ];
        else if (path.startsWith("/support/conversations/"))
          data = {
            conversation: {
              id: "support",
              helpRequestId: "fixture",
              participantLabel: "Mentor",
              status: "open",
              isAnonymous: true,
            },
            messages: [
              {
                id: "support-message",
                sender: { role: "student", displayName: "Fixture Student" },
                createdAt: date,
                message: "A fixture support message.",
              },
            ],
          };
        else if (
          path === "/security/activity" ||
          path === "/security/audit-logs"
        )
          data = {
            items: [
              {
                id: "audit",
                timestamp: date,
                createdAt: date,
                actor: "Fixture Admin",
                role: "admin",
                action: "admin_viewed_users",
                entity: "users",
                context: null,
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          };
        else if (path === "/admin/users")
          data = {
            items: [
              {
                id: "fixture",
                full_name: "Fixture Mentor",
                email: "mentor@example.invalid",
                role: "mentor",
                created_at: date,
                profile_completed: true,
                last_login_at: date,
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            summary: { total_users: 45, students: 30, mentors: 10, admins: 5 },
          };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data }),
        });
      });
      await page.goto(process.env.READABILITY_URL || "http://127.0.0.1:5187");
      const routes = [
        "/",
        "/start",
        "/register?role=student",
        "/login?role=student",
        "/forgot-password",
        "/not-found",
        "/dashboard",
        "/silent-help",
        "/stress-tracker",
        "/mood-campus",
        "/ai-study-assistant",
        "/skill-map",
        "/opportunities",
        "/lost-found",
        "/profile",
      ];
      for (const route of [
        ...routes,
        "mentor:/dashboard",
        "mentor:/silent-help",
        "mentor:/profile",
        "admin:/dashboard",
        "admin:/admin/users",
        "admin:/audit-logs",
        "admin:/profile",
        "student:/opportunities/event-fixture",
        "student:/opportunities/event-fixture/teams/team-fixture",
        "admin:/opportunities",
      ]) {
        const [nextRole, path] = route.includes(":")
          ? route.split(":")
          : ["student", route];
        if (
          process.env.READABILITY_PATHS &&
          !process.env.READABILITY_PATHS.split(",").includes(path)
        )
          continue;
        role = nextRole;
        await page.evaluate(
          (auth) =>
            auth
              ? localStorage.setItem("campuscare_token", "fixture-only")
              : localStorage.removeItem("campuscare_token"),
          path === "/dashboard" ||
            routes.indexOf(path) >= 6 ||
            route.includes(":"),
        );
        await page.goto(
          (process.env.READABILITY_URL || "http://127.0.0.1:5187") + path,
          { waitUntil: "domcontentloaded" },
        );
        await page.locator("h1").first().waitFor({ timeout: 12000 });
        await page.waitForTimeout(500);
        await page.waitForFunction(
          () =>
            !document.querySelector('[aria-busy="true"]') &&
            !document.body.innerText.includes("Loading "),
          undefined,
          { timeout: 8000 },
        );
        await page.addStyleTag({
          content:
            "*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important}",
        });
        await page.waitForTimeout(100);
        if (route === "admin:/profile")
          await page.getByRole("button", { name: /^Notifications/ }).click();
        const sample = await page.evaluate(() => {
          const rgb = (s) => {
            const n = s.match(/[\d.]+/g)?.map(Number);
            if (s.startsWith("color(") && n)
              for (let i = 0; i < 3; i++) n[i] *= 255;
            return n?.length >= 3
              ? [...n.slice(0, 3), n[3] ?? 1]
              : [0, 0, 0, 0];
          };
          const over = (a, b) =>
            a
              .slice(0, 3)
              .map((c, i) => c * a[3] + b[i] * (1 - a[3]))
              .concat(1);
          const lum = (c) =>
            c
              .slice(0, 3)
              .map((v) => {
                v /= 255;
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
              })
              .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
          const failures = [];
          let checked = 0,
            gradients = 0;
          for (const el of document.querySelectorAll("body *")) {
            const style = getComputedStyle(el),
              rect = el.getBoundingClientRect();
            const placeholder = el.matches(
              "input[placeholder],textarea[placeholder]",
            )
              ? getComputedStyle(el, "::placeholder")
              : null;
            if (
              !rect.width ||
              !rect.height ||
              style.visibility === "hidden" ||
              ["SCRIPT", "STYLE", "SVG", "PATH"].includes(el.tagName)
            )
              continue;
            if (
              !placeholder &&
              ![...el.childNodes].some(
                (n) => n.nodeType === 3 && n.textContent.trim(),
              )
            )
              continue;
            if (el.closest(".sr-only")) continue;
            const chain = [];
            let p = el,
              gradient = false;
            while (p) {
              const s = getComputedStyle(p);
              chain.unshift(s);
              p = p.parentElement;
            }
            let bg = [255, 255, 255, 1];
            for (const s of chain) {
              const color = rgb(s.backgroundColor);
              if (color[3] >= 0.85) gradient = false;
              if (s.backgroundImage !== "none") gradient = true;
              bg = over(color, bg);
            }
            if (gradient) {
              gradients++;
              continue;
            }
            const fg = rgb(placeholder?.color || style.color);
            fg[3] *= chain.reduce((v, s) => v * Number(s.opacity), 1);
            const l = [lum(over(fg, bg)), lum(bg)].sort((a, b) => b - a),
              ratio = (l[0] + 0.05) / (l[1] + 0.05);
            const large =
              parseFloat(style.fontSize) >= 24 ||
              (parseFloat(style.fontSize) >= 18.66 &&
                Number(style.fontWeight) >= 700);
            checked++;
            if (ratio < (large ? 3 : 4.5))
              failures.push({
                text: (placeholder
                  ? el.getAttribute("placeholder")
                  : el.textContent
                )
                  .trim()
                  .slice(0, 55),
                parent: el.parentElement.className,
                selector: `${el.tagName.toLowerCase()}.${String(el.className).split(" ").join(".")}`,
                ratio: +ratio.toFixed(2),
                color: style.color,
                background: bg,
              });
          }
          document.documentElement.style.overflowX = "visible";
          return {
            checked,
            gradients,
            failures,
            overflow: document.documentElement.scrollWidth > innerWidth + 2,
          };
        });
        results.push({ theme, width, role, path, ...sample });
        if (width === 375 || width === 1280)
          await page.screenshot({
            path: join(
              output,
              `${theme}-${width}-${role}-${path.replace(/[^a-z0-9]/gi, "_")}.png`,
            ),
            fullPage: true,
          });
      }
      assert.deepEqual(errors, [], "No page runtime errors");
      await context.close();
    }
} finally {
  await browser.close();
}
await writeFile(join(output, "report.json"), JSON.stringify(results, null, 2));
const failures = results.flatMap((r) =>
  r.failures.map((f) => ({ theme: r.theme, path: r.path, ...f })),
);
const unique = [
  ...new Map(
    failures.map((f) => [`${f.theme}:${f.selector}:${f.color}`, f]),
  ).values(),
];
console.log(
  JSON.stringify(
    {
      states: results.length,
      checked: results.reduce((a, r) => a + r.checked, 0),
      overflows: results
        .filter((r) => r.overflow)
        .map((r) => `${r.theme} ${r.width} ${r.path}`),
      failures: unique,
      output,
    },
    null,
    2,
  ),
);
assert.equal(results.filter((r) => r.overflow).length, 0, "No page overflow");
if (process.env.READABILITY_STRICT !== "0")
  assert.equal(failures.length, 0, "Solid-color text contrast");
