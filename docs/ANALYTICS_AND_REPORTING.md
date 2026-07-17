# Analytics and Reporting

CampusCare analytics are a modular backend domain under `backend/src/modules/analytics`; deterministic reports and PDF rendering live under `modules/reports`. Calculations use existing PostgreSQL records and UTC date boundaries. No analytics migration or duplicated reporting table is required in Phase 2.2.

## Data sources and definitions

| Source | Timestamps used | Metrics |
|---|---|---|
| `users` | `created_at` | total users, registrations, users by role |
| `help_requests` | `created_at`, `updated_at` | created/open/answered/status/category activity |
| `help_replies` | `created_at` | first mentor/admin response time |
| `stress_records` | `recorded_at` | count, average, distribution, trend |
| `mood_records` | `recorded_at` | count, distribution, most common mood |
| `student_skills` | `created_at` | skills added and skill-module activity |
| `lost_found_items` | `created_at` | report activity |
| `notifications` | `created_at` | notification totals/activity |
| `user_profiles` | `onboarding_completed` | profile completion |

Activity is the union of stress, mood, help request, student-skill, and lost/found creation events. Active users are distinct owners in that union. The previous-period comparison uses an immediately preceding range of equal duration. Response time is hours from request creation to its first reply authored by a mentor/admin.

The current schema has no skill verification or request priority fields; those values are explicitly omitted/null rather than invented. Wellbeing metrics are self-reported patterns, not diagnoses or predictions.

## Endpoints

All endpoints require a Bearer token and an exact matching backend role.

- `GET /api/analytics/{student|mentor|admin}/overview?period=7d|30d|current_month|previous_month` (hyphenated month aliases are also accepted)
- Custom analytics: `period=custom&start=YYYY-MM-DD&end=YYYY-MM-DD`, limited to 366 days
- `GET /api/reports/{student|mentor|admin}/{weekly|monthly}`
- `GET /api/reports/{student|mentor|admin}/{weekly|monthly}/pdf`

Student analytics filter every personal source by the authenticated user ID. Mentor analytics contain only aggregate counts/distributions and never select names, IDs, notes, descriptions, or reply text. Admin analytics are operational aggregates with the same content exclusion. PDFs repeat only these safe aggregates and use a sanitized server-defined filename.

## Frontend

The existing role dashboard includes a compact analytics section with metric cards, accessible CSS bar visualization, activity heatmap, loading/error/empty states, and weekly/monthly PDF buttons. No fake values or additional chart runtime is used.

## Performance and limitations

Queries filter by date in PostgreSQL and aggregate before returning. Existing stress/mood user-date indexes support student queries. Help, skill, lost/found, and cross-module time filters may need timestamp indexes after production `EXPLAIN ANALYZE` measurements. Analytics currently execute several bounded queries in parallel; there is no Redis cache. Daily/weekly/monthly active user definitions are range-based rather than persisted events, and notification role broadcasts cannot be attributed as personal activity.

## Testing

Run `npm test --workspace backend`. Tests cover UTC/invalid period handling, role denial for student/mentor access to admin analytics, deterministic empty reports, privacy-safe report shape, and valid PDF generation. Database integration tests against an isolated PostgreSQL instance remain the next testing layer; never point tests at Neon production.

## Future AI integration

Phase 2.3 may consume the already privacy-filtered report object, never raw notes or support messages by default. Add explicit consent, provider retention controls, evaluation, prompt-injection defenses, quotas, and auditable generation metadata before enabling AI summaries.
