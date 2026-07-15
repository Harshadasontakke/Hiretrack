# Contributing to HireTrack

Thanks for considering a contribution. This project follows a small, predictable
workflow so changes stay easy to review.

## Local setup

Follow the [Quick Start](./README.md#quick-start) in the README to get the app
running locally with a seeded database before making changes.

## Branching

- Branch off `main`: `git checkout -b feat/short-description` or `fix/short-description`.
- Never commit directly to `main`.
- Rebase on `main` before opening a PR so conflicts are resolved on your branch,
  not in the merge queue.

## Commit style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pipeline stage drag-and-drop
fix: prevent duplicate applications for the same job + candidate
docs: document the auth flow in architecture.md
refactor: extract job status badge into a shared component
chore: bump prisma to 5.21
```

Keep commits small and scoped to one logical change — the history should read
as a story of how the project was built, not a single squashed dump.

## Before opening a PR

Run these locally and make sure they're clean:

```bash
npm run lint
npx tsc --noEmit
npm run test        # if tests are configured
npm run build        # catches SSR/build-time errors `dev` won't
```

## Pull requests

- Use the PR template — describe **what changed and why**, not just what.
- Link any related issue.
- Keep PRs focused on one feature or fix; large unrelated changes should be
  split into separate PRs.
- A reviewer should be able to understand your intent without reading every
  line of the diff first.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/`. Include steps to
reproduce, expected vs. actual behavior, and environment details for bugs.
