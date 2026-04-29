# Contributing Guide

## Branch and PR Conventions
- Branch naming: `codex/<phase-or-feature>-<short-description>`.
- Keep PRs focused: one concern per PR.
- Use stacked PRs for multi-stage initiatives when dependencies are explicit.
- Use `.github/pull_request_template.md` and complete all sections.

## Required Local Checks Before Opening a PR
- `npm --prefix gui-dashboard-frontend-main run lint`
- `npm --prefix gui-dashboard-frontend-main run build`
- `npm --prefix gui-dashboard-backend-feature-langfuse run lint:check`
- `npm --prefix gui-dashboard-backend-feature-langfuse run test -- --runInBand`
- `npm --prefix gui-dashboard-backend-feature-langfuse run build`

## Definition of Done for Production Changes
- Code paths include explicit error handling.
- Runtime/config changes are documented in README or env template.
- Logging is actionable for failure diagnosis.
- CI passes with required gates.
- PR includes risk and rollback notes.

## Environment Baselines
- Root stack defaults: `.env.example`
- Backend development defaults: `gui-dashboard-backend-feature-langfuse/.env.example`
- Frontend development defaults: `gui-dashboard-frontend-main/.env.example`

## Stacked PR Procedure
- Use `docs/STACKED_PR_WORKFLOW.md` for branch/merge order and review constraints.
