# Case Study: HireTrack

## Problem

Small teams that hire without an ATS run pipelines out of spreadsheets and
email threads. Candidates fall through the cracks, stage status lives in
someone's head, and there's no single place to see "who's in the loop for
this role right now." HireTrack solves this for small teams and recruiters
who need a lightweight, self-hosted applicant tracker without the overhead
(or cost) of an enterprise ATS.

## Approach

- **Data model first.** Before writing any UI, the Job → Application ←
  Candidate relationship was modeled explicitly, with `Application` as the
  join entity carrying pipeline `stage` — this is what lets one candidate
  apply to multiple jobs without duplicating their profile. See
  [`docs/architecture.md`](./architecture.md) for the full ERD.
- **Auth before features.** Credentials-based auth with Auth.js was wired end
  to end (signup → hashed password → session → middleware-protected routes)
  before any job/candidate CRUD, so every subsequent feature was built
  against a real logged-in user rather than bolted on later.
- **Kanban pipeline as the core interaction.** The job detail page's pipeline
  board is the feature recruiters will touch most, so it got the most design
  attention: clear stage columns, one-click stage moves, and a visible
  applicant count per job.
- **Trade-offs accepted for trial scope:** JWT sessions (not DB sessions) for
  simpler serverless deployment; Credentials-only auth with OAuth structured
  as an easy add-on later; no email notifications yet. Each is documented in
  `architecture.md` with what would change at real production scale.

## Result

- A working ATS: authenticated recruiters can create jobs, add candidates,
  and move them through Applied → Screening → Interview → Offer →
  Hired/Rejected.
- A cross-job applicants table for a bird's-eye view of everyone in the
  pipeline, regardless of role.
- Deployed to Vercel with a managed Postgres database; see the README for the
  live URL and demo login.

**What I'd build next:** OAuth login (Google/GitHub), email notifications on
stage changes, resume file upload instead of a URL field, interview
scheduling with calendar integration, and role-based permissions
(admin vs. recruiter) enforced beyond the schema's `Role` enum.

## What I learned

Modeling the join entity (`Application`) as a first-class citizen — rather
than treating "candidate applies to job" as a simple many-to-many — is what
made the pipeline stage, interview notes, and per-application history
possible without schema churn later. The cost of getting that right up front
was a slower first day; the payoff was zero migrations to the core shape
since.
