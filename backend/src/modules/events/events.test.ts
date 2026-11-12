import assert from "node:assert/strict";
import test from "node:test";
import { pool } from "../../config/database.js";
import {
  eventsService,
  requireAdmin,
  requireStudent,
} from "./events.service.js";
import { eventInput, matching } from "./events.validation.js";
import { skillRepository } from "../../repositories/skill.repository.js";
import { notificationService } from "../../services/notification.service.js";
import { auditService } from "../security/audit.service.js";
import type { PublicUser } from "../../types/user.js";

const student: PublicUser = {
  id: "10000000-0000-4000-8000-000000000001",
  role: "student",
  fullName: "Flutura Halili",
  email: "private@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};
const admin: PublicUser = {
  ...student,
  id: "10000000-0000-4000-8000-000000000002",
  role: "admin",
};
const applicant: PublicUser = {
  ...student,
  id: "10000000-0000-4000-8000-000000000003",
};
const eventId = "20000000-0000-4000-8000-000000000001",
  teamId = "30000000-0000-4000-8000-000000000001";
const input = {
  title: "Test fixture",
  description: "Test event",
  event_type: "Workshop",
  organizer: "Test organizer",
  location: "Test room",
  start_date: "2099-11-18T10:00:00Z",
  participation_type: "both",
  status: "registration_open",
  tags: ["React"],
};

test("event roles, dates, links and deterministic matching", () => {
  assert.throws(() => requireAdmin(student));
  assert.throws(() => requireStudent(admin));
  assert.doesNotThrow(() => requireAdmin(admin));
  assert.throws(() =>
    eventInput({ ...input, end_date: "2099-11-17T10:00:00Z" }),
  );
  assert.throws(() =>
    eventInput({ ...input, registration_deadline: "2099-11-19T10:00:00Z" }),
  );
  assert.throws(() =>
    eventInput({ ...input, external_link: "javascript:alert(1)" }),
  );
  assert.equal(eventInput(input).title, input.title);
  assert.deepEqual(matching(["React", "SQL"], ["react"]), {
    skills: ["React"],
    label: "Good match",
  });
  assert.equal(matching([], ["React"]).label, "Explore this team");
});

test("event workflows enforce membership, persistence, capacity, privacy and targeted notifications", async () => {
  // Replace database boundaries: these tests never touch the configured database.
  const db = pool as unknown as Record<string, unknown>;
  const oldQuery = db.query,
    oldConnect = db.connect,
    oldSkills = skillRepository.findUserSkills,
    oldNotify = notificationService.create,
    oldAudit = auditService.record;
  const sent: Record<string, unknown>[] = [],
    audits: Record<string, unknown>[] = [],
    queries: string[] = [];
  const event = {
    ...eventInput(input),
    id: eventId,
    max_team_size: 3,
    end_date: null,
  };
  const team = {
    id: teamId,
    event_id: eventId,
    name: "Test team",
    leader_user_id: student.id,
    max_members: 2,
    status: "recruiting",
    needed_skills: ["React"],
  };
  const members = new Map<
    string,
    { status: string; contribution_skills: string[] }
  >([]);
  const messages: Record<string, unknown>[] = [];
  const execute = async (sql: string, params: unknown[] = []) => {
    queries.push(sql);
    let rows: Record<string, unknown>[] = [];
    if (/^(BEGIN|COMMIT|ROLLBACK)/.test(sql)) return { rows, rowCount: 0 };
    if (sql.includes("SELECT e.*"))
      rows = [{ ...event, effective_status: event.status }];
    else if (sql.startsWith("INSERT INTO campus_events")) rows = [event];
    else if (sql.startsWith("SELECT * FROM campus_events")) rows = [event];
    else if (sql.startsWith("INSERT INTO event_teams")) rows = [team];
    else if (sql.startsWith("SELECT * FROM event_teams")) rows = [team];
    else if (sql.includes("COUNT(*)::int AS n"))
      rows = [
        {
          n: [...members.values()].filter((m) => m.status === "accepted")
            .length,
        },
      ];
    else if (sql.startsWith("INSERT INTO event_team_members")) {
      members.set(String(params[1]), {
        status: sql.includes("'accepted'") ? "accepted" : "pending",
        contribution_skills: params[2] as string[],
      });
      rows = [{ user_id: params[1] }];
    } else if (sql.startsWith("SELECT 1 FROM event_team_members"))
      rows = members.has(String(params[1])) ? [{ exists: 1 }] : [];
    else if (sql.startsWith("UPDATE event_team_members SET status=$3")) {
      const member = members.get(String(params[1]));
      if (member?.status === "pending") {
        member.status = String(params[2]);
        rows = [{ user_id: params[1] }];
      }
    } else if (sql.includes("SET status='full'")) {
      team.status = "full";
    } else if (sql.startsWith("SELECT t.id,t.event_id,t.name,t.description,t.goal,t.note"))
      rows =
        members.get(String(params[1]))?.status === "accepted" ? [team] : [];
    else if (sql.startsWith("INSERT INTO event_team_messages")) {
      const message = {
        id: "40000000-0000-4000-8000-000000000001",
        team_id: params[0],
        sender_user_id: params[1],
        message: params[2],
        created_at: new Date(),
      };
      messages.push(message);
      rows = [message];
    } else if (sql.startsWith("SELECT m.id,m.team_id"))
      rows = messages
        .map((m) => ({ ...m, full_name: student.fullName }))
        .reverse();
    else if (sql.startsWith("SELECT m.user_id, NOT EXISTS"))
      rows = [...members]
        .filter(([, m]) => m.status === "accepted")
        .map(([id]) => ({ user_id: id, notify: true }));
    else if (sql.startsWith("SELECT m.user_id,m.status"))
      rows = [...members].map(([id, m]) => ({
        user_id: id,
        ...m,
        full_name: "Flutura Halili",
      }));
    return { rows, rowCount: rows.length };
  };
  try {
    db.query = execute;
    db.connect = async () => ({ query: execute, release: () => {} });
    skillRepository.findUserSkills = async () =>
      [
        {
          id: "skill-row",
          skillId: "skill",
          userId: student.id,
          name: "React",
          category: "Tech",
          level: "intermediate",
          availability: "available",
          createdAt: new Date(),
        },
      ] as Awaited<ReturnType<typeof oldSkills>>;
    notificationService.create = async (value) => {
      sent.push(value);
      return {} as Awaited<ReturnType<typeof oldNotify>>;
    };
    auditService.record = async (value) => {
      audits.push(value);
      return true;
    };
    assert.equal((await eventsService.list(student))[0].title, input.title);
    await assert.rejects(
      eventsService.save(null, input, student),
      /Only Admin/,
    );
    assert.equal((await eventsService.save(null, input, admin)).id, eventId);
    const safe = await eventsService.skills(student);
    assert.deepEqual(safe, [{ id: "skill", name: "React", category: "Tech" }]);
    await assert.rejects(
      eventsService.createTeam(
        eventId,
        {
          name: "Team",
          description: "Test",
          max_members: 2,
          contribution_skills: ["Forged skill"],
        },
        student,
      ),
      /SkillMap/,
    );
    await eventsService.createTeam(
      eventId,
      {
        name: "Team",
        description: "Test",
        max_members: 2,
        contribution_skills: ["React"],
      },
      student,
    );
    assert.equal(members.get(student.id)?.status, "accepted");
    assert.equal(team.leader_user_id, student.id);
    await assert.rejects(
      eventsService.messages(teamId, applicant),
      /Only accepted/,
    );
    await assert.rejects(
      eventsService.messages(teamId, admin),
      /Only accepted/,
    );
    await assert.rejects(
      eventsService.authorize(teamId, { ...admin, role: "mentor" }),
      /Only accepted/,
    );
    await eventsService.request(
      teamId,
      { contribution_skills: ["React"] },
      applicant,
    );
    assert.equal(members.get(applicant.id)?.status, "pending");
    assert.equal(sent.at(-1)?.userId, student.id);
    await assert.rejects(
      eventsService.request(teamId, {}, applicant),
      /already been sent/,
    );
    await assert.rejects(
      eventsService.decide(teamId, applicant.id, true, applicant),
      /Only the team leader/,
    );
    await eventsService.decide(teamId, applicant.id, true, student);
    assert.equal(members.get(applicant.id)?.status, "accepted");
    assert.equal(team.status, "full");
    assert.equal(sent.at(-1)?.userId, applicant.id);
    await assert.rejects(
      eventsService.request(teamId, {}, { ...student, id: admin.id }),
      /full/,
    );
    await assert.rejects(
      eventsService.send(teamId, { message: "private" }, admin),
      /Only accepted/,
    );
    await assert.rejects(eventsService.send(teamId, { message: " " }, student));
    const message = await eventsService.send(
      teamId,
      { message: "Can I handle the frontend?" },
      student,
    );
    assert.equal(message.display_name, "Flutura H.");
    const history = await eventsService.messages(teamId, student);
    assert.equal(history[0].message, "Can I handle the frontend?");
    const workspace = await eventsService.workspace(teamId, student);
    assert.equal(workspace.members[0].display_name, "Flutura H.");
    assert.ok(
      !JSON.stringify({ safe, history, workspace }).includes(student.email),
    );
    assert.ok(
      queries.every(
        (sql) =>
          !/(mood_records|stress_records|help_requests|password_hash|u.email)/i.test(
            sql,
          ),
      ),
    );
    assert.ok(!JSON.stringify(audits).includes("Can I handle the frontend?"));
    assert.ok(sent.every((n) => n.userId && !n.role));
    assert.ok(queries.some((sql) => sql.includes("FOR UPDATE")));
  } finally {
    db.query = oldQuery;
    db.connect = oldConnect;
    skillRepository.findUserSkills = oldSkills;
    notificationService.create = oldNotify;
    auditService.record = oldAudit;
  }
});
