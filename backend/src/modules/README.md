# Backend feature boundaries

CampusCare will migrate gradually from the current horizontal layers to feature-owned modules. Existing routes and imports remain unchanged during Phase 2.0.

Planned domains are `auth`, `users`, `notifications`, `helpRequests`, `stress`, `mood`, `skills`, `lostFound`, `analytics`, `auditLogs`, and `ai`. Move one complete vertical slice at a time (route, controller, service, repository, types, and tests), retain a compatibility export at the old path, verify the API contract, then update imports. Shared HTTP middleware, configuration, database access, and small cross-feature utilities remain outside feature folders.

Do not create empty domain folders or a second implementation. New features should begin inside their domain; existing features move only when they are actively changed and covered by tests.
