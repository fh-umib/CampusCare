/* global process, console, localStorage, URL, innerWidth, document */
// Fixture-only browser checks. No backend or real accounts are contacted.
// Set PLAYWRIGHT_MODULE to a file URL for an existing Playwright installation if needed.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  opportunityCatalog,
  preservedUniversityTitle,
} from "../../backend/src/database/opportunities.catalog.ts";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const base = process.env.EVENTS_TEST_URL || "http://127.0.0.1:5187";
const output = join(tmpdir(), "campuscare-events-ui");
await mkdir(output, { recursive: true });
const user = {
  id: "10000000-0000-4000-8000-000000000001",
  fullName: "UI Test Student",
  email: "fixture@example.invalid",
  role: "student",
};
const event = {
  id: "20000000-0000-4000-8000-000000000001",
  title: "UI test opportunity",
  description: "An opportunity fixture used only by browser checks.",
  event_type: "Workshop",
  organizer: "Test organizer",
  location: "Test room",
  start_date: "2099-11-18T10:00:00Z",
  end_date: null,
  registration_deadline: "2099-11-17T10:00:00Z",
  external_link: "https://example.invalid/register",
  max_team_size: 5,
  participation_type: "both",
  status: "registration_open",
  effective_status: "registration_open",
  tags: ["React"],
  requirements: "Frontend and presentation",
  interested: false,
  interested_count: 0,
  team_count: 1,
  recruiting_count: 1,
  my_team_id: null,
};
const team = {
  id: "30000000-0000-4000-8000-000000000001",
  event_id: event.id,
  name: "UI test team",
  description: "Build a test prototype",
  goal: "Prepare a presentation",
  note: "",
  leader_user_id: "another-student",
  max_members: 5,
  status: "recruiting",
  needed_skills: ["React"],
  available_skills: ["SQL"],
  member_count: 1,
  my_status: null,
  match: { skills: ["React"], label: "Strong skill match" },
};
const members = [
  {
    user_id: user.id,
    display_name: "UI S.",
    status: "accepted",
    contribution_skills: ["React"],
  },
  {
    user_id: "applicant",
    display_name: "Test A.",
    status: "pending",
    contribution_skills: ["SQL"],
  },
];
const messages = [];
let discordInviteUrl = null;
const showcaseEvents = [
  {
    ...event,
    id: "university-fixture",
    title: preservedUniversityTitle,
    event_type: "Student Event",
    start_date: "2026-11-18T09:00:00Z",
    featured: false,
    is_demo: false,
  },
  ...opportunityCatalog.map((item) => ({
    ...event,
    ...item,
    id: item.key,
    effective_status: item.status,
    featured: item.preferredFeatured,
    is_demo: item.demo,
    archived: false,
  })),
];
try {
  for (const width of [320, 375, 430, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    await context.addInitScript((theme) => {
      localStorage.setItem("campuscare_token", "fixture-only-token");
      localStorage.setItem("campuscare-theme", theme);
    }, process.env.SMOKE_THEME || "light");
    const page = await context.newPage();
    const errors = [];
    let schemaUnavailable = false;
    let expiredSession = false;
    let showcaseMode = false;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/**", async (route) => {
      const req = route.request(),
        url = new URL(req.url()),
        path = url.pathname.replace(/^\/api/, "");
      const body = req.postDataJSON() || {};
      assert.equal(
        req.headers().authorization,
        "Bearer fixture-only-token",
        `JWT header missing on ${path}`,
      );
      if (
        (schemaUnavailable && path.startsWith("/opportunities")) ||
        (expiredSession && path === "/auth/me")
      ) {
        await route.fulfill({
          status: expiredSession ? 401 : 503,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            code: expiredSession ? "HTTP_401" : "EVENTS_SCHEMA_REQUIRED",
            message: expiredSession
              ? "Invalid or expired token"
              : "Hackathons & Events needs a database update. Ask an administrator to apply the pending events migrations.",
          }),
        });
        return;
      }
      let data = null;
      if (path === "/auth/me") data = { user };
      else if (path === "/notifications") data = [];
      else if (path === "/opportunities")
        data = showcaseMode
          ? showcaseEvents.filter((e) => user.role === "admin" || !e.archived)
          : [event];
      else if (path.endsWith("/my-skills"))
        data = [{ name: "React", id: "skill" }];
      else if (path.endsWith("/unread")) data = [];
      else if (path.endsWith("/interest")) {
        (showcaseMode
          ? showcaseEvents.find(
              (e) => path === `/opportunities/${e.id}/interest`,
            )
          : event
        ).interested = body.active;
      } else if (path.endsWith("/messages")) {
        if (req.method() === "POST")
          messages.push({
            id: `message-${messages.length}`,
            team_id: team.id,
            sender_user_id: user.id,
            display_name: "UI S.",
            message: body.message,
            created_at: new Date().toISOString(),
          });
        data = req.method() === "POST" ? messages.at(-1) : messages;
      } else if (path.endsWith("/requests/applicant")) {
        members[1].status = body.accept ? "accepted" : "declined";
      } else if (path.endsWith("/requests")) {
        team.my_status = "pending";
      } else if (path.endsWith("/note")) {
        team.note = body.note;
      } else if (path.endsWith("/discord")) {
        discordInviteUrl = body.discord_invite_url || null;
      } else if (path.endsWith("/teams")) {
        if (req.method() === "POST") {
          const { discord_invite_url, ...publicBody } = body;
          discordInviteUrl = discord_invite_url || null;
          Object.assign(team, publicBody, {
            leader_user_id: user.id,
            my_status: "accepted",
          });
          data = team;
        } else data = [team];
      } else if (path === `/opportunities/teams/${team.id}`)
        data = {
          ...team,
          members,
          event,
          discord_invite_url: discordInviteUrl,
        };
      else if (
        showcaseMode &&
        showcaseEvents.some((e) => path === `/opportunities/${e.id}`)
      ) {
        const selected = showcaseEvents.find(
          (e) => path === `/opportunities/${e.id}`,
        );
        if (req.method() === "PUT") {
          if (body.featured)
            showcaseEvents.forEach((e) => {
              e.featured = false;
            });
          Object.assign(selected, body);
          if (selected.archived) selected.featured = false;
        }
        data = selected;
      } else if (path === `/opportunities/${event.id}`) data = event;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Fixture", data }),
      });
    });
    const noOverflow = async (label) => {
      await page.waitForTimeout(150);
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        width: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.width <= dimensions.viewport,
        `${label} at ${width}px overflows: ${JSON.stringify(dimensions)}`,
      );
      await page.screenshot({
        path: join(output, `${label}-${width}.png`),
        fullPage: true,
      });
    };
    await page.goto(`${base}/opportunities`);
    await page
      .getByRole("link", { name: "View opportunity" })
      .waitFor({ timeout: 12000 })
      .catch(async (error) => {
        console.log(await page.locator("body").innerText());
        console.log("Page errors", errors);
        await page.screenshot({
          path: join(output, "failure.png"),
          fullPage: true,
        });
        throw error;
      });
    await noOverflow("discovery");
    await page.getByLabel("Search opportunities").fill("nothing matches");
    assert.equal(
      await page.getByRole("link", { name: "View opportunity" }).count(),
      0,
    );
    await page.getByLabel("Search opportunities").fill("React");
    await page
      .getByLabel("Event type", { exact: true })
      .selectOption("Workshop");
    await page.getByRole("link", { name: "View opportunity" }).click();
    await page
      .getByRole("heading", { name: event.title, exact: true })
      .waitFor();
    await noOverflow("detail");
    assert.equal(
      await page.getByRole("link", { name: "Open Discord" }).count(),
      0,
    );
    team.my_status = null;
    if (event.interested)
      await page.getByRole("button", { name: "Withdraw interest" }).click();
    await page.getByRole("button", { name: "I’m interested" }).click();
    await page.getByRole("button", { name: "Withdraw interest" }).waitFor();
    await page.getByRole("checkbox", { name: "React", exact: true }).check();
    await page
      .getByRole("button", { name: "Request to join", exact: true })
      .click();
    await page.getByRole("button", { name: "Request pending" }).waitFor();
    await page
      .getByRole("button", { name: "Create a team", exact: true })
      .click();
    await page.getByLabel("Team name", { exact: true }).fill("UI test team");
    await page.getByLabel("Short description").fill("Build a test prototype");
    await page.getByLabel("Skills we need").fill("React, SQL");
    await page
      .getByLabel("Discord workspace (optional)", { exact: true })
      .fill("https://discord.gg/fixture-invite");
    await noOverflow("create-team");
    await page
      .getByRole("button", { name: "Create team", exact: true })
      .click();
    await page.getByRole("heading", { name: "CampusCare Team Chat" }).waitFor();
    await page.getByRole('link',{name:'Team settings',exact:true}).click();
    await page.getByText('Team settings · Pinned objective',{exact:true}).click();
    await page.getByLabel('Pinned team objective',{exact:true}).fill('Prepare a focused team presentation.');
    await page.getByRole('button',{name:'Save objective',exact:true}).click();
    await page.getByRole('region',{name:'Team overview',exact:true}).getByText('Prepare a focused team presentation.',{exact:true}).waitFor();
    await page.getByText('Team settings · Pinned objective',{exact:true}).click();
    await noOverflow("workspace");
    const discordButton = page
      .getByRole("link", {
        name: "Open Discord",
        exact: true,
      })
      .first();
    assert.equal(
      await discordButton.getAttribute("href"),
      "https://discord.gg/fixture-invite",
    );
    assert.equal(await discordButton.getAttribute("target"), "_blank");
    assert.equal(
      await discordButton.getAttribute("rel"),
      "noopener noreferrer",
    );
    await page.getByText("Edit link", { exact: true }).click();
    await page
      .getByRole("button", { name: "Remove Discord workspace", exact: true })
      .click();
    await page.getByText("Add Discord workspace", { exact: true }).waitFor();
    await page
      .getByLabel("Discord workspace (optional)", { exact: true })
      .fill(`https://discord.com/invite/${"a".repeat(120)}`);
    await page
      .getByRole("button", { name: "Save Discord workspace", exact: true })
      .click();
    await discordButton.waitFor();
    await noOverflow("discord-leader");
    team.leader_user_id = "another-student";
    await page.reload();
    await discordButton.waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Save Discord workspace", exact: true })
        .count(),
      0,
    );
    assert.equal(await page.getByRole('button',{name:'Save objective',exact:true}).count(),0);
    await noOverflow("discord-member");
    discordInviteUrl = null;
    await page.reload();
    await page
      .getByText("Your team has not added a Discord workspace yet.", {
        exact: true,
      })
      .waitFor();
    team.leader_user_id = user.id;
    await page.reload();
    await page.getByRole("button", { name: "Accept", exact: true }).waitFor();
    await page.getByRole("button", { name: "Accept", exact: true }).click();
    await page
      .getByLabel("Write to your team", { exact: true })
      .fill(`Browser test at ${width}px`);
    await page.getByRole("button", { name: "Send message" }).click();
    await page
      .getByText(`Browser test at ${width}px`, { exact: true })
      .waitFor();
    await noOverflow("chat");
    const chatPanel = page.getByRole("region", {
      name: "CampusCare Team Chat",
      exact: true,
    });
    const beforeHeight = (await chatPanel.boundingBox()).height;
    for (let i = 0; i < 40; i++)
      messages.push({
        id: `layout-${width}-${i}`,
        team_id: team.id,
        sender_user_id: user.id,
        display_name: "UI S.",
        message: `Workspace layout history ${width}-${i}`,
        created_at: new Date().toISOString(),
      });
    await page.reload();
    await page
      .getByText(`Workspace layout history ${width}-39`, { exact: true })
      .waitFor();
    const afterBox = await chatPanel.boundingBox();
    assert.equal(afterBox.height, beforeHeight);
    assert.ok(afterBox.height <= 440);
    assert.ok(
      await page
        .getByRole("log", { name: "Team messages" })
        .evaluate((el) => el.scrollHeight > el.clientHeight),
    );
    const composer = await page
      .getByLabel("Write to your team", { exact: true })
      .boundingBox();
    assert.ok(composer.y + composer.height <= afterBox.y + afterBox.height);
    await noOverflow("compact-chat-history");
    if (width === 1280) {
      user.role = "admin";
      await page.goto(`${base}/opportunities`);
      await page
        .getByRole("button", { name: "Create event", exact: true })
        .click();
      await page.getByLabel("Title", { exact: true }).fill("Admin UI fixture");
      await page
        .getByLabel("Organizer", { exact: true })
        .fill("Test organizer");
      await page.getByLabel("Location", { exact: true }).fill("Test room");
      await page
        .getByLabel("Start date", { exact: true })
        .fill("2099-11-18T10:00");
      await page
        .getByLabel("Overview", { exact: true })
        .fill("Test description");
      await noOverflow("admin-form");
      await page
        .getByRole("button", { name: "Save opportunity", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Create event", exact: true })
        .waitFor();
      await page.getByRole("link", { name: "View opportunity" }).click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .click();
      await page.getByLabel("Status", { exact: true }).selectOption("closed");
      await page
        .getByRole("button", { name: "Save opportunity", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: "Request to join", exact: true })
          .count(),
        0,
      );
      console.log(
        "PASS Admin create/edit/status forms and student-only actions hidden",
      );
    }
    showcaseMode = true;
    user.role = "student";
    await page.goto(`${base}/opportunities`);
    await page
      .getByRole("link", { name: "View opportunity" })
      .first()
      .waitFor();
    assert.equal(
      await page.getByRole("link", { name: "View opportunity" }).count(),
      6,
    );
    assert.equal(
      await page.getByText("Featured Opportunity", { exact: true }).count(),
      1,
    );
    assert.equal(
      await page.getByText("Demo record", { exact: true }).count(),
      0,
    );
    await noOverflow("showcase-discovery");
    await page.getByLabel("Search opportunities").fill("European");
    assert.equal(
      await page.getByRole("link", { name: "View opportunity" }).count(),
      1,
    );
    await page.getByLabel("Search opportunities").fill("");
    await page
      .getByLabel("Event type", { exact: true })
      .selectOption("Workshop");
    await page.getByRole("link", { name: "View opportunity" }).click();
    await page
      .getByRole("heading", {
        name: "Student Technology Workshop",
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Create a team", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("link", { name: "Find a team", exact: true })
        .count(),
      0,
    );
    assert.equal(await page.getByText("Team size", { exact: true }).count(), 0);
    assert.equal(
      await page
        .getByRole("heading", {
          name: "Team requirements & useful skills",
          exact: true,
        })
        .count(),
      0,
    );
    await page
      .getByRole("button", { name: /^(I’m interested|Withdraw interest)$/ })
      .waitFor();
    if (
      await page
        .getByRole("button", { name: "Withdraw interest", exact: true })
        .count()
    )
      await page
        .getByRole("button", { name: "Withdraw interest", exact: true })
        .click();
    await page
      .getByRole("button", { name: "I’m interested", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Withdraw interest", exact: true })
      .waitFor();
    await noOverflow("individual-detail");
    await page
      .getByRole("link", { name: "All opportunities", exact: true })
      .click();
    await page.getByLabel("Event type", { exact: true }).selectOption("");
    await page
      .getByRole("checkbox", { name: "Team opportunities", exact: true })
      .check();
    assert.equal(
      await page.getByRole("link", { name: "View opportunity" }).count(),
      4,
    );
    await page.getByLabel("Search opportunities").fill("European");
    await page.getByRole("link", { name: "View opportunity" }).click();
    await page
      .getByRole("button", { name: "Create a team", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("link", { name: "Open Discord", exact: true })
        .count(),
      0,
    );
    if (width === 1280) {
      user.role = "admin";
      await page.goto(`${base}/opportunities`);
      await page
        .getByRole("button", { name: "Create event", exact: true })
        .waitFor();
      assert.equal(
        await page.getByText("Demo record", { exact: true }).count(),
        4,
      );
      await page.getByLabel("Search opportunities").fill("Campus Innovation");
      await page.getByRole("link", { name: "View opportunity" }).click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: "Featured opportunity", exact: true })
        .check();
      await page
        .getByRole("button", { name: "Save opportunity", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .waitFor();
      await page
        .getByRole("link", { name: "All opportunities", exact: true })
        .click();
      await page.getByLabel("Search opportunities").fill("");
      assert.equal(
        await page.getByText("Featured Opportunity", { exact: true }).count(),
        1,
      );
      await page.getByLabel("Search opportunities").fill("Campus Innovation");
      await page.getByRole("link", { name: "View opportunity" }).click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .click();
      await page
        .getByRole("checkbox", {
          name: "Archived (hidden from discovery)",
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Save opportunity", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Edit opportunity", exact: true })
        .waitFor();
      await page
        .getByRole("link", { name: "All opportunities", exact: true })
        .click();
      assert.equal(
        await page.getByRole("link", { name: "View opportunity" }).count(),
        0,
      );
      await page
        .getByRole("checkbox", { name: "Show archived", exact: true })
        .check();
      assert.equal(
        await page.getByRole("link", { name: "View opportunity" }).count(),
        1,
      );
      console.log(
        "PASS Admin demo indicators, featured replacement and archive visibility",
      );
    }
    console.log(
      `PASS six-opportunity discovery, search/filters, interest and individual/team feature gates at ${width}px`,
    );
    showcaseMode = false;
    schemaUnavailable = true;
    await page.goto(`${base}/opportunities`);
    await page
      .getByRole("alert")
      .filter({ hasText: "needs a database update" })
      .waitFor();
    assert.equal(
      await page
        .getByText("No opportunities have been published yet.", { exact: true })
        .count(),
      0,
    );
    schemaUnavailable = false;
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await page.getByRole("link", { name: "View opportunity" }).waitFor();
    if (width === 1280) {
      expiredSession = true;
      await page.reload();
      await page.waitForURL("**/login");
      assert.equal(
        await page.evaluate(() => localStorage.getItem("campuscare_token")),
        null,
      );
      console.log(
        "PASS missing-schema error/Retry, JWT headers and expired-session rejection",
      );
    }
    assert.deepEqual(errors, []);
    await context.close();
    members[1].status = "pending";
    team.my_status = null;
    team.leader_user_id = "another-student";
    console.log(
      `PASS discovery, filters, interest, team request/create/accept, workspace, chat and overflow at ${width}px`,
    );
  }
  console.log(`Screenshots: ${output}`);
} finally {
  await browser.close();
}
