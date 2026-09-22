# Security and Audit

## Role permission model

- Students can access their own profile, wellbeing records, skills, AI sessions, support requests, and support conversations.
- Mentors can access the support queue and conversations they are authorized to claim or have been assigned. Anonymous students remain labelled `Anonymous Student`.
- Admins can access platform analytics, reports, operational data, and audit logs. Admins do not receive access to private Silent Help message content through the audit system.
- Authorization is enforced by backend middleware and ownership-aware repositories; hiding a frontend route is only a usability measure.

Public Lost & Found browsing remains intentional. Creating and changing reports requires authentication, and only the owner or an admin can change status. SkillMap now requires authentication. Raw stress and mood records are owner-only; existing mentor/admin summaries remain aggregate.

## Admin two-factor authentication

Two-factor authentication is available only to Admin accounts. Setup creates a random authenticator secret, stores it encrypted with AES-256-GCM using key material derived from the server JWT secret, and returns a QR code and manual key once for enrollment. The secret becomes active only after a valid six-digit code is verified.

For enabled accounts, a valid password returns a five-minute, purpose-scoped challenge token—not a normal session. A valid authenticator code is required before the backend issues the normal JWT. Challenge tokens are rejected by REST and Socket.IO authentication middleware. Disabling 2FA requires a current code.

The JWT secret must be strong and stable because it also protects stored authenticator secrets. Rotating it requires admins to enroll again. Recovery codes are intentionally deferred.

## Audit logging policy

The additive `009_security_and_audit.sql` migration creates `audit_logs` and adds Admin 2FA columns. Meaningful events include sign-ins, Admin 2FA changes, profile updates, Silent Help lifecycle actions, Lost & Found changes, wellbeing check-ins, SkillMap additions, Admin analytics views, and AI provider attempts/unavailability.

Audit metadata is allowlisted to simple values and removes fields whose names indicate passwords, tokens, secrets, messages, prompts, or email addresses. Passwords, JWTs, API keys, authenticator secrets, private chat messages, AI prompts/responses, and sensitive profile details are deliberately not logged.

Admins can filter audit logs by exact action, role, and date range with server pagination. Other roles receive HTTP 403. Personal Profile activity queries are always scoped to the authenticated actor and omit internal entity IDs from the UI.

## Testing and privacy

Run backend lint/build/tests and frontend lint/build before release. Manually verify setup and login with an authenticator app, direct URL denial for non-admin users, anonymous support labels, and mobile layouts at 320, 375, and 430 pixels.

Known limitations: recovery codes and trusted devices are not included; IP/user-agent capture is supported by the schema but is not enabled until a reviewed proxy/privacy policy exists. Audit records are application-level and are not a cryptographically immutable ledger.
