import test from "node:test";
import assert from "node:assert/strict";
import { createEventRealtimeHandlers } from "../../realtime/realtime.server.js";
import { eventsService } from "./events.service.js";
import { AppError } from "../../utils/httpError.js";
import type { PublicUser } from "../../types/user.js";

test("event socket rooms require accepted membership and every send uses authorized persistence", async () => {
  const user: PublicUser = {
    id: "10000000-0000-4000-8000-000000000001",
    role: "student",
    fullName: "Test Student",
    email: "private@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const id = "30000000-0000-4000-8000-000000000001";
  const joined: string[] = [],
    left: string[] = [];
  const handlers = createEventRealtimeHandlers(
    {
      join: async (room) => {
        joined.push(room);
      },
      leave: async (room) => {
        left.push(room);
      },
      to: () => ({ emit: () => {} }),
    },
    user,
  );
  const original = eventsService.authorize,
    send = eventsService.send;
  let allowed = false,
    sends = 0;
  try {
    eventsService.authorize = async () => {
      if (!allowed) throw new AppError(403, "Only accepted members");
      return { id };
    };
    let result: { ok: boolean } | undefined;
    await handlers.join({ teamId: id }, (r: { ok: boolean }) => {
      result = r;
    });
    assert.equal(result?.ok, false);
    assert.deepEqual(joined, []);
    await handlers.join({ teamId: "guessed" });
    assert.deepEqual(joined, []);
    allowed = true;
    await handlers.join({ teamId: id });
    assert.deepEqual(joined, [`event-team:${id}`]);
    eventsService.send = async (team, body, current) => {
      assert.equal(team, id);
      assert.equal(current.id, user.id);
      await eventsService.authorize(team, current);
      sends++;
      return { display_name: "Test S.", message: body.message };
    };
    await handlers.send({ teamId: id, message: "Persisted" });
    assert.equal(sends, 1);
    allowed = false;
    await handlers.send(
      { teamId: id, message: "Rejected" },
      (r: { ok: boolean }) => {
        result = r;
      },
    );
    assert.equal(result?.ok, false);
    assert.equal(sends, 1);
    await handlers.leave({ teamId: id });
    assert.deepEqual(left, [`event-team:${id}`]);
  } finally {
    eventsService.authorize = original;
    eventsService.send = send;
  }
});
