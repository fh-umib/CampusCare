# CampusCare Flagship Roadmap

Each phase must preserve current route contracts until a versioned migration is agreed.

## Phase 2.1 — Foundation

- Goal: architecture boundaries, validation, permission matrix, safe errors, and structured logging.
- Database: migration history only; no destructive changes.
- Backend: config validation, request IDs, health/readiness, errors, input validation, authorization tests.
- Frontend: verify error compatibility; no redesign.
- Risks: accidentally tightening an MVP behavior without product agreement.
- Testing: auth/role/ownership integration tests, validation cases, health/readiness, production error redaction.
- Done: contracts documented, critical rules tested, lint/build green, production smoke checklist approved.

## Phase 2.2 — Analytics and reports

- Goal: privacy-safe real analytics, weekly reports, PDF export, and audit logs.
- Database: additive audit/event and report tables, aggregation indexes, retention fields.
- Backend: consent-aware aggregates, immutable audit writer, background report generation, authorized PDF endpoints.
- Frontend: accessible analytics/heatmaps, report history/export states.
- Risks: re-identification, expensive queries, audit tampering, PDF injection.
- Testing: aggregation correctness, minimum cohorts, authorization, audit integrity, PDF snapshots/load tests.
- Done: metrics trace to real records, privacy review passes, exports are reproducible and authorized.

## Phase 2.3 — AI assistance

- Goal: AI Study Assistant and weekly summaries with safe usage controls.
- Database: consent, prompt/output metadata, quotas, feedback, retention/deletion markers; avoid raw secrets.
- Backend: provider adapter, data minimization, prompt-injection defenses, moderation, budgets, timeouts, fallbacks.
- Frontend: explicit AI labeling/consent, citations where possible, feedback and safe failure states.
- Risks: hallucination, sensitive-data disclosure, prompt injection, bias, cost, dependency outage.
- Testing: fixed evaluation set, adversarial/privacy tests, quota and fallback tests, human review thresholds.
- Done: documented limitations, measurable quality/safety gates, opt-out/deletion, monitored costs.

## Phase 2.4 — Realtime and chat

- Goal: real-time notifications and authorized student–mentor chat.
- Database: conversations, membership, messages, receipts, retention/moderation state.
- Backend: WebSocket/Socket.IO authentication, membership checks on every event, durable delivery and rate limits.
- Frontend: connection/retry/offline states, accessible messaging and notification reconciliation.
- Risks: cross-conversation leakage, impersonation, abuse, lost/duplicate events, scaling state.
- Testing: socket authorization, reconnect/order/idempotency, abuse limits, multi-instance tests.
- Done: durable messages, no unauthorized subscription, observable delivery and moderation workflow.

## Phase 2.5 — Stronger identity security

- Goal: 2FA for admin/mentor, stronger controls, and activity history.
- Database: encrypted 2FA material, hashed recovery codes, security events, session/revocation records.
- Backend: step-up authentication, rotation/recovery, session management, sensitive-action audit.
- Frontend: enrollment/challenge/recovery UX without changing core workspaces.
- Risks: account lockout, recovery abuse, secret leakage, clock drift.
- Testing: enrollment/recovery/replay, revocation, brute-force limits, role transition tests.
- Done: privileged roles require 2FA, recovery is supportable and audited, sessions can be revoked.

## Phase 2.6 — Delivery automation

- Goal: automated tests, GitHub Actions, and Docker reproducibility.
- Database: ephemeral test database and migration checks.
- Backend: unit/integration/API suites and deterministic container startup.
- Frontend: component/route/accessibility tests and production container/build validation.
- Risks: flaky tests, secret exposure in CI, images diverging from Render/Vercel.
- Testing: CI lint/type/build/test, migration-from-empty, dependency/security scans, smoke tests.
- Done: protected green pipeline, reproducible images, documented local/CI commands and rollback artifact.

## Phase 2.7 — Operability and measured performance

- Goal: monitoring, profiling, and Redis only where measurements justify it.
- Database: query telemetry/maintenance policy; cache has no source-of-truth data.
- Backend: metrics/traces/alerts, SLOs, profiling, bounded cache with invalidation and outage fallback.
- Frontend: error/performance telemetry with privacy controls.
- Risks: telemetry privacy, alert fatigue, stale cache, added operational complexity.
- Testing: load baselines, alert drills, cache correctness/failure tests, retention review.
- Done: dashboards and actionable alerts exist, bottlenecks are measured, any Redis use has proven benefit and safe fallback.
