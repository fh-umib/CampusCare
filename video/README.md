# CampusCare showcase video

This folder contains an isolated Playwright capture workflow and a 72-second Remotion composition. It does not modify or recreate the CampusCare product UI.

## Credentials and URLs

Set these in the shell or a private environment manager. Never commit them:

- `CAMPUSCARE_STUDENT_EMAIL`, `CAMPUSCARE_STUDENT_PASSWORD`
- `CAMPUSCARE_MENTOR_EMAIL`, `CAMPUSCARE_MENTOR_PASSWORD`
- `CAMPUSCARE_ADMIN_EMAIL`, `CAMPUSCARE_ADMIN_PASSWORD`
- `CAMPUSCARE_ADMIN_TOTP` only when the selected test Admin account requires 2FA
- `CAMPUSCARE_BASE_URL` defaults to `http://127.0.0.1:5173`
- `CAMPUSCARE_PRODUCTION_URL` defaults to `https://campuscare-platform.vercel.app` and is encoded only in the outro QR

Start the real local frontend and backend in separate terminals, or set `CAMPUSCARE_BASE_URL` to a deployed instance. Then run:

```powershell
npm run video:capture
npm run video:assets
npm run video:preview
npm run video:still
npm run video:render
npm run video:validate
```

The capture script writes directly to Remotion's configured `public/captures/` directory. It uses a 1440x900 viewport at 2x device scale, never logs secret values, captures the empty login screen before authentication, redacts email-shaped text and Discord invitation text, and refuses to bypass Admin 2FA. Inspect every PNG in `public/captures/` before rendering because real support data can still be sensitive.

The final file is `out/campuscare-showcase.mp4`.
