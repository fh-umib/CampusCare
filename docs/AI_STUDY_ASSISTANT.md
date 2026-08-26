# AI Study Assistant

## Architecture and purpose

The authenticated student assistant supports question, explain, study-plan, summarize, practice, code-help, and revision modes. React calls `/api/ai`; backend route/controller/service/repository layers enforce role and ownership. `AiProvider` isolates OpenAI-specific code. `OpenAiResponsesProvider` uses the official Node SDK and Responses API with strict JSON-schema output. The configured default is cost-conscious and overridable. [Official OpenAI model guidance](https://developers.openai.com/api/docs/models)

## Environment

Backend-only variables: `OPENAI_API_KEY` (enables provider calls), `OPENAI_MODEL` (default `gpt-5.4-mini`), `AI_DAILY_MESSAGE_LIMIT` (20), `AI_MAX_INPUT_LENGTH` (6000), and `AI_MAX_OUTPUT_TOKENS` (1200). Missing key does not stop CampusCare; provider calls return `AI_ASSISTANT_UNAVAILABLE`. Never give these variables a `VITE_` prefix.

## Schema, privacy, and endpoints

Migration `007_ai_study_assistant.sql` additively creates `ai_conversations`, `ai_messages`, and `ai_usage_daily`. UUID ownership references users; account deletion cascades and user deletion otherwise means soft archive. Message history is stored, so the page displays a first-use privacy notice. API keys, tokens, system prompts, and headers are never stored. Mentor/Admin cannot read conversations; admin analytics receive counts, outcomes, users, and duration only.

- `POST/GET /api/ai/conversations`
- `GET/PATCH/DELETE /api/ai/conversations/:id`
- `POST /api/ai/conversations/:id/messages`

Every route requires JWT authentication and exact student role. Conversation access additionally matches `user_id`. DELETE archives.

## Safety, limits, and failures

Instructions prohibit exam cheating, malicious code, credential requests, medical diagnosis, dangerous instructions, and prompt disclosure. Crisis language receives a deterministic supportive human-help redirect and is not shared with staff. Inputs, mode, title, and UUID are validated. A two-second per-instance burst guard and atomic PostgreSQL daily counter limit use. History, output tokens, SDK timeout, and retry count are bounded. Logs contain metrics and codes, never prompts.

Stable errors include input/length, role, ownership, burst/daily limit, unavailable provider, invalid response, and timeout. Structured-output parse failures never expose raw provider data.

Provider failures log `ai_provider_request_failed` with request ID, HTTP status, provider error type/code, and duration only. A configured but rejected credential maps to `AI_PROVIDER_CONFIGURATION_ERROR`; replace it in the backend environment and fully restart the backend process. Editing `.env` does not reliably refresh an already-running watcher.

## Testing, deployment, and cost control

`npm test --workspace backend` never calls the paid API. It covers validation, crisis/cheating/injection handling, missing-key behavior, existing role/report tests, and PDF generation. An isolated-PostgreSQL integration suite and fixed provider evaluation set remain release gates.

Before deployment: back up or branch Neon; explicitly run migration 007; configure backend variables in Render only; deploy backend then frontend; confirm the actual key is absent from frontend artifacts; test student ownership and privileged-role denial; monitor aggregate failures, latency, and spend. Do not run migrations at app startup.

## Manual verification

1. Run migration 007 on a local database/Neon branch, set a test key, and restart backend.
2. As Student, open `/ai-study-assistant`, create a conversation, use all modes, refresh, reopen history, copy an answer, cancel a request, and archive.
3. Test empty and over-limit input, rapid sending, and daily limit responses.
4. Remove the key: CampusCare must start and AI must return a safe unavailable response.
5. Test crisis, cheating, prompt-disclosure, and credential requests.
6. As Mentor/Admin, confirm UI redirect and API `403`.
7. Confirm admin analytics contain aggregate usage and no content.
8. Test mobile width and confirm no uncaught console errors.
9. Search the frontend build for the actual API key and confirm no match.

Known limitations: burst limiting is process-local; there is no streaming, file upload, rendered Markdown/HTML, feedback dashboard, hard-delete UI, or privileged-role assistant access. Stored-content retention and consent require organizational review before production release.
