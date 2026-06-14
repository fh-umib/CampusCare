# CampusCare API Overview

Base URL for local development:

```text
http://localhost:5000/api
```

## Auth

Authentication uses JWT bearer tokens.

- `POST /auth/register` creates a student, mentor, or admin user depending on allowed role input.
- `POST /auth/login` validates credentials and returns a token.
- `GET /auth/me` returns the current authenticated user.

## Silent Help

Used for anonymous or named support requests.

- `GET /help-requests` lists visible help requests with optional filters.
- `GET /help-requests/:id` returns one request and its replies.
- `POST /help-requests` creates a request for the logged-in user.
- `POST /help-requests/:id/replies` adds a reply.
- `PATCH /help-requests/:id/status` updates status for mentor/admin users.

## SkillMap

Used for the shared skill catalog and student skill profiles.

- `GET /skills` lists skills.
- `POST /skills` creates a skill.
- `GET /skills/students` lists student skill cards, optionally filtered by skill.
- `GET /skills/my-skills` returns the logged-in user's skills.
- `POST /skills/my-skills` attaches a skill to the logged-in user.
- `DELETE /skills/my-skills/:skillId` removes a skill from the logged-in user.

## ExamStress Tracker

Used for stress records and summaries.

- `GET /stress` lists records visible to the current role.
- `POST /stress` creates a stress record.
- `GET /stress/summary` returns stress summary data.

## MoodCampus

Used for weekly mood records and mood counts.

- `GET /mood` lists records visible to the current role.
- `POST /mood` creates a mood record.
- `GET /mood/summary` returns mood counts.

## Lost & Found

Used for lost/found item reporting.

- `GET /lost-found` lists items with optional filters.
- `GET /lost-found/:id` returns one item.
- `POST /lost-found` creates an item report.
- `PATCH /lost-found/:id/status` updates item status where the role is allowed.

## Dashboard

- `GET /dashboard/stats` returns role-aware dashboard statistics.

## Notifications

Used for personal and role-scoped activity updates.

- `GET /notifications` returns notifications visible to the authenticated user.
- `PATCH /notifications/:id/read` marks one visible notification as read.
- `PATCH /notifications/read-all` marks all visible notifications as read.

## Profile and Onboarding

Used for role-specific student, mentor, and admin profile context.

- `GET /profile` returns the current user's onboarding profile.
- `PATCH /profile` updates the current user's profile.
- `POST /profile/onboarding` saves onboarding details and marks onboarding complete.

## Health

- `GET /health` returns API and database status.
