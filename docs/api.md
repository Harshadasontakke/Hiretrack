# API Reference

All routes live under `src/app/api/**` (Next.js Route Handlers). Except
`register`, every route requires an authenticated session — unauthenticated
requests receive `401`.

## Auth

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| `*` | `/api/auth/[...nextauth]` | Auth.js sign in/out/session/callback routes | — |
| `POST` | `/api/register` | Create a new user (name, email, password) | none required (public signup) |

## Jobs

| Method | Path | Input | Output | Auth |
| --- | --- | --- | --- | --- |
| `GET` | `/api/jobs` | — | `Job[]` with application counts | required |
| `POST` | `/api/jobs` | `{ title, department?, location?, description, status? }` | created `Job` | required |
| `GET` | `/api/jobs/[id]` | — | `Job` with applications + candidates | required |
| `PATCH` | `/api/jobs/[id]` | Partial `Job` fields | updated `Job` | required |
| `DELETE` | `/api/jobs/[id]` | — | `{ success: true }` | required |

## Applicants / Applications

| Method | Path | Input | Output | Auth |
| --- | --- | --- | --- | --- |
| `GET` | `/api/applicants` | — | `Application[]` across all jobs, with candidate + job included | required |
| `POST` | `/api/applicants` | `{ jobId, candidate: { name, email, phone?, resumeUrl? } }` | created `Application` (creates the `Candidate` if the email is new) | required |
| `PATCH` | `/api/applicants/[id]` | `{ stage }` | updated `Application` | required |
| `DELETE` | `/api/applicants/[id]` | — | `{ success: true }` | required |

## Health

| Method | Path | Output | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/health` | `{ status: "ok", timestamp }` — used for uptime checks | none |

## Validation

All request bodies are validated with a shared Zod schema before hitting
Prisma, so the same rules apply whether the request comes from the app's own
forms or an external client. Invalid input returns `400` with a field-level
error list.

## Errors

| Status | Meaning |
| --- | --- |
| `400` | Validation failed — response body includes the Zod error details |
| `401` | No session / not signed in |
| `404` | Resource not found or not owned by an accessible scope |
| `429` | Rate limit exceeded (auth + registration routes) |
| `500` | Unexpected server error — logged server-side with stack trace |
