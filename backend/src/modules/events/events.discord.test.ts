import test from "node:test";
import assert from "node:assert/strict";
import { pool, queryDatabase } from "../../config/database.js";
import { eventsService } from "./events.service.js";
import { discordInvite } from "./events.validation.js";
import { auditService } from "../security/audit.service.js";
import type { PublicUser } from "../../types/user.js";

const teamId = "30000000-0000-4000-8000-000000000001";
const eventId = "20000000-0000-4000-8000-000000000001";
const user = (
  id: string,
  role: PublicUser["role"] = "student",
): PublicUser => ({
  id,
  role,
  fullName: "Test Student",
  email: "private@example.invalid",
  createdAt: new Date(),
  updatedAt: new Date(),
});
const leader = user("10000000-0000-4000-8000-000000000001");
const member = user("10000000-0000-4000-8000-000000000002");
const pending = user("10000000-0000-4000-8000-000000000003");
const declined = user("10000000-0000-4000-8000-000000000004");
const unrelated = user("10000000-0000-4000-8000-000000000005");

test("valid discord.gg URL accepted", () =>
  assert.equal(
    discordInvite("https://discord.gg/example"),
    "https://discord.gg/example",
  ));
test("valid discord.com/invite URL accepted", () =>
  assert.equal(
    discordInvite("https://discord.com/invite/example"),
    "https://discord.com/invite/example",
  ));
test("HTTP invite rejected", () =>
  assert.throws(() => discordInvite("http://discord.gg/example")));
test("invalid non-Discord URLs and URL tricks rejected", () => {
  for (const value of [
    "https://example.com/invite/example",
    "https://discord.gg.evil.test/example",
    "https://discord.com/other/example",
    "https://discord.gg@example.com/example",
    "https://user:password@discord.gg/example",
    "https://discord.gg:444/example",
    "https://discord.com/invite/../example",
    "https://discord.gg/example?redirect=other",
    "https://discord.gg/example#secret",
    "javascript:alert(1)",
    "https://discord.gg/",
    "https://discord.com/invite/",
    123,
    {},
    ["https://discord.gg/example"],
  ])
    assert.throws(() => discordInvite(value), String(value));
  assert.equal(discordInvite(null), null);
  assert.equal(discordInvite(" "), null);
});

test("Discord membership and editing permissions", async (t) => {
  const db = pool as unknown as Record<string, unknown>;
  const original = db.query,
    oldAudit = auditService.record,
    oldList = eventsService.list;
  const team = {
    id: teamId,
    event_id: eventId,
    name: "Test team",
    leader_user_id: leader.id,
  };
  let invite: string | null = null;
  const audits: unknown[] = [],
    queries: string[] = [];
  const accepted = new Set([leader.id, member.id]);
  try {
    db.query = async (sql: string, params: unknown[] = []) => {
      queries.push(sql);
      let rows: Record<string, unknown>[] = [];
      if (
        sql.startsWith(
          "SELECT t.id,t.event_id,t.name,t.description,t.goal,t.note",
        )
      )
        rows = accepted.has(String(params[1])) ? [team] : [];
      else if (sql.startsWith("SELECT discord_invite_url"))
        rows = [{ discord_invite_url: invite }];
      else if (sql.startsWith('SELECT t.id,t.event_id,t.name,t.description,t.goal,t.leader_user_id'))
        rows = [{...team,needed_skills:['React']}];
      else if (sql.startsWith("UPDATE event_teams SET discord_invite_url"))
        invite = params[1] as string | null;
      else if (sql.startsWith("SELECT m.user_id,m.status"))
        rows = [
          {
            user_id: leader.id,
            status: "accepted",
            contribution_skills: [],
            full_name: "Test Student",
          },
        ];
      return { rows, rowCount: rows.length };
    };
    auditService.record = async (value) => {
      audits.push(value);
      return true;
    };
    eventsService.list = async () => [{ id: eventId, tags:[], featured:false, archived:false }];
    await t.test("leader can add Discord invite", async () => {
      await eventsService.updateDiscord(
        teamId,
        { discord_invite_url: "https://discord.gg/private-test" },
        leader,
      );
      assert.equal(invite, "https://discord.gg/private-test");
    });
    await t.test("accepted member can view it", async () => {
      assert.equal(
        (await eventsService.workspace(teamId, member)).discord_invite_url,
        invite,
      );
    });
    await t.test('public team cards and socket authorization omit the invite', async()=>{
      const before=queries.length;
      const cards=await eventsService.teams(eventId,user(member.id,'mentor'));
      const authorized=await eventsService.authorize(teamId,member);
      assert.equal(cards.length,1);
      assert.ok(!('discord_invite_url' in cards[0]));
      assert.ok(!('discord_invite_url' in authorized));
      assert.ok(queries.slice(before).every(sql=>!sql.includes('discord_invite_url')&&!sql.includes('t.*')));
    });
    for (const [label, current] of [
      ["pending applicant", pending],
      ["declined applicant", declined],
      ["unrelated student", unrelated],
      ["Mentor", user(member.id, "mentor")],
      ["Admin", user(member.id, "admin")],
    ] as const) {
      await t.test(`${label} cannot view Discord invite`, async () => {
        const before = queries.length;
        await assert.rejects(eventsService.workspace(teamId, current));
        assert.ok(
          !queries
            .slice(before)
            .some((sql) => sql.startsWith("SELECT discord_invite_url")),
        );
      });
    }
    await t.test("accepted member cannot edit it", async () => {
      await assert.rejects(
        eventsService.updateDiscord(
          teamId,
          { discord_invite_url: "https://discord.gg/replacement" },
          member,
        ),
        /Only the team leader/,
      );
      assert.equal(invite, "https://discord.gg/private-test");
    });
    await t.test("leader can update Discord invite", async () => {
      await eventsService.updateDiscord(
        teamId,
        { discord_invite_url: "https://discord.com/invite/replacement" },
        leader,
      );
      assert.equal(invite, "https://discord.com/invite/replacement");
    });
    await t.test("leader can remove it", async () => {
      await eventsService.updateDiscord(
        teamId,
        { discord_invite_url: null },
        leader,
      );
      assert.equal(
        (await eventsService.workspace(teamId, member)).discord_invite_url,
        null,
      );
    });
    await t.test("invalid invite rejected before database write", async () => {
      await assert.rejects(
        eventsService.updateDiscord(
          teamId,
          { discord_invite_url: "https://example.invalid" },
          leader,
        ),
      );
      assert.equal(invite, null);
    });
    await t.test("audit never contains invite URLs", () => {
      assert.ok(audits.length > 0);
      assert.ok(!JSON.stringify(audits).includes("https://"));
    });
  } finally {
    db.query = original;
    auditService.record = oldAudit;
    eventsService.list = oldList;
  }
});

test("missing event schema reports an actionable 503 instead of an empty result", async () => {
  const db = pool as unknown as Record<string, unknown>;
  const original = db.query;
  try {
    db.query = async () => {
      throw Object.assign(new Error("relation campus_events does not exist"), {
        code: "42P01",
      });
    };
    await assert.rejects(
      queryDatabase("SELECT * FROM campus_events"),
      (error) =>
        !!error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "EVENTS_SCHEMA_REQUIRED" &&
        "statusCode" in error &&
        error.statusCode === 503,
    );
  } finally {
    db.query = original;
  }
});
