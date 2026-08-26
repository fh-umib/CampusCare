# CampusCare Role Permission Matrix

Status is based on backend code inspection on 2026-07-17. “Global” means all rows, not assigned/consented rows.

| Resource | Action | Student | Mentor | Admin | Current status / missing enforcement |
|---|---|---|---|---|---|
| Auth | Public registration | Own student account | Own mentor account | Denied | Enforced; admin role is rejected. Mentor self-registration is currently public. |
| Auth | Login/current user | Own account | Own account | Only hard-coded approved email | Enforced in service and database-backed `/me`. No rate limit, lockout, MFA, or revocation. |
| Profile | Read/update | Own | Own | Own | Enforced by token-derived user ID; no endpoint for another user's profile. Empty bodies now rejected. |
| Dashboard | View statistics | Own-scoped | Global | Global | Backend-enforced scope, but global mentor visibility is broader than an assignment model. User count and skill count remain global in repository aggregates. |
| Help requests | List/read | Global/public | Global/public | Global/public | Missing authentication and audience policy. Anonymous name masking exists, but IDs, text, and replies remain exposed. |
| Help requests | Create | Own | Allowed | Allowed | Authentication and owner attribution enforced; role restriction is missing if creation should be student-only. |
| Help replies | Create | Any request | Any request | Any request | Authentication only. Ownership/mentor-assignment and role policy are missing. |
| Help requests | Change status | Denied | Global | Global | Backend route role check enforced. Mentor assignment is missing. |
| Stress | Create | Own | Own | Own | Owner attribution enforced; role restriction absent if check-ins are student-only. |
| Stress | List/summary | Own | Global raw records | Global raw records | Backend scope enforced. Consent, assignment, minimization, and privacy-safe aggregation are missing. |
| Mood | Create | Own | Own | Own | Owner attribution enforced; role restriction absent if check-ins are student-only. |
| Mood | List/summary | Own | Global raw records | Global raw records | Same privacy gap as stress. |
| Skills catalog | List/student cards | Public | Public | Public | No authentication. Student names, roles, and skills are exposed; audience decision required. |
| Skills catalog | Create | Allowed | Allowed | Allowed | Authentication only; curation/admin policy is missing. |
| My skills | Attach/list/remove | Own | Own | Own | Ownership enforced from current user ID; UUID input now validated. |
| Lost & found | List/read | Public/global | Public/global | Public/global | Public access may be intentional, but reporter names/content need a privacy decision. |
| Lost & found | Create | Own | Own | Own | Authentication and owner attribution enforced. |
| Lost & found | Change status | Own report | Own report | Global | Service ownership/admin override enforced. |
| Notifications | List/read | Own + student-role | Own + mentor-role | Own + admin-role | Visibility enforced in SQL. Role broadcasts use per-user read records. |
| Platform/admin settings | Manage | No endpoint | No endpoint | No endpoint | Not implemented; frontend workspace does not create backend authority. |
| AI Study Assistant | Conversations/messages | Own only | Denied | Denied | Backend authentication, exact student role, UUID ownership checks, and soft archive are enforced. Admin analytics receive aggregate usage only. |

## Priority policy decisions

Before expanding permissions, define whether mentor accounts require approval, how students are assigned to mentors, which wellbeing fields mentors need, whether consent is required, and which catalog content is genuinely public. Add integration tests for every approved rule before changing current behavior.
