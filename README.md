# CampusCare

CampusCare is a full-stack student platform for anonymous help requests, student skill discovery, exam stress tracking, weekly mood check-ins, and lost/found item reports inside a faculty.

## Project Structure

```text
CampusCare/
  frontend/   React + TypeScript + Vite client application
  backend/    Node.js + Express + TypeScript API application
```

## Planned Modules

- Silent Help: anonymous academic and technical help requests.
- SkillMap: student skill profiles and skill-based search.
- ExamStress Tracker: stress records for exam weeks and subjects.
- MoodCampus: weekly mood records.
- Lost & Found: lost/found item reports inside the faculty.

## Roles

- student
- mentor
- admin

## Getting Started

Phase 1 only creates the professional folder and file structure. Dependencies are declared but not installed.

```bash
npm install
npm install --workspace frontend
npm install --workspace backend
```

Copy environment examples before running future phases:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Next Phase

Phase 2 should implement authentication foundations:

- PostgreSQL connection setup.
- User model/table and migrations.
- Registration and login endpoints.
- bcrypt password hashing.
- JWT creation and verification.
- Auth context and protected routes on the frontend.

