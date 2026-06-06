# CampusCare - Student Support, Skills & Wellbeing Platform

CampusCare is a full-stack student support platform designed for university students. It combines anonymous help requests, SkillMap, exam stress tracking, weekly mood tracking, lost & found reports, and dashboard insights.

## Table of Contents

1. [Overview](#overview)
2. [Project Goal](#project-goal)
3. [Current Project State](#current-project-state)
4. [Main Users](#main-users)
5. [Core Functionalities](#core-functionalities)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [Backend Architecture](#backend-architecture)
9. [Frontend Structure](#frontend-structure)
10. [Main Modules](#main-modules)
11. [API Endpoints](#api-endpoints)
12. [How to Run the Project](#how-to-run-the-project)
13. [Environment Variables](#environment-variables)
14. [Database Setup](#database-setup)
15. [Testing](#testing)
16. [Additional Documentation](#additional-documentation)
17. [Current Notes and Future Direction](#current-notes-and-future-direction)
18. [Author](#author)

## Overview

CampusCare supports students academically, emotionally, and practically inside the faculty. The platform gives students a safer place to request help, share skills, track exam stress, record weekly mood, and report lost or found items. It also provides dashboard insights for a clearer view of student activity and campus needs.

The project is built as a professional full-stack application with a React frontend, Node/Express backend, PostgreSQL database, JWT authentication, and a layered backend architecture.

## Project Goal

| Goal | Description |
| --- | --- |
| Safer student support | Allow students to ask for help anonymously when they feel uncomfortable asking publicly. |
| Better collaboration | Help students and mentors respond to academic, technical, and project-related requests. |
| Better visibility of student skills | Make it easier to discover students with skills such as React, SQL, C#, GitHub, or presentation. |
| Stress and mood awareness | Track stress levels and weekly emotional states to understand wellbeing patterns. |
| Organized lost & found reporting | Centralize lost and found items inside the faculty. |
| More useful dashboard insights | Show meaningful statistics about support requests, skills, stress, mood, and lost/found reports. |

## Current Project State

The project currently includes:

- Working full-stack project structure.
- Connected React frontend.
- Node.js and Express.js backend.
- PostgreSQL database schema.
- JWT authentication with bcrypt password hashing.
- Working module APIs.
- Working frontend forms and pages.
- Successful root build with frontend and backend.

## Main Users

| User | Description |
| --- | --- |
| Student | Registers, logs in, creates help requests, adds skills, records stress and mood, and reports lost/found items. |
| Mentor | Logs in, views student activity, replies to help requests, and supports students academically or technically. |
| Admin | Manages the platform at a higher level and can view broader dashboard information. |

## Core Functionalities

| Functionality | Description |
| --- | --- |
| Authentication | Student, mentor, and admin login/register using JWT authentication. |
| Silent Help | Students can create anonymous or named help requests and receive replies. |
| SkillMap | Students can add skills, attach skills to their profile, and search student skill cards. |
| ExamStress Tracker | Students record stress levels from 1 to 5 and view summaries. |
| MoodCampus | Students record weekly mood states such as motivated, tired, stressed, calm, or overwhelmed. |
| Lost & Found | Students report lost or found items with title, description, location, type, date, and status. |
| Dashboard Statistics | Displays useful statistics and recent activity from the platform. |
| Role-based access | Protected routes and backend middleware support student, mentor, and admin roles. |
| Onboarding/Profile | Role-specific profile details make student, mentor, and admin experiences more useful. |

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- pg
- JWT
- bcrypt
- dotenv
- cors

### Frontend

- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS and project CSS utilities

### Development Tools

- VS Code
- Git & GitHub
- Postman
- pgAdmin
- Codex

## Project Structure

```text
CampusCare/
  README.md
  package.json
  package-lock.json
  .gitignore
  docs/
    api-overview.md
    testing-checklist.md

  backend/
    package.json
    tsconfig.json
    .env.example
    src/
      app.ts
      server.ts
      config/
        database.ts
        env.ts
      controllers/
        auth.controller.ts
        dashboard.controller.ts
        helpRequest.controller.ts
        lostFound.controller.ts
        mood.controller.ts
        profile.controller.ts
        skill.controller.ts
        stress.controller.ts
      database/
        001_init_users.sql
        002_init_modules.sql
        003_seed_demo_data.sql
        004_user_profiles_and_engagement.sql
      middleware/
        authenticate.ts
        authorizeRoles.ts
        errorHandler.ts
        notFoundHandler.ts
      repositories/
        auth.repository.ts
        dashboard.repository.ts
        helpRequest.repository.ts
        lostFound.repository.ts
        mood.repository.ts
        profile.repository.ts
        skill.repository.ts
        stress.repository.ts
        user.repository.ts
      routes/
        auth.routes.ts
        dashboard.routes.ts
        helpRequest.routes.ts
        index.ts
        lostFound.routes.ts
        mood.routes.ts
        profile.routes.ts
        skill.routes.ts
        stress.routes.ts
      services/
        auth.service.ts
        dashboard.service.ts
        helpRequest.service.ts
        lostFound.service.ts
        mood.service.ts
        profile.service.ts
        skill.service.ts
        stress.service.ts
      types/
        auth.ts
        express.d.ts
        helpRequest.ts
        lostFound.ts
        mood.ts
        profile.ts
        roles.ts
        skill.ts
        stress.ts
        user.ts
      utils/
        apiResponse.ts
        asyncHandler.ts
        httpError.ts
        moduleValidation.ts
        password.ts
        token.ts
        validation.ts

  frontend/
    package.json
    tsconfig.json
    vite.config.ts
    tailwind.config.ts
    postcss.config.js
    .env.example
    src/
      App.tsx
      main.tsx
      vite-env.d.ts
      assets/
      components/
        common/
        layout/
      context/
        AuthContext.tsx
      pages/
        DashboardPage.tsx
        HelpRequestsPage.tsx
        LandingPage.tsx
        LoginPage.tsx
        LostFoundPage.tsx
        MoodCampusPage.tsx
        OnboardingPage.tsx
        ProfilePage.tsx
        RegisterPage.tsx
        SkillMapPage.tsx
        StressTrackerPage.tsx
      routes/
        AppRoutes.tsx
        ProtectedRoute.tsx
      services/
        apiClient.ts
        authService.ts
        dashboardService.ts
        helpRequestService.ts
        lostFoundService.ts
        moodService.ts
        profileService.ts
        skillService.ts
        stressService.ts
      styles/
        index.css
      types/
      utils/
        formatDate.ts
```

## Backend Architecture

Backend flow:

```text
Request -> Route -> Controller -> Service -> Repository -> PostgreSQL
```

| Layer | Responsibility |
| --- | --- |
| Route | Defines API endpoints and attaches middleware. |
| Controller | Receives HTTP requests and returns consistent API responses. |
| Service | Handles business logic, validation, permissions, and workflow decisions. |
| Repository | Handles PostgreSQL queries with parameterized SQL. |
| Middleware | Handles authentication, authorization, errors, and not-found routes. |
| Utils | Shared helpers for responses, JWT, password hashing, errors, and validation. |

## Frontend Structure

| Folder | Purpose |
| --- | --- |
| pages | Main route pages such as Dashboard, Silent Help, SkillMap, ExamStress, MoodCampus, Lost & Found, and Profile. |
| routes | React Router configuration and protected route handling. |
| services | Axios API clients for backend endpoints. |
| context | Authentication state, token storage, and current user refresh logic. |
| types | TypeScript types for auth, dashboard, modules, roles, and API data. |
| utils | Shared frontend helpers such as date formatting. |
| styles | Tailwind CSS imports and shared UI utility classes. |
| components | Reusable UI and layout components. |

## Main Modules

| Module | Purpose |
| --- | --- |
| Silent Help | Anonymous or named academic and technical support requests with replies. |
| SkillMap | Student skill catalog, personal skill profiles, and skill-based student search. |
| ExamStress Tracker | Stress level records and summaries by subject. |
| MoodCampus | Weekly mood tracking and mood counts. |
| Lost & Found | Lost/found item reporting and status management. |
| Dashboard | Statistics and recent activity for platform insight. |
| Authentication/Profile | Login, registration, current user session, logout, and profile information. |

## API Endpoints

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Help Requests

```text
GET   /api/help-requests
GET   /api/help-requests/:id
POST  /api/help-requests
POST  /api/help-requests/:id/replies
PATCH /api/help-requests/:id/status
```

### Skills

```text
GET    /api/skills
POST   /api/skills
GET    /api/skills/students
GET    /api/skills/my-skills
POST   /api/skills/my-skills
DELETE /api/skills/my-skills/:skillId
```

### Stress

```text
GET  /api/stress
POST /api/stress
GET  /api/stress/summary
```

### Mood

```text
GET  /api/mood
POST /api/mood
GET  /api/mood/summary
```

### Lost & Found

```text
GET   /api/lost-found
GET   /api/lost-found/:id
POST  /api/lost-found
PATCH /api/lost-found/:id/status
```

### Dashboard

```text
GET /api/dashboard/stats
```

### Profile

```text
GET   /api/profile
PATCH /api/profile
POST  /api/profile/onboarding
```

### Health

```text
GET /api/health
```

## How to Run the Project

1. Clone the repository:

```bash
git clone <repository-url>
cd CampusCare
```

2. Install dependencies:

```bash
npm install
```

3. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

4. Create a PostgreSQL database named `campuscare`.

5. Run migrations:

```bash
psql -U username -d campuscare -f backend/src/database/001_init_users.sql
psql -U username -d campuscare -f backend/src/database/002_init_modules.sql
psql -U username -d campuscare -f backend/src/database/004_user_profiles_and_engagement.sql
```

6. Optionally run demo seed data:

```bash
psql -U username -d campuscare -f backend/src/database/003_seed_demo_data.sql
```

7. Start the backend:

```bash
npm run dev:backend
```

8. Start the frontend:

```bash
npm run dev:frontend
```

Default URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api
Health:   http://localhost:5000/api/health
```

## Environment Variables

### Backend

Defined in `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/campuscare
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

| Variable | Purpose |
| --- | --- |
| PORT | Backend server port. |
| NODE_ENV | Runtime environment, usually `development` locally. |
| DATABASE_URL | PostgreSQL connection string. |
| JWT_SECRET | Secret used to sign JWT tokens. |
| JWT_EXPIRES_IN | Token expiration time. |
| CLIENT_URL | Frontend origin allowed by CORS. |

### Frontend

Defined in `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`.env` files must not be pushed to GitHub. They may contain local database URLs or secrets.

## Database Setup

1. Create the database:

```sql
CREATE DATABASE campuscare;
```

2. Run the migrations in order:

```bash
psql -U username -d campuscare -f backend/src/database/001_init_users.sql
psql -U username -d campuscare -f backend/src/database/002_init_modules.sql
psql -U username -d campuscare -f backend/src/database/004_user_profiles_and_engagement.sql
```

3. Optional demo data:

```bash
psql -U username -d campuscare -f backend/src/database/003_seed_demo_data.sql
```

The same SQL files can also be opened and executed through pgAdmin Query Tool.

Seeded demo users use the demo-only password:

```text
CampusCare123
```

Seeded accounts:

```text
flutura.student@campuscare.test
mentor@campuscare.test
admin@campuscare.test
```

Use these accounts to review role-aware data visibility:

- Student login shows Flutura Hyseni's personal stress, mood, skills, help requests, and lost/found records.
- Mentor login shows broader help requests, SkillMap data, stress summaries, and mood summaries.
- Admin login shows global dashboard statistics and management actions.

## Testing

Run a full project build:

```bash
npm run build
```

Recommended manual checks:

- Use `GET /api/health` to confirm the API and database status.
- Use Postman to test auth and module endpoints.
- Register/login through the frontend.
- Create a help request, skill, stress record, mood record, and lost/found item.
- Return to the dashboard and confirm statistics update.
- Use `docs/testing-checklist.md` for the final QA checklist.

## Additional Documentation

- `docs/testing-checklist.md` contains the final setup, backend, frontend, role, UI, and build checklist.
- `docs/api-overview.md` provides a concise overview of the main API groups.

## Current Notes and Future Direction

Future improvements may include:

- Richer UI polish.
- Stronger admin dashboard.
- Mentor workflow improvements.
- Notifications.
- Deployment.
- Improved analytics.
- Accessibility improvements.
- Mobile responsiveness improvements.

## Author

Flutura Hyseni  
Software Engineering Student  
University of Mitrovica "Isa Boletini"  
Faculty of Computer Science and Engineering
