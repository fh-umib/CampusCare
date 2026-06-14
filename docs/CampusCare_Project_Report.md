# CampusCare – Student Support Platform

## 1. Introduction

CampusCare is a full-stack student support platform created for university environments. It brings academic, emotional, and practical support into one role-aware digital system.

Students can ask for help, track exam stress, reflect on mood, share academic skills, and report lost or found items. Mentors and administrators use separate workspaces suited to their support and management responsibilities.

## 2. Problem Statement

University students often need support but may not know where to ask, who can help, or how to express a concern safely. Information about academic questions, wellbeing, student skills, and campus reports can become scattered across informal communication channels.

This makes support harder to access and limits the ability of mentors and administrators to understand recurring student needs. CampusCare addresses this problem by organizing relevant support activity in one structured platform.

## 3. Project Goal

The main goal of CampusCare is to connect student support services through dedicated Student, Mentor, and Admin workspaces.

| Goal | Description |
| --- | --- |
| Academic support | Students can ask for help through Silent Help. |
| Wellbeing awareness | Students can track stress and mood. |
| Skill visibility | Students can share and confirm academic skills. |
| Campus organization | Lost and found reports are managed in one place. |
| Role-based management | Mentors and admins can review activity based on their role. |

## 4. User Roles

| Role | Purpose |
| --- | --- |
| Student | Uses a personal workspace for support, wellbeing, skills, and campus reports. |
| Mentor | Reviews support requests and student activity signals. |
| Admin | Uses protected access to monitor platform activity and modules. |

Admin registration is restricted. Admin accounts are created manually to prevent unauthorized access to management features.

## 5. Main Functionalities

### Silent Help

Allows students to create support requests in a safe and structured way. Requests may be anonymous, while mentors and admins can review activity and respond according to their permissions.

### ExamStress

Allows students to record subject-based exam stress and review pressure patterns through summaries and recent records.

### MoodCampus

Provides respectful mood check-ins that help students reflect on their wellbeing over time.

### SkillMap

Allows students to add academic skills, make their abilities visible, and complete friendly skill checks after practice.

### Lost & Found

Allows users to report lost or found campus items and organize reports by type, location, date, and status.

### Dashboard

Presents a role-aware overview. Students see personal activity, mentors see support-focused information, and admins see broader platform statistics.

### Profile

Shows account identity, role, profile readiness, skills, and role-specific onboarding information.

### Notifications

Displays personal and role-aware updates through an activity bell in the authenticated application header.

### Forgot Password

Provides a privacy-safe recovery request flow for the current project version without revealing whether an email address exists.

### 404 Page

Shows a branded Not Found page when a user opens an incorrect or unavailable route.

## 6. System Architecture

CampusCare follows a full-stack architecture with a React frontend and a Node.js/Express backend connected to PostgreSQL.

- The **frontend** handles the user interface, routing, responsive layouts, and role-aware pages.
- The **backend** handles API routes, authentication, authorization, validation, and database communication.
- **PostgreSQL** stores users, profiles, and module records.
- **JWT** tokens protect authenticated routes and identify the current user.

The backend uses a layered flow:

```text
Request -> Route -> Controller -> Service -> Repository -> PostgreSQL
```

## 7. Technologies Used

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, custom CSS, React Router DOM, Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, pg |
| Authentication | JWT, bcrypt |
| Testing tools | Postman and manual browser testing |
| Version control | Git and GitHub |

## 8. Database Overview

The PostgreSQL database stores:

- Users and roles
- Role-specific user profiles
- Help requests and replies
- Student skills and skill relationships
- Stress records
- Mood records
- Lost and found reports
- Personal and role-based notifications
- Notification read status

The current forgot-password endpoint acknowledges recovery requests safely but does not yet store or execute production password resets.

## 9. Security and Access Control

- Authentication is required for internal application pages.
- Protected frontend routes and backend middleware enforce access rules.
- Role-aware permissions separate Student, Mentor, and Admin actions.
- Public admin registration is blocked, and admin accounts are created manually.
- Passwords are stored as bcrypt hashes.
- JWT tokens are used for authenticated API access.
- Forgot-password responses do not reveal whether an account exists.
- Notifications are returned only when visible to the authenticated user or role.

## 10. Responsive Design and UI Polish

The CampusCare frontend supports desktop, tablet, and mobile layouts. The final interface includes:

- Responsive internal and public pages
- Desktop sidebar and mobile navigation
- Loading, empty, success, and error states
- Role-aware notification dropdown
- Branded 404 page
- Consistent CampusCare colors, typography, cards, badges, and controls

## 11. Testing Summary

Testing was completed manually through the frontend, browser checks, API inspection, and production builds.

| Test Area | Status |
| --- | --- |
| Authentication | Tested |
| Role-based access | Tested |
| Student modules | Tested |
| Mentor workspace | Tested |
| Admin access | Tested |
| Notifications | Tested |
| Responsive design | Tested |
| Build process | Tested |

The project build verifies both frontend and backend TypeScript compilation.

## 12. Future Improvements

- Connect password recovery to a real email service.
- Deploy the frontend, backend, and database to production hosting.
- Add more advanced wellbeing and module analytics.
- Expand administrative reports and filtering.
- Strengthen notification automation and preferences.
- Support optional image uploads for lost and found reports.

## 13. Conclusion

CampusCare demonstrates a full-stack, role-aware student support platform that combines academic support, wellbeing tracking, skill sharing, and campus organization in one system. The project shows how a structured digital workspace can make student needs more visible while providing focused tools for students, mentors, and administrators.

## 14. Author

Developed by:

**Flutura Hyseni**

Faculty of Computer Science and Engineering

University of Mitrovica “Isa Boletini”
