# Stacked PR Workflow

This repository uses stacked PRs for multi-stage work that has clear dependencies.

## Naming
- Branches use: `codex/<phase-or-track>-<purpose>`.

## Phase 7 sequence
1. `codex/phase-7-governance`
2. `codex/phase-7-refactor` (branched from governance)
3. `codex/phase-7-hardening` (branched from refactor)

## Rules
- Each PR must be independently reviewable.
- Refactor PRs must stay behavior-preserving.
- Hardening PRs may change runtime behavior, but must include risk + rollback notes.
- Merge order must follow stack order from base to top.
