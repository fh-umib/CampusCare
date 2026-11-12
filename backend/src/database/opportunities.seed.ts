import type { PoolClient } from "pg";
import {
  opportunityCatalog,
  preservedUniversityKey,
  preservedUniversityTitle,
} from "./opportunities.catalog.js";
import { eventInput } from "../modules/events/events.validation.js";
import {
  demoTag,
  featuredTag,
  seedTag,
} from "../modules/events/events.metadata.js";

// Caller owns the transaction. A shared advisory lock serializes seed/admin writes.
export async function seedOpportunities(client: PoolClient, now = new Date()) {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('campuscare:event-metadata'))",
  );
  const admin = (
    await client.query<{ id: string }>(
      "SELECT id FROM users WHERE role='admin' ORDER BY created_at,id LIMIT 1",
    )
  ).rows[0];
  if (!admin)
    throw new Error(
      "An existing Admin account is required. No accounts are created by this seed.",
    );
  const university = (
    await client.query<{ id: string; tags: string[] }>(
      `SELECT id,tags FROM campus_events WHERE $1=ANY(tags) OR title=$2 ORDER BY CASE WHEN $1=ANY(tags) THEN 0 ELSE 1 END,created_at LIMIT 1 FOR UPDATE`,
      [seedTag(preservedUniversityKey), preservedUniversityTitle],
    )
  ).rows[0];
  if (!university)
    throw new Error(
      "The existing 18 November university event was not found. Nothing was seeded.",
    );
  if (!university.tags.includes(seedTag(preservedUniversityKey)))
    await client.query(
      "UPDATE campus_events SET tags=array_append(tags,$2) WHERE id=$1",
      [university.id, seedTag(preservedUniversityKey)],
    );
  const results = [
    { title: preservedUniversityTitle, result: "preserved", id: university.id },
  ];
  for (const item of opportunityCatalog) {
    const marker = seedTag(item.key);
    const existing = (
      await client.query<{ id: string; tags: string[] }>(
        `SELECT id,tags FROM campus_events WHERE $1=ANY(tags) OR title=$2 ORDER BY CASE WHEN $1=ANY(tags) THEN 0 ELSE 1 END,created_at LIMIT 1 FOR UPDATE`,
        [marker, item.title],
      )
    ).rows[0];
    if (existing) {
      // Keep user edits, archives, interest, teams and existing deadlines/limits.
      if (!existing.tags.includes(marker))
        await client.query(
          "UPDATE campus_events SET tags=array_append(tags,$2) WHERE id=$1",
          [existing.id, marker],
        );
      results.push({ title: item.title, result: "preserved", id: existing.id });
      continue;
    }
    const event = eventInput({ ...item, tags: [...item.tags] });
    const hasFeatured = (
      await client.query(
        "SELECT id FROM campus_events WHERE $1=ANY(tags) LIMIT 1",
        [featuredTag],
      )
    ).rowCount;
    event.tags.push(
      marker,
      `campuscare:source:${item.demo ? "demo" : "user-verified-official-link"}`,
    );
    if (item.demo) event.tags.push(demoTag);
    if (
      item.preferredFeatured &&
      !hasFeatured &&
      new Date(item.start_date) > now
    )
      event.tags.push(featuredTag);
    const keys = Object.keys(event),
      values = Object.values(event);
    const row = (
      await client.query<{ id: string }>(
        `INSERT INTO campus_events (${keys.join(",")},created_by) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")},$${keys.length + 1}) RETURNING id`,
        [...values, admin.id],
      )
    ).rows[0];
    results.push({ title: item.title, result: "inserted", id: row.id });
  }
  return results;
}
