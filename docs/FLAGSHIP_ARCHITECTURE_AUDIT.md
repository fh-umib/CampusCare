# CampusCare Flagship Architecture Audit

Audit date: 2026-07-17. Scope: repository code only. No production deployment, environment inspection, or database mutation was performed.

## Executive summary

CampusCare is a compact layered MVP with a React/Vite client and Express/PostgreSQL API. Its route-controller-service-repository separation, parameterized SQL, bcrypt hashing, JWT authentication, public-user mapping, and blocked public admin registration are sound foundations. Phase 2.0 adds production configuration validation, stable error codes, safe centralized errors, request IDs, structured HTTP logging, stricter reusable validation, readiness reporting, and migration history for future runs.

The highest remaining risks are authorization and privacy granularity. Several support catalog/list endpoints are public, mentors and admins receive global raw mood/stress records, any authenticated role can reply to help requests or create shared skills, and student skill cards expose user identity publicly. These behaviors may be intentional for the MVP UI, so they are documented rather than broadly changed without product decisions and tests.

## Current architecture

### Frontend

- React 19, TypeScript, Vite, React Router, Axios, Tailwind/CSS.
- `AppRoutes` separates public pages from a shared authenticated layout. `ProtectedRoute` supports role filters, but current internal routes do not pass role restrictions.
- `AuthContext` restores a JWT from local storage and obtains `/auth/me`; the Axios interceptor sends it as a Bearer token.
- Pages call feature service files that consume `{ success, message, data }`. Types are duplicated between frontend and backend with no generated contract.
- Vercel rewrites all paths to `index.html`. `VITE_API_URL` selects the Render API; the checked-in fallback is localhost.

### Backend

- Express and TypeScript use `route -> controller -> service -> repository -> pg`.
- Controllers are thin and use shared response helpers. Services hold validation, ownership, notification, and role-scoping logic. Repositories use positional parameters for values.
- Code is horizontally grouped. `backend/src/modules/README.md` defines a gradual vertical-slice migration rather than a risky rewrite.
- Central middleware now covers CORS, request IDs/logging, a 100 KB JSON limit, authentication, role checks, not-found responses, and safe errors.

### Database

- PostgreSQL uses UUID primary keys and foreign keys. Core tables cover users, help requests/replies, skills/student skills, stress, mood, lost/found, profiles, notifications, and notification reads.
- SQL constraints cover roles, enums, stress range, uniqueness, and notification targeting. Useful indexes exist for common filters.
- The ordered TypeScript runner executes schema files 001, 002, 004, and 006. Future executions now record filenames in `schema_migrations` and wrap each unapplied file in a transaction.
- Files 003 and 005 are data scripts, not ordered schema migrations. Seed, admin seed, notification migration, and demo cleanup are separate operational commands.

## Authentication and access flow

Registration validates input, permits only student or mentor, hashes with bcrypt, creates the user, and returns a signed JWT plus a public user object. Login uses the same generic invalid-credential message and never returns `password_hash`. JWTs carry user ID and role, but protected requests reload the user from the database, so the current database role is authoritative. Admin login additionally restricts access to one hard-coded approved email. Public admin registration is rejected.

The frontend guard improves navigation but is not treated as authorization. Backend middleware protects personal endpoints and status changes; service-level ownership protects lost/found updates and user-owned skill/profile/notification mutations. Detailed gaps are in `ROLE_PERMISSION_MATRIX.md`.

JWTs are stored in local storage, which increases impact of a future XSS issue. There is no refresh-token rotation, revocation list, rate limiting, account lockout, email verification, or production password-reset implementation.

## Deployment flow

The frontend builds to static assets and deploys on Vercel with SPA rewrites. The backend compiles TypeScript and runs on Render. Render supplies production environment variables and connects to Neon through `DATABASE_URL`. Migrations are manual and are not run at server startup. Live URLs and deployment files were not changed.

## Strengths

- Clear small layered architecture and typed domain models.
- Parameterized repository queries and database constraints.
- bcrypt password hashes and a public-user projection that excludes hashes.
- Database-backed identity on every authenticated request.
- Manual/restricted admin creation and backend role middleware.
- Idempotent-looking schema DDL, useful indexes, and explicit seed commands.
- Consistent success envelope already consumed by the frontend.
- CORS allowlist and environment-based frontend origin.

## Technical debt and duplication

- Mirrored frontend/backend API types can drift.
- Validation is spread across auth validation and module validation; Phase 2.0 keeps one lightweight in-house foundation rather than adding Zod beside it.
- Snake-case/camel-case aliases are repeatedly handled in services.
- Health routes are defined at both `/health` and `/api/health` for compatibility.
- Role visibility is represented by broad `mentor || admin` checks, which will not scale to consent, assignment, department, or purpose-based access.
- Notification creation is embedded in feature services and is not transactional with primary writes.
- The approved admin email is hard-coded in application code.

## Security and privacy findings

1. High: global raw stress and mood records are available to every mentor/admin. There is no student consent, mentor assignment, minimum aggregation threshold, or field minimization.
2. High: `GET /help-requests`, `GET /help-requests/:id`, skill listings/student cards, and lost/found listings/details are unauthenticated. Help content and replies may be sensitive even when a student name is masked.
3. Medium: any authenticated role can reply to help requests and create skills; no explicit mentor/student policy is enforced.
4. Medium: JWT local-storage persistence has XSS exposure; no CSP is configured in this repository.
5. Medium: no authentication rate limiting, lockout, MFA, token revocation, or security-header middleware.
6. Medium: hard-coded admin allowlist is brittle and supports only one account.
7. Medium: request-level notifications are separate writes, so partial success is possible.
8. Low: development logs may include internal error/stack details by design; production logs now suppress database details and responses never return unexpected exception text.

## Validation and error handling

Confirmed validation covers email format, password minimum length, public roles, text presence/selected maximums, enumerations, dates, stress range 1–5, non-empty JSON objects, strict booleans, and UUID route/body IDs. PostgreSQL also enforces key enum and range rules. Gaps include password strength beyond length, normalization/limits on all long-text fields, query pagination/limits, date boundary rules, unknown-field rejection, content moderation, and shared contract tests.

Central async forwarding, not-found handling, stable error codes, and safe 500 messages now exist. Known `AppError` messages remain user-facing. Database errors are converted to a generic 503. There is no classification for PostgreSQL uniqueness/foreign-key errors, timeout policy, graceful shutdown, or process-level rejection/exception handling.

## Scalability limitations

- List endpoints have no pagination and can return unbounded rows.
- Dashboard statistics issue multiple parallel aggregate queries without caching/materialization.
- Render instances hold no shared real-time state; notifications are polling-oriented.
- No connection-pool sizing/timeouts, background job queue, or transaction abstraction is configured.
- Analytics currently expose operational rows rather than privacy-safe aggregates.
- A single API service owns all workloads; this is acceptable now and should remain a modular monolith until measurements justify separation.

## Tests and observability

No automated test files or test scripts were found. Existing documentation provides a manual checklist only. Structured request/error logs and request IDs now provide a minimal correlation foundation. There is no metrics, tracing, alerting, uptime check, Sentry integration, coverage gate, or CI workflow.

## Recommended folder evolution

Keep shared `config`, `middleware`, and database primitives. Move active features one at a time to `modules/<domain>/{route,controller,service,repository,types,test}` with old-path compatibility exports. Start with auth, then a low-coupling module such as mood. Place new analytics, audit logs, and AI work directly in their domain. Avoid a wholesale move before contract and authorization tests exist.

## Safe implementation order

1. Add API/integration tests around auth, ownership, roles, anonymity, and current response shapes.
2. Decide privacy and consent rules; then close public support endpoints and replace global mentor access with assignments/aggregates.
3. Add rate limits, security headers, pagination, database timeouts, graceful shutdown, and transactional write patterns.
4. Implement analytics and audit foundations before reports/PDFs.
5. Add AI only after data-minimization, consent, retention, prompt-injection, cost, and evaluation controls.
6. Add chat/realtime after durable authorization and message retention rules.
7. Add MFA, CI, containers, monitoring, and performance-led caching as sequenced in `FLAGSHIP_ROADMAP.md`.

## Confirmed compatibility

Existing route paths, success envelopes, JWT shape, role names, frontend URL configuration, and UI were preserved. Error envelopes retain `message` and `errors` while adding `code`. Health remains available at `/health` and `/api/health`; its database detail moved to the new non-sensitive `/api/ready` status. No deployment or production migration was performed.
