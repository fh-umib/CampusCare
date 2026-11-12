import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import jwt from "jsonwebtoken";
import { adminUsersRoutes } from "./adminUsers.routes.js";
import { adminUsersRepository } from "./adminUsers.repository.js";
import { adminUsersService, usersFilter } from "./adminUsers.service.js";
import { authService } from "../../services/auth.service.js";
import { tokenUtils } from "../../utils/token.js";
import { errorHandler } from "../../middleware/errorHandler.js";
import { pool } from "../../config/database.js";
import type { PublicUser } from "../../types/user.js";

const users: PublicUser[] = (["admin", "student", "mentor"] as const).map(
  (role, i) => ({
    id: `10000000-0000-4000-8000-00000000000${i + 1}`,
    fullName: `Test ${role}`,
    email: `${role}@example.invalid`,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
);
const records = Array.from({ length: 25 }, (_, i) => ({
  id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  full_name: `Registered ${String(i + 1).padStart(2, "0")}`,
  email: `user${i + 1}@example.invalid`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "student" : "mentor",
  created_at: new Date(2026, 0, i + 1),
  profile_completed: i % 2 === 0,
  last_login_at: null,
  department: "Computer Science",
  study_year: "2",
  password_hash: "SECRET_HASH",
  password: "SECRET_PASSWORD",
  two_factor_secret: "SECRET_2FA",
  recovery_codes: ["SECRET_RECOVERY"],
  jwt: "SECRET_TOKEN",
  reason_for_joining: "PRIVATE_REASON",
  mood: "PRIVATE_MOOD",
  support_message: "PRIVATE_SUPPORT",
}));

test("Admin users API authorization, privacy, filtering, details and pagination", async (t) => {
  const oldAuth = authService.getCurrentUser,
    oldList = adminUsersRepository.list,
    oldDetail = adminUsersRepository.detail,
    oldVerify = tokenUtils.verify;
  const fixtureSecret = "admin-users-tests-only-secret-never-used-by-the-app";
  tokenUtils.verify = (token) =>
    jwt.verify(token, fixtureSecret) as ReturnType<typeof oldVerify>;
  let reads = 0;
  authService.getCurrentUser = async (id) => users.find((u) => u.id === id)!;
  adminUsersRepository.list = async (filter) => {
    reads++;
    const matching = records.filter(
      (row) =>
        (!filter.role || row.role === filter.role) &&
        `${row.full_name} ${row.email}`
          .toLowerCase()
          .includes(filter.search.toLowerCase()),
    );
    if (filter.sort === "newest") matching.reverse();
    return {
      items: matching.slice(
        (filter.page - 1) * filter.limit,
        filter.page * filter.limit,
      ),
      counts: {
        total_users: records.length,
        students: 8,
        mentors: 8,
        admins: 9,
        filtered_total: matching.length,
      },
    };
  };
  adminUsersRepository.detail = async (id) =>
    records.find((row) => row.id === id) ?? null;
  const app = express();
  app.use("/api/admin/users", adminUsersRoutes);
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}/api/admin/users`;
    const get = (suffix = "", user = users[0]) =>
      fetch(base + suffix, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ userId: user.id, role: user.role }, fixtureSecret, { expiresIn: "1m" })}`,
        },
      });
    await t.test("unauthenticated access receives 401", async () =>
      assert.equal((await fetch(base)).status, 401),
    );
    for (const user of users.slice(1))
      await t.test(
        `${user.role} receives 403 for list and detail before any account reads`,
        async () => {
          const before = reads;
          assert.equal((await get("", user)).status, 403);
          assert.equal((await get(`/${records[0].id}`, user)).status, 403);
          assert.equal(reads, before);
        },
      );
    await t.test(
      "Admin fetches 20 safe accounts and real global summary",
      async () => {
        const response = await get();
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "no-store");
        const body = await response.json();
        assert.equal(body.data.items.length, 20);
        assert.equal(body.data.total, 25);
        assert.deepEqual(body.data.summary, {
          total_users: 25,
          students: 8,
          mentors: 8,
          admins: 9,
        });
        assert.deepEqual(
          Object.keys(body.data.items[0]).sort(),
          [
            "id",
            "full_name",
            "email",
            "role",
            "created_at",
            "profile_completed",
            "last_login_at",
          ].sort(),
        );
        assert.ok(!JSON.stringify(body).includes("SECRET_"));
        assert.ok(!JSON.stringify(body).includes("PRIVATE_"));
      },
    );
    await t.test("role filter works", async () => {
      const body = await (await get("?role=student")).json();
      assert.equal(body.data.total, 8);
      assert.ok(
        body.data.items.every(
          (row: { role: string }) => row.role === "student",
        ),
      );
    });
    await t.test("name search works", async () => {
      const body = await (await get("?search=Registered%2002")).json();
      assert.equal(body.data.total, 1);
      assert.equal(body.data.items[0].full_name, "Registered 02");
    });
    await t.test("email search works", async () => {
      const body = await (await get("?search=user25%40example.invalid")).json();
      assert.equal(body.data.total, 1);
      assert.equal(body.data.items[0].email, "user25@example.invalid");
    });
    await t.test("pagination has stable distinct pages", async () => {
      const first = (await (await get()).json()).data,
        second = (await (await get("?page=2")).json()).data;
      assert.equal(second.items.length, 5);
      assert.ok(
        second.items.every(
          (row: { id: string }) =>
            !first.items.some((r: { id: string }) => r.id === row.id),
        ),
      );
      assert.equal(second.total, 25);
    });
    await t.test(
      "safe detail excludes credentials, wellbeing and support content",
      async () => {
        const response = await get(`/${records[0].id}`);
        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(body.data.department, "Computer Science");
        assert.ok(!JSON.stringify(body).includes("SECRET_"));
        assert.ok(!JSON.stringify(body).includes("PRIVATE_"));
        assert.equal(body.data.admin_position, null);
      },
    );
    await t.test("unknown user and invalid queries fail safely", async () => {
      assert.equal(
        (await get("/20000000-0000-4000-8000-999999999999")).status,
        404,
      );
      for (const suffix of [
        "?page=0",
        "?limit=101",
        "?role=owner",
        "?sort=arbitrary",
        "?search[x]=bad",
      ])
        assert.equal((await get(suffix)).status, 400);
    });
    await t.test("service also enforces Admin access", async () => {
      await assert.rejects(
        adminUsersService.list({}, users[1]),
        (error) =>
          !!error &&
          typeof error === "object" &&
          "statusCode" in error &&
          error.statusCode === 403,
      );
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    authService.getCurrentUser = oldAuth;
    adminUsersRepository.list = oldList;
    adminUsersRepository.detail = oldDetail;
    tokenUtils.verify = oldVerify;
  }
});

test("repository SQL selects only allowlisted fields and binds search/filter/pagination parameters", async () => {
  const db = pool as unknown as Record<string, unknown>;
  const original = db.query;
  const queries: { sql: string; params: unknown[] }[] = [];
  try {
    db.query = async (sql: string, params: unknown[]) => {
      queries.push({ sql, params });
      return {
        rows: sql.includes("filtered_total")
          ? [
              {
                total_users: 0,
                students: 0,
                mentors: 0,
                admins: 0,
                filtered_total: 0,
              },
            ]
          : [],
        rowCount: 0,
      };
    };
    await adminUsersRepository.list(
      usersFilter({
        search: "50%_\\",
        role: "mentor",
        page: "3",
        limit: "20",
        sort: "oldest",
      }),
    );
    assert.deepEqual(queries[1].params, ["mentor", "%50\\%\\_\\\\%", 20, 40]);
    assert.match(queries[1].sql, /ORDER BY u.created_at ASC,u.id ASC/);
    assert.ok(
      queries.every(
        (q) =>
          !/(SELECT\s+\*|password|secret|recovery|mood|stress|help_requests|metadata|reason_for_joining|support_interest)/i.test(
            q.sql,
          ),
      ),
    );
    assert.match(queries[1].sql, /a.action='login_success'/);
    await adminUsersRepository.detail(records[0].id);
    assert.deepEqual(queries[2].params, [records[0].id]);
    assert.throws(() => usersFilter({ limit: "1000" }));
    assert.throws(() => usersFilter({ role: ["student"] }));
  } finally {
    db.query = original;
  }
});
