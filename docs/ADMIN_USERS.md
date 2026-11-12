# Registered Users

Admin navigation: **Account → Users**, route `/admin/users`. This is a read-only account directory; there are no account, password, role or status mutations.

## API and access

- `GET /api/admin/users?search=&role=&page=1&limit=20&sort=newest`
- `GET /api/admin/users/:id`

Both endpoints use existing JWT authentication, database-derived role authorization and an additional Admin service check. Anonymous requests receive 401; Student/Mentor requests receive HTTP 403. Successful responses use `Cache-Control: no-store`. The SPA shows a 403 access-denied screen for signed-in Student/Mentor direct visits; the static HTML document itself follows the application's normal SPA hosting behavior. No Users navigation or directory request is rendered for these roles.

List fields: `id`, `full_name`, `email`, `role`, `created_at`, `profile_completed`, `last_login_at`. Profile completion is the existing onboarding-completed flag, not an invented percentage. Last login is only the latest existing `login_success` audit timestamp; no audit metadata or other activity actions are read. Missing login history displays Not recorded. No account-status field exists, so no status is invented.

Details add only `department`, `study_year`, and (for Admin accounts) `admin_position`, `admin_department_unit`. Both SQL queries and response mapping explicitly allowlist fields. No password/hash, JWT, 2FA/recovery data, IP addresses, support reasons, wellbeing/support content, AI history or team chats are selected or returned. Internal IDs are used for requests/keys and are not displayed in the normal UI. Directory viewing does not add per-account audit records or log emails/search terms.

Summary counts are global database totals; `total` is the filtered count. Default page size is 20, maximum 100; order uses joined date and ID for deterministic ties. Name/email search is case-insensitive with literal wildcard escaping. Role and sort are allowlisted; pagination/search lengths are validated. User content is parameterized SQL. No migration or seed is needed.

## Files

- `backend/src/modules/adminUsers/`: repository, service, routes and HTTP/privacy tests.
- `backend/src/routes/index.ts`: endpoint mounting.
- `frontend/src/pages/AdminUsersPage.tsx`: table, mobile cards, filters, summary and safe detail panel.
- `frontend/src/pages/ForbiddenPage.tsx`: Admin-route access denial.
- `frontend/src/services/adminUsersService.ts`: typed API access.
- `frontend/src/routes/{AppRoutes,ProtectedRoute}.tsx`: Admin route and optional denial screen; other role-route behavior is preserved.
- `frontend/src/components/layout/AuthenticatedLayout.tsx`: Admin-only Users navigation.
- `frontend/scripts/admin-users-ui-smoke.mjs`: fixture-only browser checks.

## Verification

Recorded checks: backend lint/build passed; all **71 backend tests** passed, including HTTP authorization, allowlist privacy, search, role filtering, pagination and details. Frontend lint/build passed. Fixture browser checks passed at **320/375/430/1280px**, including list/detail, empty/error/Retry states, hidden Student/Mentor navigation and direct-route denial before directory requests. Mobile and desktop screenshots were visually reviewed. Read-only repository queries against the current database succeeded and confirmed the exact selected field names; no account data was written. Existing frontend bundle-size/Browserslist and backend test audit/SSL notices remain.

Run backend lint, build and tests and frontend lint/build with the existing workspace scripts. For browser checks, start Vite on port 5187, then run `node frontend/scripts/admin-users-ui-smoke.mjs` using an available Playwright installation (`PLAYWRIGHT_MODULE` may point to a module file URL; `CHROME_PATH` may override the browser path). The script uses fake accounts/API responses, checks 320/375/430/1280px, and writes screenshots under the OS temp directory in `campuscare-admin-users-ui`. It does not write database data or use real credentials.

Manual steps:
1. Sign in as Admin normally. Open Account → Users. Confirm real Total/Student/Mentor/Admin counts and newest accounts, with at most 20 rows initially.
2. Search a known name, then a known email. Apply each role filter, switch oldest/newest, and page through results. Global summary totals should not change with filters.
3. Open a user. Verify safe account/profile fields, profile setup flag and recorded login timestamp only. Close the panel. Inspect list/detail JSON to confirm the allowlist above.
4. Search a nonexistent account: expect No registered users found. Stop the backend: expect an error and Retry, never a misleading empty state.
5. As Student and Mentor, verify Users is absent from navigation, `/admin/users` shows access denied, and an authenticated request to either API endpoint returns HTTP 403. Without authentication, expect 401.
6. Repeat at 320/375/430px and desktop. Check long names/emails, detail panels and pagination for overflow. No role-editing controls should exist.
