import type { PoolClient } from "pg";
import { pool, queryDatabase } from "../../config/database.js";
import type { PublicUser } from "../../types/user.js";
import { AppError } from "../../utils/httpError.js";
import { logger } from "../../utils/logger.js";
import { requireUuid } from "../../utils/moduleValidation.js";
import { skillRepository } from "../../repositories/skill.repository.js";
import { notificationService } from "../../services/notification.service.js";
import { auditService } from "../security/audit.service.js";
import { emitToUser } from "../../realtime/realtime.events.js";
import {
  archivedTag,
  eventTags,
  featuredTag,
  presentEvent,
} from "./events.metadata.js";
import {
  capacity,
  discordInvite,
  eventInput,
  matching,
  strings,
  text,
} from "./events.validation.js";

const fail = (message: string, code = 403): never => {
  throw new AppError(code, message);
};
export function requireStudent(user: PublicUser) {
  if (user.role !== "student")
    fail("Only students can participate in event teams.");
}
export function requireAdmin(user: PublicUser) {
  if (user.role !== "admin") fail("Only Admin can manage events.");
}
async function transaction<T>(operation: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
const displayName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts[0] + (parts.length > 1 ? ` ${parts.at(-1)![0]}.` : "");
};
async function notify(userId: string, title: string, link: string) {
  try {
    await notificationService.create({
      userId,
      type: "system",
      title,
      message: title,
      link,
    });
  } catch {
    logger.warn("event_notification_failed");
  }
}
async function log(
  user: PublicUser,
  action: string,
  id: string,
  type = "event_team",
) {
  await auditService.record({
    actor: user,
    action,
    entityType: type,
    entityId: id,
  });
}
const link = (eventId: string, teamId?: string) =>
  `/opportunities/${eventId}${teamId ? `/teams/${teamId}` : ""}`;
async function selectedSkills(user: PublicUser, input: unknown) {
  const selected = strings(input ?? []);
  const existing = await skillRepository.findUserSkills(user.id);
  if (selected.some((name) => !existing.some((skill) => skill.name === name)))
    fail("Select contribution skills from your SkillMap.", 400);
  return selected;
}
function openEvent(event: Record<string, unknown>) {
  if (
    (Array.isArray(event.tags) && event.tags.includes(archivedTag)) ||
    ["closed", "completed"].includes(String(event.status)) ||
    new Date(String(event.end_date ?? event.start_date)).getTime() <
      Date.now() ||
    (event.registration_deadline &&
      new Date(String(event.registration_deadline)).getTime() < Date.now())
  )
    fail("This opportunity is closed for new team activity.", 409);
}

export const eventsService = {
  async list(user: PublicUser, includeArchived = false) {
    const result = await queryDatabase(
      `SELECT e.*, CASE WHEN COALESCE(e.end_date,e.start_date)<NOW() THEN 'completed' WHEN e.registration_deadline<NOW() AND e.status='registration_open' THEN 'closed' ELSE e.status END AS effective_status,
 (SELECT COUNT(*)::int FROM event_interests i WHERE i.event_id=e.id) AS interested_count,
 EXISTS(SELECT 1 FROM event_interests i WHERE i.event_id=e.id AND i.user_id=$1) AS interested,
 (SELECT COUNT(*)::int FROM event_teams t WHERE t.event_id=e.id) AS team_count,
 (SELECT COUNT(*)::int FROM event_teams t WHERE t.event_id=e.id AND t.status='recruiting') AS recruiting_count,
 (SELECT t.id FROM event_teams t JOIN event_team_members m ON m.team_id=t.id WHERE t.event_id=e.id AND m.user_id=$1 AND m.status='accepted' LIMIT 1) AS my_team_id
 FROM campus_events e ORDER BY e.start_date`,
      [user.id],
    );
    return result.rows
      .filter(
        (row) =>
          user.role === "admin" ||
          includeArchived ||
          !(row.tags ?? []).includes(archivedTag),
      )
      .map((row) => presentEvent(row, user.role === "admin"));
  },
  async detail(id: string, user: PublicUser, includeArchived = false) {
    requireUuid(id);
    const events = await this.list(user, includeArchived);
    return events.find((e) => e.id === id) ?? fail("Event unavailable.", 404);
  },
  async save(
    id: string | null,
    body: Record<string, unknown>,
    user: PublicUser,
  ) {
    requireAdmin(user);
    if (id) requireUuid(id);
    const values = eventInput(body);
    const event = await transaction(async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('campuscare:event-metadata'))",
      );
      const previous = id
        ? (
            await client.query(
              "SELECT tags FROM campus_events WHERE id=$1 FOR UPDATE",
              [id],
            )
          ).rows[0]
        : null;
      if (id && !previous) fail("Event unavailable.", 404);
      values.tags = eventTags(values.tags, previous?.tags ?? [], body);
      if (values.tags.includes(featuredTag))
        await client.query(
          "UPDATE campus_events SET tags=array_remove(tags,$1) WHERE $1=ANY(tags) AND id<>COALESCE($2::uuid,gen_random_uuid())",
          [featuredTag, id],
        );
      const keys = Object.keys(values),
        params = Object.values(values);
      const result = id
        ? await client.query(
            `UPDATE campus_events SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(",")},updated_at=NOW() WHERE id=$${params.length + 1} RETURNING *`,
            [...params, id],
          )
        : await client.query(
            `INSERT INTO campus_events (${keys.join(",")},created_by) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")},$${params.length + 1}) RETURNING *`,
            [...params, user.id],
          );
      return result.rows[0] ?? fail("Event unavailable.", 404);
    });
    await log(
      user,
      id ? "event_updated" : "event_created",
      event.id,
      "campus_event",
    );
    if (id) {
      const recipients = await queryDatabase(
        "SELECT user_id FROM event_interests WHERE event_id=$1 UNION SELECT m.user_id FROM event_team_members m JOIN event_teams t ON t.id=m.team_id WHERE t.event_id=$1 AND m.status='accepted'",
        [id],
      );
      for (const recipient of recipients.rows)
        await notify(
          recipient.user_id,
          "An opportunity you follow was updated.",
          link(id),
        );
    }
    return presentEvent(event, true);
  },
  async interest(id: string, active: boolean, user: PublicUser) {
    requireStudent(user);
    await this.detail(id, user);
    if (active)
      await queryDatabase(
        "INSERT INTO event_interests(event_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [id, user.id],
      );
    else
      await queryDatabase(
        "DELETE FROM event_interests WHERE event_id=$1 AND user_id=$2",
        [id, user.id],
      );
    await log(
      user,
      active ? "event_interest_marked" : "event_interest_withdrawn",
      id,
      "campus_event",
    );
  },
  async skills(user: PublicUser) {
    requireStudent(user);
    return (await skillRepository.findUserSkills(user.id)).map((s) => ({
      id: s.skillId,
      name: s.name,
      category: s.category,
    }));
  },
  async teams(eventId: string, user: PublicUser) {
    await this.detail(eventId, user);
    const skills = user.role === "student" ? await this.skills(user) : [];
    const result = await queryDatabase(
      `SELECT t.id,t.event_id,t.name,t.description,t.goal,t.leader_user_id,t.max_members,t.status,t.needed_skills, (SELECT COUNT(*)::int FROM event_team_members m WHERE m.team_id=t.id AND m.status='accepted') AS member_count,
 (SELECT m.status FROM event_team_members m WHERE m.team_id=t.id AND m.user_id=$2) AS my_status,
 ARRAY(SELECT DISTINCT unnest(m.contribution_skills) FROM event_team_members m WHERE m.team_id=t.id AND m.status='accepted') AS available_skills
 FROM event_teams t WHERE t.event_id=$1 ORDER BY t.created_at`,
      [eventId, user.id],
    );
    return result.rows.map((t) => ({
      ...t,
      match: matching(
        t.needed_skills,
        skills.map((s) => s.name),
      ),
    }));
  },
  async createTeam(
    eventId: string,
    body: Record<string, unknown>,
    user: PublicUser,
  ) {
    requireStudent(user);
    requireUuid(eventId);
    const name = text(body.name, 100),
      description = text(body.description, 2000),
      goal = text(body.goal ?? "", 500, false),
      max = capacity(body.max_members),
      needed = strings(body.needed_skills ?? []),
      skills = await selectedSkills(user, body.contribution_skills);
    const discord = discordInvite(body.discord_invite_url);
    const team = await transaction(async (c) => {
      const event =
        (
          await c.query("SELECT * FROM campus_events WHERE id=$1 FOR UPDATE", [
            eventId,
          ])
        ).rows[0] ?? fail("Event unavailable.", 404);
      openEvent(event);
      if (event.participation_type === "individual")
        fail("This event supports individual participation only.", 409);
      if (event.max_team_size && max > event.max_team_size)
        fail("Team exceeds the event maximum size.", 400);
      const row = (
        await c.query(
          `INSERT INTO event_teams(event_id,name,description,goal,leader_user_id,max_members,needed_skills,discord_invite_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,event_id,name,description,goal,leader_user_id,max_members,status,needed_skills`,
          [eventId, name, description, goal, user.id, max, needed, discord],
        )
      ).rows[0];
      await c.query(
        `INSERT INTO event_team_members(team_id,user_id,status,contribution_skills) VALUES($1,$2,'accepted',$3)`,
        [row.id, user.id, skills],
      );
      return row;
    });
    await log(user, "team_created", team.id);
    return team;
  },
  async request(
    teamId: string,
    body: Record<string, unknown>,
    user: PublicUser,
  ) {
    requireStudent(user);
    requireUuid(teamId);
    const skills = await selectedSkills(user, body.contribution_skills);
    const team = await transaction(async (c) => {
      const t =
        (
          await c.query("SELECT * FROM event_teams WHERE id=$1 FOR UPDATE", [
            teamId,
          ])
        ).rows[0] ?? fail("Team unavailable.", 404);
      const e = (
        await c.query("SELECT * FROM campus_events WHERE id=$1", [t.event_id])
      ).rows[0];
      openEvent(e);
      const count = (
        await c.query(
          `SELECT COUNT(*)::int AS n FROM event_team_members WHERE team_id=$1 AND status='accepted'`,
          [teamId],
        )
      ).rows[0].n;
      if (t.status !== "recruiting" || count >= t.max_members)
        fail("This team is full or no longer recruiting.", 409);
      if (
        (
          await c.query(
            "SELECT 1 FROM event_team_members WHERE team_id=$1 AND user_id=$2",
            [teamId, user.id],
          )
        ).rowCount
      )
        fail("A request has already been sent to this team.", 409);
      await c.query(
        `INSERT INTO event_team_members(team_id,user_id,status,contribution_skills) VALUES($1,$2,'pending',$3)`,
        [teamId, user.id, skills],
      );
      return t;
    });
    await log(user, "team_join_requested", teamId);
    await notify(
      team.leader_user_id,
      "A student requested to join your team.",
      link(team.event_id, teamId),
    );
  },
  async decide(
    teamId: string,
    applicantId: string,
    accept: boolean,
    user: PublicUser,
  ) {
    requireStudent(user);
    requireUuid(teamId);
    requireUuid(applicantId);
    const team = await transaction(async (c) => {
      const t =
        (
          await c.query("SELECT * FROM event_teams WHERE id=$1 FOR UPDATE", [
            teamId,
          ])
        ).rows[0] ?? fail("Team unavailable.", 404);
      if (t.leader_user_id !== user.id)
        fail("Only the team leader can manage membership.");
      if (accept) {
        const count = (
          await c.query(
            `SELECT COUNT(*)::int AS n FROM event_team_members WHERE team_id=$1 AND status='accepted'`,
            [teamId],
          )
        ).rows[0].n;
        if (t.status === "closed" || count >= t.max_members)
          fail("This team is full or closed.", 409);
        if (count + 1 >= t.max_members)
          await c.query(
            `UPDATE event_teams SET status='full',updated_at=NOW() WHERE id=$1`,
            [teamId],
          );
      }
      const result = await c.query(
        `UPDATE event_team_members SET status=$3,joined_at=NOW() WHERE team_id=$1 AND user_id=$2 AND status='pending' RETURNING user_id`,
        [teamId, applicantId, accept ? "accepted" : "declined"],
      );
      if (!result.rowCount) fail("Pending request unavailable.", 409);
      return t;
    });
    await log(
      user,
      accept ? "team_member_accepted" : "team_member_declined",
      teamId,
    );
    await notify(
      applicantId,
      `Your request to join ${team.name} was ${accept ? "accepted" : "declined"}.`,
      link(team.event_id, teamId),
    );
  },
  async authorize(teamId: string, user: PublicUser) {
    if (user.role !== "student")
      fail("Only accepted team members can access this workspace.");
    requireUuid(teamId);
    const result = await queryDatabase(
      `SELECT t.id,t.event_id,t.name,t.description,t.goal,t.note,t.leader_user_id,t.max_members,t.status,t.needed_skills FROM event_teams t JOIN event_team_members m ON m.team_id=t.id WHERE t.id=$1 AND m.user_id=$2 AND m.status='accepted'`,
      [teamId, user.id],
    );
    return (
      result.rows[0] ??
      fail("Only accepted team members can access this workspace.")
    );
  },
  async workspace(teamId: string, user: PublicUser) {
    const team = await this.authorize(teamId, user);
    const privateLink = await queryDatabase(
      "SELECT discord_invite_url FROM event_teams WHERE id=$1",
      [teamId],
    );
    const members = await queryDatabase(
      `SELECT m.user_id,m.status,m.contribution_skills,u.full_name FROM event_team_members m JOIN users u ON u.id=m.user_id WHERE m.team_id=$1 AND (m.status='accepted' OR $2=tRUE) ORDER BY m.joined_at`,
      [teamId, team.leader_user_id === user.id],
    );
    return {
      ...team,
      discord_invite_url: privateLink.rows[0]?.discord_invite_url ?? null,
      members: members.rows.map(({ full_name, ...m }) => ({
        ...m,
        display_name: displayName(full_name),
      })),
      event: await this.detail(team.event_id, user, true),
    };
  },
  async updateDiscord(
    teamId: string,
    body: Record<string, unknown>,
    user: PublicUser,
  ) {
    const team = await this.authorize(teamId, user);
    if (team.leader_user_id !== user.id)
      fail("Only the team leader can edit the Discord workspace.");
    const invite = discordInvite(body.discord_invite_url);
    await queryDatabase(
      "UPDATE event_teams SET discord_invite_url=$2,updated_at=NOW() WHERE id=$1",
      [teamId, invite],
    );
    // Never include the invite URL in audit metadata or notification payloads.
    await log(user, "team_discord_updated", teamId);
  },
  async note(teamId: string, body: Record<string, unknown>, user: PublicUser) {
    const team = await this.authorize(teamId, user);
    if (team.leader_user_id !== user.id)
      fail("Only the team leader can edit the team objective.");
    await queryDatabase(
      "UPDATE event_teams SET note=$2,updated_at=NOW() WHERE id=$1",
      [teamId, text(body.note, 2000, false)],
    );
  },
  async leave(teamId: string, user: PublicUser) {
    const team = await this.authorize(teamId, user);
    if (team.leader_user_id === user.id)
      fail("The team leader must remain with the team in this version.", 409);
    await transaction(async (c) => {
      await c.query("SELECT id FROM event_teams WHERE id=$1 FOR UPDATE", [
        teamId,
      ]);
      await c.query(
        `UPDATE event_team_members SET status='declined' WHERE team_id=$1 AND user_id=$2`,
        [teamId, user.id],
      );
      await c.query(
        `UPDATE event_teams SET status=CASE WHEN status='full' THEN 'recruiting' ELSE status END,updated_at=NOW() WHERE id=$1`,
        [teamId],
      );
    });
    await log(user, "team_member_removed", teamId);
    await notify(
      team.leader_user_id,
      "A member left your event team.",
      link(team.event_id, teamId),
    );
  },
  async messages(teamId: string, user: PublicUser) {
    await this.authorize(teamId, user);
    const result = await queryDatabase<{
      id: string;
      team_id: string;
      sender_user_id: string;
      message: string;
      created_at: Date;
      full_name: string;
    }>(
      `SELECT m.id,m.team_id,m.sender_user_id,m.message,m.created_at,u.full_name FROM event_team_messages m JOIN users u ON u.id=m.sender_user_id WHERE team_id=$1 ORDER BY created_at DESC,id DESC LIMIT 100`,
      [teamId],
    );
    return result.rows.reverse().map(({ full_name, ...m }) => ({
      ...m,
      display_name: displayName(full_name),
    }));
  },
  async send(teamId: string, body: Record<string, unknown>, user: PublicUser) {
    const team = await this.authorize(teamId, user);
    const message = text(body.message, 2000);
    const result = await queryDatabase(
      "INSERT INTO event_team_messages(team_id,sender_user_id,message) VALUES($1,$2,$3) RETURNING id,team_id,sender_user_id,message,created_at",
      [teamId, user.id, message],
    );
    const saved = {
      ...result.rows[0],
      display_name: displayName(user.fullName),
    };
    const recipients = await queryDatabase(
      `SELECT m.user_id, NOT EXISTS(SELECT 1 FROM event_team_messages msg WHERE msg.team_id=m.team_id AND msg.sender_user_id<>m.user_id AND msg.created_at>m.last_read_at AND msg.id<>$2) AS notify FROM event_team_members m WHERE m.team_id=$1 AND m.status='accepted'`,
      [teamId, result.rows[0].id],
    );
    for (const member of recipients.rows) {
      emitToUser(member.user_id, "event-team:message", saved);
      if (member.user_id !== user.id && member.notify)
        await notify(
          member.user_id,
          "New message in your event team.",
          link(team.event_id, teamId),
        );
    }
    return saved;
  },
  async read(teamId: string, user: PublicUser) {
    await this.authorize(teamId, user);
    await queryDatabase(
      "UPDATE event_team_members SET last_read_at=NOW() WHERE team_id=$1 AND user_id=$2",
      [teamId, user.id],
    );
  },
  async unread(user: PublicUser) {
    const result = await queryDatabase(
      `SELECT m.team_id,COUNT(msg.id)::int AS unread FROM event_team_members m JOIN event_team_messages msg ON msg.team_id=m.team_id AND msg.created_at>m.last_read_at AND msg.sender_user_id<>m.user_id WHERE m.user_id=$1 AND m.status='accepted' GROUP BY m.team_id`,
      [user.id],
    );
    return result.rows;
  },
};
