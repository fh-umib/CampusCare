import test from "node:test";
import assert from "node:assert/strict";
import type { PoolClient } from "pg";
import { seedOpportunities } from "./opportunities.seed.js";
import {
  opportunityCatalog,
  preservedUniversityTitle,
} from "./opportunities.catalog.js";
import {
  archivedTag,
  demoTag,
  eventMetadata,
  eventTags,
  featuredTag,
  presentEvent,
  seedTag,
} from "../modules/events/events.metadata.js";
import { eventInput } from "../modules/events/events.validation.js";

test("showcase seed is idempotent, preserves existing edits and labels four demos", async () => {
  const university = {
    id: "existing-university",
    title: preservedUniversityTitle,
    tags: ["inovacion"],
    description: "Existing description",
    max_team_size: 33,
  };
  const original = { ...university, tags: [...university.tags] };
  const rows: Record<string, unknown>[] = [university];
  const sqls: string[] = [];
  const client = {
    query: async (sql: string, params: unknown[] = []) => {
      sqls.push(sql);
      if (sql.includes("FROM users WHERE role='admin'"))
        return { rows: [{ id: "existing-admin" }], rowCount: 1 };
      if (sql.startsWith("SELECT id,tags")) {
        const matches = rows.filter(
          (row) =>
            (row.tags as string[]).includes(String(params[0])) ||
            row.title === params[1],
        );
        return { rows: matches.slice(0, 1), rowCount: matches.length };
      }
      if (sql.startsWith("UPDATE campus_events SET tags=array_append")) {
        const row = rows.find((r) => r.id === params[0])!;
        (row.tags as string[]).push(String(params[1]));
      }
      if (sql.startsWith("SELECT id FROM campus_events")) {
        const matches = rows.filter((r) =>
          (r.tags as string[]).includes(String(params[0])),
        );
        return { rows: matches, rowCount: matches.length };
      }
      if (sql.startsWith("INSERT INTO campus_events")) {
        const columns = sql.match(/\(([^)]+)\)/)![1].split(",");
        const row = {
          ...Object.fromEntries(columns.map((key, i) => [key, params[i]])),
          id: `seed-${rows.length}`,
        };
        rows.push(row);
        return { rows: [{ id: row.id }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    },
  } as unknown as PoolClient;
  const first = await seedOpportunities(
    client,
    new Date("2026-11-12T12:00:00Z"),
  );
  assert.equal(first.filter((r) => r.result === "inserted").length, 5);
  assert.equal(rows.length, 6);
  assert.equal(
    rows.filter((r) => (r.tags as string[]).includes(demoTag)).length,
    4,
  );
  const real = rows.find(
    (r) => r.title === "European Defense Tech Hackathon - Prishtina",
  )!;
  assert.equal(real.registration_deadline, null);
  assert.equal(real.max_team_size, null);
  assert.equal(
    rows.filter((r) => (r.tags as string[]).includes(featuredTag)).length,
    1,
  );
  assert.equal(university.description, original.description);
  assert.equal(university.max_team_size, 33);
  assert.ok(university.tags.includes("inovacion"));
  const demo = rows.find((r) => (r.tags as string[]).includes(demoTag))!;
  demo.title = "Admin-edited demo title";
  (demo.tags as string[]).push(archivedTag);
  const second = await seedOpportunities(
    client,
    new Date("2026-11-12T12:00:00Z"),
  );
  assert.equal(second.filter((r) => r.result === "inserted").length, 0);
  assert.equal(rows.length, 6);
  assert.equal(demo.title, "Admin-edited demo title");
  assert.ok((demo.tags as string[]).includes(archivedTag));
  assert.ok(sqls.every((sql) => !/(DELETE|TRUNCATE|DROP)/.test(sql)));
  assert.equal(opportunityCatalog.filter((item) => item.demo).length, 4);
});

test("internal event flags survive editing, stay out of display tags and respect archive/individual mode", () => {
  const tags = eventTags(["React"], [seedTag("stable-id"), demoTag], {
    featured: true,
  });
  assert.deepEqual(eventMetadata(tags), {
    featured: true,
    archived: false,
    is_demo: true,
  });
  const student = presentEvent({ id: "event", tags }, false);
  assert.deepEqual(student.tags, ["React"]);
  assert.equal(student.featured, true);
  assert.ok(!("is_demo" in student));
  assert.ok(!("source_metadata" in student));
  const admin = presentEvent({ tags }, true);
  assert.equal(admin.is_demo, true);
  assert.ok(admin.source_metadata?.includes(seedTag("stable-id")));
  const archived = eventTags(["React"], tags, { archived: true });
  assert.equal(eventMetadata(archived).featured, false);
  assert.throws(() => eventTags(["campuscare:featured"], [], {}));
  assert.throws(() => eventTags([], [], { featured: "true" }));
  const event = eventInput({
    ...opportunityCatalog[0],
    participation_type: "individual",
    max_team_size: 8,
  });
  assert.equal(event.max_team_size, null);
});
