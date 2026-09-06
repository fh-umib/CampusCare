# Realtime Notifications and Support Chat

CampusCare attaches Socket.IO to the same Node HTTP server and port used by Express. PostgreSQL remains the source of truth: REST loads history and performs reliable writes, while sockets deliver persisted notifications, messages, typing state, and status changes immediately.

## Authentication and rooms

The client connects only after login and sends the JWT through the Socket.IO `auth.token` handshake field. Tokens never appear in URLs. The server verifies the JWT and reloads the current user; frontend-supplied roles and user IDs are ignored. Invalid or expired credentials are rejected with `REALTIME_AUTH_REQUIRED` or `REALTIME_AUTH_INVALID`.

Authenticated sockets join `user:<userId>`. Mentors and admins also join their protected role room. Chat rooms use `support:<conversationId>` and are joined only after the support service confirms ownership or queue/assignment access. Email addresses are never room identifiers.

## Support authorization and privacy

Each `support_conversations` row is tied one-to-one to an existing Silent Help request. Students can access only conversations belonging to their own request. An unassigned open conversation is available to the mentor queue; the first mentor joining claims it, after which unrelated mentors cannot access it. Admin accounts receive operational aggregates only and cannot retrieve messages or participate.

Anonymous requests retain an internal owner ID solely for authorization. Mentor-facing REST and socket message payloads use `Anonymous Student`; they omit the student's name, email, and user ID. Messages render as plain React text, not HTML.

## Events

Server to client:

- `notification:new`, `notification:read`, `notification:read-all`
- `support:message:new`
- `support:typing`, `support:typing:stop`
- `support:status-changed`

Client to server:

- `support:join`, `support:leave`
- `support:message` (available with acknowledgement; the UI uses REST writes)
- `support:typing`, `support:read`

Messages are validated to 1–2000 characters, rate-limited, persisted before broadcast, and optionally deduplicated with a client message UUID. Closed conversations reject new messages. Typing state is transient, throttled, and cleared by the UI after three seconds.

## Notifications and reconnects

Notifications are inserted before they are emitted. The bell deduplicates by notification ID and retains the existing REST read/read-all endpoints. After a disconnect or refresh, REST restores canonical data. Socket.IO reconnects automatically with the authenticated session; active chat history is refetched when the component remounts. Logout removes listeners and disconnects the singleton socket.

## Production configuration

- Render runs the normal CampusCare backend service; no second service or port is required. WebSocket upgrades must remain enabled (Render supports them on web services).
- `FRONTEND_URL` may contain comma-separated allowed origins and must include the Vercel frontend origin.
- Vercel sets `VITE_API_URL=https://<backend>/api`.
- `VITE_SOCKET_URL=https://<backend>` is optional because the client derives it from `VITE_API_URL`.
- A single backend instance needs no adapter. Horizontal scaling requires sticky sessions plus a shared Socket.IO adapter such as Redis.

Apply `008_realtime_support_chat.sql` through the normal migration runner before enabling chat. The migration is additive, backfills conversations for existing requests, and does not delete data.

## Local two-session test

1. Run the migration, backend, and frontend.
2. Open a normal window as Student and a private window as Mentor.
3. Create an anonymous Silent Help request as Student.
4. Confirm the Mentor queue receives the notification without refreshing and shows `Anonymous Student`.
5. Open the request as Mentor; this claims the conversation.
6. Send a Student message and confirm it appears live for Mentor.
7. Type as Mentor and confirm Student sees `Mentor is typing…`.
8. Reply as Mentor and confirm the Student notification badge updates.
9. Refresh Student, then logout/login, and confirm history persists.
10. Attempt another student's or an assigned mentor's conversation ID and confirm access is denied.
11. Resolve the conversation and confirm sending is disabled.
12. Check 320px, 375px, and 430px widths for composer visibility and horizontal overflow.
13. Open Admin analytics and confirm support counts are present without names or message text.

## Known limitations

- Presence is intentionally limited to active socket connections and is not persisted or presented as historical truth.
- Per-conversation read timestamps provide unread counts; per-message read receipts are not included.
- Multi-instance Socket.IO deployment requires a shared adapter and sticky routing.
