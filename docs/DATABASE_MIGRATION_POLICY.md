# CampusCare Database Migration Policy

## Rules

- Never run migrations automatically during API startup or deployment without an explicit release step.
- Back up Neon and verify restore access before every production schema change.
- Use ordered, immutable filenames. Never edit a migration already applied in production; add the next numbered file.
- Prefer additive changes: nullable columns, new tables/indexes, backfills, then constraints in later releases.
- Avoid table/column drops, destructive type conversions, broad deletes, and long blocking rewrites. Such work requires a reviewed multi-release expand/migrate/contract plan.
- Test against a production-like copy, review query plans/locks, and estimate duration before production.
- Keep seed and cleanup commands separate from schema migrations. Never run demo seed or cleanup against production without explicit approval and a verified target.
- Do not put secrets, credentials, or personal data in migration files or logs.

## Execution and history

`npm run migrate --workspace backend` uses the explicit order 001, 002, 004, 006. It creates `schema_migrations`, skips recorded filenames, and runs each new file in its own transaction. Existing databases will record the current idempotent migrations on the first run of the updated runner. That first run should be rehearsed on a Neon branch or backup clone.

Files 003 and 005 are legacy data setup files and are intentionally excluded. `migrate_notifications.ts`, seeds, admin seed, and cleanup are also outside the ordered runner and should be retired or converted into reviewed numbered migrations only when necessary.

## Release procedure

1. Create/verify a Neon backup or branch and record the target database/project without printing its URL.
2. Run the application test suite and migration on a production-like branch.
3. Review locks, runtime, row counts, constraints, and application compatibility.
4. Schedule the production change and identify an operator and abort threshold.
5. Run the migration once, inspect `schema_migrations`, then call `/api/ready` and perform smoke tests.
6. Monitor errors and latency. Record the release and applied filename.

## Rollback limitations

The repository has no down migrations. PostgreSQL transactions protect a single migration from partial application, but cannot guarantee operational rollback after commit, especially after data conversion or application writes. Rollback normally means deploying backward-compatible application code; schema reversal requires a separately reviewed forward migration. Restoration from backup is the last resort and may lose writes made after the backup.
