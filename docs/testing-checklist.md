# CampusCare Testing Checklist

Use this checklist before submitting, presenting, or continuing with a new development phase.

## A. Setup Checks

- [ ] Run `npm install` from the project root.
- [ ] Create `backend/.env` from `backend/.env.example`.
- [ ] Confirm `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PORT`, and `NODE_ENV` are configured.
- [ ] Create the PostgreSQL database named `campuscare`.
- [ ] Run `backend/src/database/001_init_users.sql`.
- [ ] Run `backend/src/database/002_init_modules.sql`.
- [ ] Run `backend/src/database/003_seed_demo_data.sql` if demo data is needed.
- [ ] Start the backend with `npm run dev:backend`.
- [ ] Start the frontend with `npm run dev:frontend`.

## B. Backend Checks

- [ ] `GET /api/health` returns `success: true` and database status.
- [ ] `POST /api/auth/register` creates a new user.
- [ ] `POST /api/auth/login` returns a JWT token and user data.
- [ ] `GET /api/auth/me` returns the logged-in user with a valid token.
- [ ] Help request endpoints list, create, reply, and update status correctly.
- [ ] Skill endpoints list skills, create skills, attach/remove my skills, and show student skill cards.
- [ ] Stress endpoints create records, list visible records, and return summaries.
- [ ] Mood endpoints create records, list visible records, and return summaries.
- [ ] Lost & Found endpoints list, create, view, and update statuses correctly.
- [ ] `GET /api/dashboard/stats` returns role-aware dashboard data.

## C. Frontend Checks

- [ ] Landing page loads at `http://localhost:5173`.
- [ ] Register works for student and mentor accounts.
- [ ] Login works with valid credentials.
- [ ] Invalid login shows a clear error message.
- [ ] Logout clears the session and returns to the login flow.
- [ ] Protected routes redirect unauthenticated users to `/login`.
- [ ] Dashboard loads after login.
- [ ] Silent Help can create requests and show existing requests.
- [ ] SkillMap can add skills, attach my skills, remove my skills, and search student skill cards.
- [ ] ExamStress Tracker can create records and the 1-5 slider updates correctly.
- [ ] MoodCampus can create mood records and show summaries.
- [ ] Lost & Found can create reports and show public reports.
- [ ] Profile shows full name, email, role, account badge, created date, and skills.

## D. Role Checks

### Student

- [ ] Can create a help request.
- [ ] Can add skills to their profile.
- [ ] Can add a stress record.
- [ ] Can add a mood record.
- [ ] Can create a lost/found item.
- [ ] Does not see admin-only controls.

### Mentor

- [ ] Can see the mentor dashboard.
- [ ] Can view help requests.
- [ ] Can reply to help requests.
- [ ] Can update support-related help request status if implemented.
- [ ] Can view broader student support data and summaries.

### Admin

- [ ] Can see the admin dashboard.
- [ ] Can view global statistics.
- [ ] Can manage statuses where implemented.
- [ ] Sees admin-level controls.

## E. UI Checks

- [ ] Loading states appear during API requests.
- [ ] Empty states are friendly and accurate.
- [ ] Success messages appear after successful form submission.
- [ ] Error messages are clear and visible.
- [ ] Forms reset after successful submit where appropriate.
- [ ] Desktop layout is clean.
- [ ] Tablet layout does not break.
- [ ] Mobile layout remains usable.

## F. Build Checks

- [ ] `npm run build` passes from the project root.
- [ ] No TypeScript errors appear.
- [ ] No avoidable browser console errors appear during normal use.
- [ ] `.env`, `node_modules`, `dist`, `build`, and log files are not staged for commit.
