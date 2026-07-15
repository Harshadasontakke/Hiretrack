# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Applicant detail page (`/applicants/[id]`) with candidate contact info,
  job link, and current pipeline stage.
- Interviews API (`/api/interviews`, `/api/interviews/[id]`) and `InterviewsPanel`
  client component: schedule interviews, record interviewer/feedback/rating,
  and edit or remove them inline.
- Notes API (`/api/notes`, `/api/notes/[id]`) and `NotesPanel` client component:
  an internal feedback thread per application, with author-or-admin-only
  delete permissions.
- `docs/architecture.md` describing the data model, auth flow, and key trade-offs.
- `docs/case-study.md` portfolio write-up (problem, approach, result, learnings).
- `LICENSE` (MIT), `CONTRIBUTING.md`, issue templates, and PR template.
- GitHub Actions CI workflow running lint + typecheck on every push/PR.
- `robots.txt` and `sitemap.xml` generation, and page-level metadata/OG tags for SEO.
- `/api/health` endpoint for uptime checks.

## [1.0.0] - 2026-07-01

### Added
- Credentials-based authentication (Auth.js + Prisma adapter), with session
  protection via middleware on `/jobs`, `/applicants`, and `/dashboard`.
- Job postings: create, list, and view detail with status (Draft/Open/Closed).
- Candidate + Application model with a Kanban-style pipeline
  (Applied → Screening → Interview → Offer → Hired/Rejected).
- Cross-job applicants overview table.
- Prisma schema for User, Account, Session, Job, Candidate, Application,
  Interview, and Note.
- Seed script creating a demo admin user and sample job/applicant.
