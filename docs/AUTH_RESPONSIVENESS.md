# Authentication and account-entry responsiveness

## Root causes

The registration hero used `display:flex` but enabled `flex-direction:column` only at the desktop breakpoint. On phones, branding, heading, copy and the selected-role card competed in one row; its `overflow:hidden` clipped content. Grid tracks/items also retained intrinsic minimum widths, and shared top actions had no narrow-screen layout policy. Landing hero text could exceed its single-column track. The existing global `html { overflow-x:hidden }` made document-width-only checks insufficient: the page could report the right width while content was off-screen or clipped.

Custom entry-page surfaces also had hardcoded light backgrounds that did not consistently follow the existing dark palette. Some translucent Admin login badges had insufficient dark-mode contrast.

## Rendering-only changes

- `frontend/src/styles/auth-responsive.css`: shared shrinkable grid/flex items, bounded controls, wrapping, compact tablet/mobile heroes, stacked narrow-screen actions, comfortable tap targets and 16px mobile form text. Desktop split proportions remain intact using explicit `minmax(0,…)` tracks.
- `frontend/src/pages/RegisterPage.tsx`: correct column flex direction at every breakpoint, shared styling hooks and short mobile hero. Redundant mobile branding/copy is simplified; optional profile fields, selected role, progress and actions remain accessible.
- `frontend/src/pages/LoginPage.tsx`: shared hooks for compact mobile hero and actions. The Admin verification form and instructions remain intact.
- `frontend/src/pages/{RoleEntryPage,ForgotPasswordPage,NotFoundPage,OnboardingPage}.tsx`: scoped shared styling hooks; no handlers or routes changed.
- `frontend/src/components/security/ProfileSecurityActivity.tsx`: shrinkable security grid and explicit manual-key styling hook. QR images retain a square aspect ratio and scale to their container; synthetic long keys wrap.
- `frontend/src/components/layout/AuthenticatedLayout.tsx`: header hook for safe-area top padding. Shared CSS provides bottom safe-area spacing for the existing mobile navigation and main content.
- `frontend/src/main.tsx`: imports the responsive stylesheet.
- `frontend/index.html`: `viewport-fit=cover` with matching safe-area padding; zoom remains enabled.

Landing and Profile page adjustments are scoped through their existing class names, so those page files do not require duplicated responsive fixes. First-visit theme choice is included in the audit. Existing navy/teal/cyan colors are retained; dark surfaces use existing theme variables. No new overflow-hiding rule is used to solve the auth layout problem.

Authentication, registration, onboarding, 2FA setup/enable/disable, API contracts, backend, role permissions, routes and database logic are unchanged. AST comparison against the prior revision confirms that the `handleSubmit`, `beginSetup`, `confirmSetup` and `disable` handler bodies are identical.

## Browser verification

`frontend/scripts/auth-responsive-smoke.mjs` covers:

- Landing, role selection, Student/Mentor registration and restricted Admin registration.
- Student/Mentor/Admin login, password recovery and public 404.
- Admin six-digit verification, validation response and Back to sign in.
- Student/Mentor/Admin onboarding.
- Admin profile, QR/manual-key setup, enabling and disabling 2FA using fixture APIs.
- Existing registration payload roles, onboarding Authorization header, token clearing and login redirect using fixture accounts only.

Matrix: **320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 1024×900, 1280×900**, in light and dark modes: **272 layout states**, plus first-visit theme choice. Checks include document width, visible off-screen elements, clipped auth text, form bounds, reachable primary controls, stacked role cards, QR aspect ratio and contrast for auth fields/badges. The script temporarily disables the global overflow mask to catch underlying sizing errors. It excludes the authenticated layout's intentionally scrollable mobile module-navigation strip from off-screen-link checks while still checking document width.

All API requests use intercepted fixture responses. Registration does not create real accounts; no real QR key, password or OTP is used. Screenshots are written to the OS temp directory under `campuscare-auth-responsive`.

```powershell
npm.cmd run dev --workspace frontend -- --host 127.0.0.1 --port 5187
# In another terminal, using an available Playwright installation:
node frontend/scripts/auth-responsive-smoke.mjs
```

Set `PLAYWRIGHT_MODULE` to the module file URL of an existing installation, `CHROME_PATH` for another compatible browser, or `AUTH_TEST_URL` for another local server. `AUTH_TEST_WIDTHS=320,430` runs a focused subset; the default runs the complete matrix.

Frontend lint/build and the existing Events/Admin Users browser suites are also run. Existing Browserslist and bundle-size warnings remain; this task does not change dependencies or bundling policy.

Recorded result: frontend lint/build passed; the full **272-state** matrix and first-visit choice passed, followed by **68 focused narrow-phone states** with field/badge contrast checks and **34 desktop light/dark states** after the final typography adjustment. Existing Events and Admin Users browser suites passed at 320/375/430/1280px. No document overflow, off-screen form controls or clipped auth text remained in the tested matrix. Initial test-only locator and six-character-input assumptions were corrected without changing application behavior.

## Manual review and limitations

Screenshots are reviewed for narrow Register, Login, role selection, Landing and Admin verification/QR states in light/dark mode, plus desktop split layouts. Test on physical iOS/Safari and Android devices before production release: headless Chromium viewport checks cannot validate actual browser chrome, the on-screen keyboard or hardware safe-area behavior. Vertical document scrolling is intentional where forms and profile content require it. Inputs with long values scroll their own text naturally; they do not expand the page.

No commit, push or deployment is performed by this change.
