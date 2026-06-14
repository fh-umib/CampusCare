# CampusCare – Student Support Platform

CampusCare is a full-stack, role-aware student support platform for university environments. It helps students ask for anonymous help, track exam stress, reflect on mood, share skills, and organize lost and found reports. Mentors and admins use focused workspaces to review support activity, guide students, and monitor platform trends.

---

## Table of Contents

- [Overview](#overview)
- [Project Goal](#project-goal)
- [Current Project State](#current-project-state)
- [Main Users](#main-users)
- [Core Functionalities](#core-functionalities)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Structure](#frontend-structure)
- [Main Modules](#main-modules)
- [How to Run the Project](#how-to-run-the-project)
- [Environment Variables](#environment-variables)
- [Current Notes and Future Direction](#current-notes-and-future-direction)
- [Author](#author)

---

## Overview

CampusCare is designed as a digital faculty support platform where students can access academic, emotional, and practical support in one place.

The system includes:

- A public landing page and role-entry flow
- Authenticated Student, Mentor, and Admin workspaces
- Module-based academic, wellbeing, and campus support
- Role-aware dashboards and notifications

---

## Project Goal

| Goal | Meaning |
| --- | --- |
| Academic support | Students can ask for help safely through Silent Help. |
| Wellbeing reflection | Students can track exam stress and mood patterns. |
| Skill visibility | Students can share and confirm academic skills. |
| Campus organization | Lost and found reports are managed in one place. |
| Role-aware guidance | Mentors and admins can review support activity with better context. |

---

## Current Project State

CampusCare has evolved into a working full-stack application with:

- React and TypeScript frontend
- Node.js and Express backend
- PostgreSQL database
- JWT authentication and role-based access
- Responsive desktop and mobile interface
- Role-aware notifications
- Loading, empty, error, and branded 404 states
- Final frontend polish and mobile navigation improvements

The current version is functional and ready for further testing, documentation, and future deployment preparation.

---

## Main Users

| User Type | Description |
| --- | --- |
| Student | Uses a personal workspace to ask for help, track stress and mood, share skills, and manage reports. |
| Mentor | Reviews student support needs and follows guidance-related activity. |
| Admin | Uses protected access to monitor platform activity, modules, and support trends. |

Admin accounts are created manually. Public admin registration is restricted.

---

## Core Functionalities

| Module / Area | Functionality |
| --- | --- |
| Silent Help | Anonymous academic and support requests with replies and status tracking. |
| ExamStress | Exam pressure and subject-based stress tracking. |
| MoodCampus | Mood reflection and wellbeing pattern tracking. |
| SkillMap | Student skill sharing and friendly skill checks. |
| Lost & Found | Campus item reporting and status organization. |
| Dashboard | Role-aware overview for Student, Mentor, and Admin users. |
| Profile | User identity, onboarding readiness, skills, and role details. |
| Notifications | Activity bell with personal and role-aware updates. |
| Forgot Password | Safe recovery-request flow for the current project version. |
| 404 Page | Branded Not Found page for unavailable routes. |

---

## Tech Stack

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Backend runtime |
| Express.js | API and server structure |
| TypeScript | Strong typing |
| PostgreSQL | Main database |
| pg | PostgreSQL connection |
| JWT | Authentication |
| bcrypt | Password hashing |
| dotenv | Environment configuration |
| cors | Cross-origin request handling |

### Frontend

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Frontend type safety |
| Vite | Development and build tooling |
| React Router DOM | Public and protected routing |
| Axios | Backend API communication |
| Tailwind CSS and CSS | Custom styling and responsive design |

### Development Tools

| Tool | Usage |
| --- | --- |
| Git and GitHub | Version control |
| VS Code | Development environment |
| Postman | API testing |
| pgAdmin / PostgreSQL tools | Database inspection and testing |

---

## Project Structure

```text
CampusCare/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- database/
|   |   |-- middleware/
|   |   |-- repositories/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- types/
|   |   |-- utils/
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- types/
|   |   |-- utils/
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.ts
|-- docs/
|   |-- api-overview.md
|   `-- testing-checklist.md
|-- .gitignore
|-- package.json
`-- README.md
```

---

## Backend Architecture

The backend follows a layered structure:

```text
Request -> Route -> Controller -> Service -> Repository -> PostgreSQL
```

- **Routes** define API endpoints and attach middleware.
- **Controllers** handle request and response flow.
- **Services** contain reusable business and permission logic.
- **Repositories** communicate with PostgreSQL using parameterized queries.
- **Middleware** protects authenticated and role-restricted routes.
- **JWT** is used for protected access, while admin account creation remains manual.

---

## Frontend Structure

- **Public pages:** Landing, Role Entry, Login, Register, Forgot Password, and Not Found
- **Internal pages:** Dashboard, Silent Help, ExamStress, MoodCampus, SkillMap, Lost & Found, and Profile
- **Shared layout:** Sidebar, topbar, mobile navigation, and notification bell
- **Reusable UI:** Loading, empty, success, and error states
- **Services and context:** Axios API access, authentication state, and typed module data

---

## Main Modules

### Silent Help

Anonymous support-request flow for students, with review and response visibility for mentors and admins.

### ExamStress

Subject-based stress tracking that helps students notice academic pressure patterns.

### MoodCampus

Respectful mood reflection for personal and broader wellbeing awareness.

### SkillMap

Skill-sharing workspace where students add skills and complete friendly skill checks.

### Lost & Found

Campus item reporting and status organization for lost and found belongings.

### Notifications

Personal and role-aware activity updates shown through the internal notification bell.

### Profile

User identity, onboarding information, skills, and role-based readiness details.

---

## How to Run the Project

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Configure PostgreSQL

Create a database named `campuscare`, copy the example environment files, and run the SQL migrations in `backend/src/database/` in numeric order. Demo seed data is optional.

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Default local addresses:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health route: `http://localhost:5000/api/health`

The complete project can be checked from the root with:

```bash
npm run build
```

---

## Environment Variables

The project requires backend and frontend environment files. Real secrets and local `.env` files must not be committed to GitHub.

### Backend example

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/campuscare
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend example

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Use `backend/.env.example` and `frontend/.env.example` as the configuration references.

---

## Current Notes and Future Direction

- The project currently supports its core full-stack workflows.
- Admin accounts are created manually.
- Password recovery can later be connected to a production email service.
- Future work may include deployment, expanded analytics, reporting, and accessibility improvements.

---

## Author

Developed by:

**Flutura Hyseni**

University project:

Faculty of Computer Science and Engineering

University of Mitrovica “Isa Boletini”
