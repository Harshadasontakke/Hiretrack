# HireTrack

[![CI](https://github.com/YOUR_USERNAME/hiretrack/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/hiretrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> A simple, self-hosted applicant tracking system - post jobs, add candidates, and move them through a Kanban-style hiring pipeline.

A simple applicant tracking system built with Next.js (App Router), TypeScript, Prisma, PostgreSQL, Auth.js, and Tailwind CSS.

**Live demo:** _add your deployed URL here once live_
**Demo login:** `admin@hiretrack.dev` / `password123` (created by the seed script)

Built as part of the Digital Heroes Full Stack Developer trial.

## Features

- Credentials-based auth (Auth.js + Prisma adapter)
- Create and manage job postings
- Add applicants to a job and move them through a Kanban-style pipeline (Applied → Screening → Interview → Offer → Hired / Rejected)
- Cross-job applicants overview table

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Generate a secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. Push the schema to your database and generate the Prisma client:
   ```bash
   npx prisma migrate dev --name init
   ```

4. (Optional) Seed demo data:
   ```bash
   npm run prisma:seed
   ```
   This creates `admin@hiretrack.dev` / `password123` plus a sample job and applicant.

5. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Project structure

```
src/
  app/
    (dashboard)/
      jobs/            Jobs list, job detail + pipeline board
      applicants/       Cross-job applicants table
    api/
      auth/[...nextauth] Auth.js route
      jobs/              Jobs CRUD
      applicants/        Applications CRUD (candidate creation + stage moves)
      register/          User registration
    login/               Login page
  lib/
    auth.ts             Auth.js config
    prisma.ts           Prisma client singleton
  components/
    Nav.tsx             Shared nav bar
prisma/
  schema.prisma         Data model
  seed.ts                Demo data seed script
```

## Notes

- There's no public sign-up page wired up yet — use the `/api/register` endpoint (or a quick script) to create your first user, or run the seed script.
- The middleware protects `/jobs`, `/applicants`, and `/dashboard` routes; unauthenticated users are redirected to `/login`.
- To add OAuth providers (Google, GitHub, etc.) to Auth.js, extend the `providers` array in `src/lib/auth.ts`.

## Environment variables

| Variable | Description |
| --- | --- |
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_SECRET | Session signing secret (openssl rand -base64 32) |
| NEXTAUTH_URL | Base URL of the app (e.g. http://localhost:3000 or your prod domain) |
| NEXT_PUBLIC_SITE_URL | Public site URL used for OG tags, sitemap, and robots.txt |

## Testing

```bash
npm run lint          # ESLint
npx tsc --noEmit      # Type check
npm run build          # Production build (catches SSR issues dev won't)
```

CI runs lint, typecheck, and build against a throwaway Postgres service on
every push and pull request - see .github/workflows/ci.yml.

## Deployment (Vercel)

1. Push this repo to GitHub and import it at vercel.com - it auto-detects Next.js.
2. Add every variable from .env.example under Settings -> Environment Variables.
3. Provision Postgres (Vercel Postgres, Neon, or Supabase) and set DATABASE_URL.
4. Run npx prisma migrate deploy against the production database (a one-off command or a postinstall hook).
5. Every push to main auto-deploys; every PR gets its own preview URL.

## Documentation

- docs/architecture.md - data model (ERD), auth flow, and key trade-offs.
- docs/api.md - endpoint reference (method, input, output, auth).
- docs/case-study.md - problem, approach, result, and what I'd build next.
- CHANGELOG.md - version history.
- CONTRIBUTING.md - local setup, branching, and commit conventions.

## License

MIT - see LICENSE.
