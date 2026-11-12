# CampusCare readability audit

Scope: frontend colors and visual styling only. Backend code, API contracts,
routes, authorization, authentication, data storage, and feature behavior were
not changed. No commits, pushes, or deployments were performed.

## Findings and changes

- The original teal `#0d9e8a` gives white text approximately 3.35:1 contrast.
  Primary text buttons now use a darker teal pair, while decorative accents
  retain CampusCare's teal/cyan identity.
- Pale gray helper text and low-opacity white copy weakened captions, sidebar
  sections, timestamps, and empty states. Shared muted/secondary text tokens now
  provide a consistent hierarchy in both themes.
- Several dark overrides changed foregrounds without changing nested pale
  backgrounds. Dashboard readings, mood summaries/history, skill distributions,
  personal item reports, anonymous-request controls, and custom form fields now
  receive matching dark surfaces.
- Dark Mentor badges and the AI privacy warning lacked foreground overrides.
  Semantic status palettes now pair foregrounds and backgrounds in both themes.
- Placeholders have explicit, opaque text colors. Controls have visible borders;
  keyboard focus has an opaque outline. Disabled controls use distinct foreground,
  background, border, and cursor styling rather than opacity alone.
- Permanent navy regions use an explicit inverse text context. Team Workspace
  dates remain readable in Light Mode. Landing ghost links and decorative navy
  icons no longer disappear in Dark Mode.
- Support-message metadata uses higher opacity. Chat handlers, subscriptions,
  permissions, and message rendering behavior are unchanged.

The theme additions use semantic variables and exact class selectors. No
substring class matching or runtime contrast-based recoloring was introduced.

## Changed files

Shared styles and loading:

- `src/styles/index.css`
- `src/styles/readability.css` (new)
- `src/main.tsx`

Shared components:

- `src/components/layout/AuthenticatedLayout.tsx`
- `src/components/layout/NotificationBell.tsx`
- `src/components/support/SupportChat.tsx`
- `src/components/ui/EmptyState.tsx`

Page visual styles/palettes:

- `src/pages/AdminUsersPage.tsx`
- `src/pages/AIStudyAssistantPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/HelpRequestsPage.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/LostFoundPage.tsx`
- `src/pages/MoodCampusPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/OpportunitiesPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/RoleEntryPage.tsx`
- `src/pages/SkillMapPage.tsx`
- `src/pages/StressTrackerPage.tsx`

Verification:

- `scripts/readability-smoke.mjs` (new)
- `scripts/admin-users-ui-smoke.mjs` (adds `SMOKE_THEME` selection)
- `scripts/events-ui-smoke.mjs` (adds `SMOKE_THEME` selection)
- `READABILITY_AUDIT.md` (this report)

## Browser coverage

The fixture-only readability scan covers public Landing, role selection,
registration, login, recovery, and 404; student Dashboard, Silent Help,
ExamStress, MoodCampus, AI Study Assistant, SkillMap, Events, Team Workspace,
Lost & Found, and Profile; mentor Dashboard, support queue, and Profile; admin
Dashboard, Users, Audit Logs, Events, and Profile with notifications open.

Widths: 320, 375, 430, and 1280 pixels, in Light and Dark Mode. Fixtures include
populated tables, skills, support messages, charts, team messages, Discord, and
notifications. The scanner checks rendered text and placeholders against
approximately 4.5:1 normal-text / 3:1 large-text thresholds, and checks page
overflow. It waits for the page and loading states before sampling.

Screenshots visually inspected during this work include Landing, role selection,
registration, login, 404, Dashboard/analytics, Silent Help/support chat,
ExamStress, MoodCampus, AI warning/disabled states, SkillMap, Team Workspace and
Discord, Lost & Found, Users, Audit Logs, notifications, Profile, and mobile
Admin 2FA setup. This is screenshot review in headless Chrome, not physical-device
or assistive-technology testing.

The existing authentication smoke suite also exercises registration, sign-in,
2FA challenge/setup/enable/disable, onboarding, and theme selection. The Users
suite covers search/filter/pagination/detail/error/empty states and role denial.
The Events suite covers creation, joining, permissions, Discord editing/access,
bounded chat history, admin controls, and error/retry states. Both latter suites
can now run in either theme via `SMOKE_THEME=light` or `SMOKE_THEME=dark`.

## Running the checks

Start the frontend on `http://127.0.0.1:5187`. The browser scripts use an installed
Playwright module (`PLAYWRIGHT_MODULE` may specify its file URL) and Chrome
(`CHROME_PATH` can override the executable). All API responses are fixtures.

```text
npm.cmd run lint --workspace frontend
npm.cmd run build --workspace frontend
node frontend/scripts/readability-smoke.mjs
node frontend/scripts/auth-responsive-smoke.mjs
node frontend/scripts/admin-users-ui-smoke.mjs
node --import tsx frontend/scripts/events-ui-smoke.mjs
```

The readability script writes screenshots and JSON results under the operating
system temporary directory, `campuscare-readability`. It fails on sampled contrast
violations, page overflow, or runtime errors. `READABILITY_PATHS` and
`READABILITY_WIDTHS` allow focused rechecks. `READABILITY_STRICT=0` is available
for diagnostic reporting before fixes.

## Limits

This is a practical readability audit, not WCAG certification. Text over exposed
gradients is counted separately and requires visual review. Nearly opaque
surfaces are sampled using alpha compositing over ancestor solid colors; complex
background images, sibling overlays, SVG graphics, every tooltip/hover combination,
OS-rendered controls, Safari/Firefox, and physical mobile keyboards are not fully
measured by this script. Fixture browser checks do not verify a live backend,
Discord service, real notification delivery, or real Socket.IO transport.

Recommended commit message: `fix: improve light and dark mode readability`
