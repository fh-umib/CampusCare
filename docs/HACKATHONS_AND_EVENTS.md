# Hackathons & Events

## Purpose and architecture

The Campus module at `/opportunities` helps students discover published opportunities and collaborate in event teams. External registration remains the organizer's responsibility. The module uses the existing JWT middleware, role system, SkillMap repository, notification service, audit service, Socket.IO connection, and CampusCare layout. It does not scrape, seed invented events, or access wellbeing records.

Frontend routes:
- `/opportunities`: discovery, filters, Admin metrics and event creation.
- `/opportunities/:id`: overview, interest, team creation and skill matching.
- `/opportunities/:id/teams/:teamId`: private workspace, requests and chat.

Backend files live in `backend/src/modules/events`; frontend page and API types live in `frontend/src/pages/OpportunitiesPage.tsx` and `frontend/src/services/eventsService.ts`. Sidebar and mobile module navigation link to the same canonical route. A small dashboard card shows up to three upcoming events.

## Database and migration

`backend/src/database/010_hackathons_events.sql` is registered in the existing migration runner. It creates only new tables and indexes; it has no event seed data or destructive statements:

| Table | Purpose |
| --- | --- |
| campus_events | Event information, status, dates, participation, tags and requirements |
| event_interests | Private student interest, unique per event/student |
| event_teams | Leader, capacity, recruiting state, needed skills, objective |
| event_team_members | Pending/accepted/declined requests and selected contribution skills, last-read time |
| event_team_messages | Persisted text messages, sender and timestamp |

UUID foreign keys reference existing users. Dates use TIMESTAMPTZ. Database checks validate date order, capacity, membership states and message lengths. Past events receive an effective completed status when read, without rewriting their original records. Expired registration deadlines close effective registration status and block new team creation/requests.

No migration was run automatically. After review, use a disposable development database first, with its connection configured by the operator, then run `npm run migrate --workspace backend`. Review unapplied earlier migrations too: the existing runner runs every unapplied migration. Do not point a test run at production.

A read-only inspection of the connected database found no existing event/activity tables with date fields. Repository search found no 18 November 2026 event. No details were invented; Admin can publish the actual opportunity manually.

## API

All paths below are prefixed with `/api/opportunities` and require authentication.

| Method / path | Behavior |
| --- | --- |
| GET / | Public-to-authenticated-users event list with counts and personal state |
| GET /:id | Event details |
| POST /, PUT /:id | Admin create/full edit, including closed/completed status |
| PUT /:id/interest | Student toggle with `{active: boolean}` |
| GET /my-skills | Current student's safe SkillMap projection |
| GET /:id/teams | Team cards and calculated skill overlap |
| POST /:id/teams | Student creates team and becomes accepted leader atomically |
| POST /teams/:teamId/requests | Request membership with selected contribution skills |
| PATCH /teams/:teamId/requests/:userId | Leader accepts/declines using `{accept: boolean}` |
| GET /teams/:teamId | Accepted-member-only workspace |
| PATCH /teams/:teamId/note | Leader edits pinned objective |
| POST /teams/:teamId/leave | Accepted non-leader leaves; full teams reopen |
| GET, POST /teams/:teamId/messages | Accepted-member history and send |
| POST /teams/:teamId/read | Update private last-read timestamp |
| GET /unread | Current user's team unread counts |

## Team workflow and SkillMap

Students choose contribution skills from existing SkillMap data rather than re-entering them. The server verifies every selected skill belongs to the student. Needed skills are short team-defined labels. Matching compares those labels to SkillMap names case-insensitively: overlap >=75% is strong, >=50% good, any overlap some matching skills. No AI or fabricated scores are involved.

Creation adds the leader and team in one transaction. Requests remain pending until the leader accepts; no private workspace access is granted to pending applicants. Team row locks serialize requests and decisions to enforce capacity. Duplicate requests, full teams and unrelated membership management are rejected. Team card skill searches inspect needed and accepted members' selected contribution skills. Multiple teams per event are allowed in this version; there was no existing business rule forbidding them.

## Chat, realtime and notifications

`event-team:join` authorizes accepted membership before joining `event-team:<teamId>`. `event-team:leave` leaves the room. `event-team:send` rechecks membership and delegates to the same persistence method as REST. Messages are emitted as `event-team:message` to accepted members' authenticated user rooms, so a stale team-room subscription cannot disclose later messages after membership ends. Frontend subscribes through the existing realtime service and rejoins after reconnect.

REST provides persisted history (latest 100 messages), sends, and read receipts. Realtime broadcasts update open conversations. Unread counts are private per member. Message notifications are targeted and coalesced until the member reads the team. Requests notify only the leader; decisions notify only the applicant; event edits notify interested students and accepted team members once per update. Chat content never appears in notification payloads or audit logs. Notification delivery failures do not undo successful collaboration actions.

## Roles and privacy

- Student: public events, private interests, create/request teams, accepted-team collaboration.
- Mentor: event discovery and team cards; no team participation or private workspace/chat access.
- Admin: event creation/edit/status and aggregate counts; no automatic chat/workspace access.
- Membership, not role privilege or knowledge of a team UUID, controls private workspace/chat.

Only first name plus last initial and voluntarily contributed skills appear in member cards. Interest identities are never returned publicly. Public team queries exclude the pinned team note. The module never queries wellbeing tables, emails, authentication fields, anonymous support identities or private activity. Audit records contain action/entity identifiers, never private message content.

## Automated checks

```sh
npm run lint --workspace backend
npm run build --workspace backend
npm test --workspace backend
npm run lint --workspace frontend
npm run build --workspace frontend
```

The module backend tests stub database boundaries and notification/audit services. They exercise roles, validation, event creation, creator membership, requests, leader decisions, full-team rejection, safe skills/profile output, member-only chat, message history, and notification targets. They do not claim real PostgreSQL migration or concurrent-connection integration coverage.

Frontend has no pre-existing unit test runner. A fixture-only browser smoke script is provided:

```sh
# Start local Vite in a separate terminal:
npm run dev --workspace frontend -- --host 127.0.0.1 --port 5187
# Use an available Playwright installation (or set PLAYWRIGHT_MODULE to its module file URL):
node --import tsx frontend/scripts/events-ui-smoke.mjs
```

Set `CHROME_PATH` for a different browser executable or `EVENTS_TEST_URL` for a different local port. The script intercepts API calls, uses a fake local account, checks discovery/filter/detail/team/chat flows, and asserts no horizontal page overflow at 320/375/430px. Screenshots go to the OS temporary directory under `campuscare-events-ui`. It never creates data in the backend.

### Recorded validation

- Backend lint/build: passed. Backend suite: 37 tests passed, zero failures.
- Frontend lint/build: passed. Build required normal filesystem access for Vite config bundling outside the restricted sandbox.
- Browser fixtures: discovery, filters, interest, team create/request/accept, workspace and chat passed at 320, 375, 430 and 1280px with no horizontal page overflow or uncaught browser errors. Desktop Admin create/edit/status controls passed. Mobile discovery and chat screenshots were visually reviewed.
- Build warnings: outdated Browserslist data and a roughly 796 kB JavaScript bundle. Existing backend tests also print expected provider-failure cases, PostgreSQL SSL-mode notices and audit foreign-key warnings from fake test actors; none failed the suite.
- No migration, production data changes, `.env` changes, commit, push or deployment was performed by this module implementation.

## Manual acceptance procedure

1. Apply the reviewed migration to a development database; start backend and frontend using the existing setup.
2. Sign in as Admin. Open Campus → Hackathons & Events. Create a real event with organizer-confirmed details, deadline before start, team/both format and capacity two. Verify invalid dates and non-HTTP links are rejected. Edit the event; close and mark completed using Status.
3. As student A, add React to SkillMap, open the event, mark/withdraw interest and copy its link. Check type, status, title/organizer/tag search and upcoming/past filters.
4. Create a two-member team and select React as a contribution. Verify A is leader, the team is visible, and the workspace shows selected skills and deadline.
5. As student B, add SQL to SkillMap, select it in the team area, and request membership. Verify one notification to A, duplicate requests disabled/rejected, and B cannot fetch workspace/chat before acceptance.
6. As A, accept B. Verify B receives a notification and workspace access. With student C, try requesting the now-full team; verify rejection. Attempt the accept endpoint as C; verify 403.
7. Keep A and B open in separate browsers. Send a message as A, observe realtime delivery to B, reload and verify persisted history. Close B's team page and verify unread counts and one coalesced notification. Return to read and clear the unread state.
8. As Mentor and Admin, open event details and attempt direct team/chat API URLs; verify denial. Check responses contain no emails, wellbeing data or support identities. Verify private message text is absent from audit logs.
9. As A, edit the pinned objective. As B, click Leave team and verify workspace access ends and the team reopens; the leader remains in this version.
10. Repeat key flows at 320/375/430px and desktop, including filters, cards, forms, chat and mobile navigation. Stop the backend and verify safe errors/Retry. Check empty discovery, no recruiting teams, no SkillMap skills and empty chat.

## Known limitations

- Migration and real multi-client database/realtime integration require the manual development-database pass above.
- Chat history shows the most recent 100 messages; no pagination, attachments, typing indicators or scheduled deadline-reminder job.
- No invitations, mentor workflows, leader transfer, leader-driven member removal, checklist or event deletion. Accepted non-leaders can leave from the workspace.
- Declined requests cannot be re-requested in this version. Multiple teams per event are allowed.
- Event-list queries are intended for campus-scale data; no server pagination yet.
- Event edit notifications fire once per explicit save. No external registration, scraping or automated event importing.

## Presentation opportunity showcase

The database was populated with **five new records**, preserving the existing 18 November 2026 university event and its ID, description, timestamps, public tags, deadline and stored team limit (33). Only an internal seed identifier was added to its tags. There are now six opportunities:

| Opportunity | Date/time (CET) | Format | Provenance |
| --- | --- | --- | --- |
| Nga ideja te tregu: Ndërmarrësia, inovacioni dhe fuqizimi i të rinjve | 18 Nov 2026, 10:00–13:00 | Both | Existing user-provided university event, preserved |
| European Defense Tech Hackathon - Prishtina | 20 Nov 10:00–22 Nov 2026 16:00 | Team | User-verified real event; official page independently confirms date/time |
| Campus Innovation Challenge | 25 Nov 2026, 09:00–16:00 | Team | CampusCare university presentation demo |
| Student Technology Workshop | 28 Nov 2026, 10:00–14:00 | Individual | CampusCare university presentation demo |
| Digital Solutions Challenge | 5 Dec 09:30–6 Dec 2026 16:00 | Both | CampusCare university presentation demo |
| Career & Technology Networking Day | 11 Dec 2026, 10:00–15:00 | Individual | CampusCare university presentation demo |

The real hackathon uses the organizer, venue and skills supplied by the user. Its [official event page](https://events.eurodefense.tech/prishtina-2026) confirms the title and 20–22 November CET schedule. Its deadline and maximum team size remain null: neither was invented. All demo organizers/locations use CampusCare Demo names; their descriptions explicitly state that they are presentation examples, not announced events. No Discord links or teams are seeded.

Seed source files:
- `backend/src/database/opportunities.catalog.ts`: five new opportunity definitions and the preserved university identifier.
- `backend/src/database/opportunities.seed.ts`: transaction-scoped, serialized, non-destructive seeding function.
- `backend/src/database/seed_opportunities.ts`: command wrapper.
- `backend/src/database/opportunities.test.ts`: idempotency, preservation and metadata tests.
- `backend/src/modules/events/events.metadata.ts`: private source metadata and public/admin projections.

Run only this seed, not the general account/demo seed:

```sh
npm.cmd run seed:opportunities --workspace backend
```

It requires an existing Admin and the existing university record. It uses stable `campuscare:seed:<key>` identifiers in the existing tags field, adopts exact matching titles without duplicating them, and skips existing records on reruns. Admin edits, renamed titles, archive choices, team associations, interests and real-event deadlines/limits are preserved. A PostgreSQL advisory transaction lock serializes seed and event-metadata updates. The seed does not create users, alter passwords, run migrations or delete records. Both actual runs succeeded: the first inserted five, the second inserted zero.

No new migration is needed. Reserved `campuscare:` tags hold seed/source identifiers and boolean demo/featured/archive markers. API responses strip these markers from display tags; only Admin receives `source_metadata` and `is_demo`. Admin edits preserve seed/source markers even when public tags change. Admin checkboxes mark featured, mark demo, and archive/unarchive records. Featuring an event removes the prior featured marker under the shared lock; archiving clears its featured flag. Students do not receive archived events in discovery; existing accepted members can still open their archived event's team workspace. Ordinary display-tag input cannot create reserved metadata.

The featured card is selected from stored data and displayed only while upcoming; the initial seed prefers the real hackathon if it is future-dated and no event is already featured. No title is hardcoded into the UI. Student cards use professional registration/participation badges. Admin sees subtle Demo record and Archived indicators.

Participation controls collaboration consistently across every event type. Team/both opportunities expose team creation, recruiting, SkillMap matching, workspace, chat and membership-authorized Discord. Individual events hide Create/Find Team, team-size and team-requirement controls; their general useful skills/interests remain visible. Changing an Admin form's type provides a suitable participation default, which the Admin may override. Individual format wins even for a Hackathon/Competition/Innovation Challenge, and the backend rejects team creation for it. Individual event saves clear maximum team size.

### Showcase manual verification

Showcase validation passed: backend/frontend lint and builds, all **58 backend tests**, and browser workflows at **320, 375, 430 and 1280px**. The browser suite checks six cards, search/type/team filters, featured replacement, Admin demo/archive controls, individual/team feature gates, interest, SkillMap-backed team flow, chat and private Discord behavior. No horizontal page overflow or uncaught browser errors occurred; the 320px populated layout was visually reviewed. A fixture loading wait was corrected during verification. Existing Browserslist/bundle-size warnings and backend test audit/SSL notices remain.

1. Start backend/frontend using the existing configuration and sign in as Student. Open `/opportunities`; verify six cards and the hackathon's Featured Opportunity indicator. The Albanian university event should retain its original details.
2. Search title, organizer and tags; filter Workshop (one individual event), team opportunities (four events), status and upcoming/past. Clear filters between checks.
3. Open Student Technology Workshop and Career & Technology Networking Day. Verify useful skills and interest actions work, with no team controls or team-size entry.
4. Open the hackathon, innovation competition, digital challenge and university event. Verify Create/Find Team and real SkillMap overlap remain available. Request/accept membership with two student accounts, then test persisted CampusCare chat and accepted-member-only Discord access.
5. As Admin, verify four subtle Demo record indicators. Edit a sample, change its title/public tags, mark it featured, then archive it. It should disappear from normal discovery and remain available with Show archived enabled. Unarchive it for further presentation if desired. Verify the university event can also be edited normally.
6. Rerun `seed:opportunities`. Verify zero insertions, no duplicate cards, and no reversal of the Admin changes in step 5.
7. Repeat discovery/detail/form checks at 320, 375 and 430px. Browser fixture checks are run with `node --import tsx frontend/scripts/events-ui-smoke.mjs`; they use the same source catalog without writing backend data.

## Optional private Discord workspace

Migration `011_team_discord_invites.sql` adds nullable `event_teams.discord_invite_url` using `ADD COLUMN IF NOT EXISTS`. It is registered after migration 010. No OAuth, Discord API, bot, SDK, automatic channel creation or Discord login is used. CampusCare remains authoritative for membership, events and skills; its realtime team chat remains available as **CampusCare Team Chat**.

The leader may provide an optional invite during team creation or manage it from **Team Collaboration** in the private workspace. The leader can save a replacement or remove it; accepted members can only open it. `PATCH /api/opportunities/teams/:teamId/discord` accepts `{discord_invite_url: string | null}` and returns no private invite data. The only response carrying the URL is the accepted-student-member workspace response. Public cards, creation responses and Socket.IO room acknowledgements exclude it. Mentor/Admin are explicitly denied workspace access even if a membership row were added manually. Invite URLs are never included in audit metadata, analytics or notification text.

Backend validation accepts only `https://discord.gg/code` and `https://discord.com/invite/code` (an optional trailing slash is allowed). Codes contain letters, digits, underscores or hyphens. Credentials, custom ports, lookalike hosts, extra paths, HTTP, query strings, fragments and encoded/path-normalization tricks are rejected. Blank values remove the link. CampusCare does not contact Discord to verify whether an invite is active.

The collaboration link opens in a new tab with `rel="noopener noreferrer"` and an external-link icon. Without a link, leaders see **Add Discord workspace**; accepted members see **Your team has not added a Discord workspace yet.** Non-members cannot access this section.

### Earlier Opportunities service/authentication investigation

Read-only inspection of the connected database during this change confirmed migrations only through **009**. `campus_events` and `event_teams` do not exist, so authenticated event queries cannot succeed until **010** is applied. Discord also needs **011**. The local backend on port **5000** returned HTTP 200 for `/api/health`; the frontend has no local API override and defaults to `http://localhost:5000/api`. Backend `JWT_SECRET` is configured and token lifetime is configured as seven days; no secret was printed or changed.

This was the earlier Discord-task diagnosis. Before the showcase population task, a fresh read-only check confirmed that the operator had applied **010 and 011**, and the university event now existed. The showcase seed subsequently inserted five records successfully; no schema migration was run by the showcase task.

Unauthenticated `/api/auth/me` and `/api/opportunities` correctly return HTTP 401. JWT verification, Bearer-header attachment, and 401 session invalidation were preserved. Fixture browser checks verify headers on protected requests and redirection to login after an expired-session 401. Inspection of the user's actual Chrome session timed out awaiting app access, so the current student's token expiration/signature could not be verified; no session token was extracted or fabricated.

Missing event tables/columns now produce HTTP 503 with code `EVENTS_SCHEMA_REQUIRED` and an actionable database-update message. Discovery and the dashboard show errors with Retry instead of falsely showing an empty event list. This improves diagnosis but does **not** create the missing schema. Production/shared database migrations remain unapplied because the earlier task explicitly prohibited automatically running production migrations.

### Discord manual testing

Discord change validation: backend/frontend lint and builds passed; the full backend suite passed **56 tests**. Browser fixtures passed at 320, 375, 430 and 1280px, including leader add/update/remove, read-only member access, no-link states, external-link attributes, JWT headers, 401 session rejection, and missing-schema Retry without empty-state masking. The 320px member card was visually reviewed. Existing Browserslist/bundle-size warnings and backend test audit/SSL notices remain. No migration was applied.

1. Review migrations 010 and 011. Against an explicitly approved development database, run `npm.cmd run migrate --workspace backend`; restart backend/frontend if needed. Both migrations should appear in `schema_migrations`.
2. Sign in as a Student through the normal login flow. In DevTools Network, confirm `/api/auth/me` and `/api/opportunities` return 200 and include an Authorization Bearer header. Do not copy tokens into logs. If a previous session is expired, sign in again; never bypass authentication.
3. Create a team with an optional organizer/team-provided Discord invite. Check both accepted formats. Verify `http://discord.gg/code`, arbitrary domains and lookalike hosts receive a validation error.
4. As leader, open the workspace. Verify **Open Discord** appears alongside **CampusCare Team Chat**, opens a new tab, and has `noopener noreferrer`. Test changing the invite, removing it, saving a blank value, and adding it again.
5. As an accepted member, verify the link is visible and no editing controls appear. Calling the PATCH endpoint as that member must return 403. With no link, verify the member-specific empty text.
6. As pending/declined applicants, an unrelated Student, Mentor and Admin, request the private workspace directly: expect 403 and no invite. Verify event details and public team-list JSON have no `discord_invite_url`. Check audit logs and notifications contain no invite text.
7. At 320, 375 and 430px, verify the collaboration card, buttons and settings input remain readable without horizontal page overflow. Send a CampusCare chat message and verify it still persists and arrives in realtime.
8. Before applying migrations, expect the explicit database-update error, not an empty state. After migration, Retry should load real data. Expired JWTs should still redirect to login.
