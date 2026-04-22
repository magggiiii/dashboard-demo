# CopilotKit AI Dashboard – Architecture Audit

## What This Is

A deep architectural audit of a full-stack AI-driven dashboard system (Next.js frontend + NestJS backend). The audit aims to understand the real system implementation—not just the intended design—by uncovering hidden complexity, identifying risks, and surfacing trade-offs to inform a prioritized refactor plan.

## Core Value

Provide a concrete, evidence-backed architectural audit of the real system to guide actionable refactoring and scaling decisions.

## Requirements

### Validated

- ✓ Next.js 16 / React 19 frontend with Tailwind CSS
- ✓ NestJS 11 backend with TypeORM + PostgreSQL
- ✓ AI-driven Generative UI using CopilotKit
- ✓ LLM access via OpenAI SDK (Bifrost gateway)
- ✓ Authentication via JWT + Passport (Google/GitHub)
- ✓ File storage via AWS S3
- ✓ Observability via Langfuse

### Active

- [ ] Identify the actual tech stack used (from code)
- [ ] Identify what is abstracted away by frameworks and services
- [ ] Map the real end-to-end system flow (UI → AI → backend → DB → UI)
- [ ] Compare implementation vs documented architecture
- [ ] Surface architectural decisions and trade-offs (explicit or implicit)
- [ ] Identify risks, bottlenecks, and fragile areas
- [ ] Highlight hidden complexity and tight coupling
- [ ] Provide a prioritized refactor/improvement plan (quick wins, medium fixes, structural fixes)

### Out of Scope

- [Generic explanations] — Must focus on real-world engineering implications.
- [Assuming documentation is correct] — Must verify against actual code implementation.
- [Breadth over depth] — Must prioritize deep technical analysis over high-level summaries.

## Context

- The system is a full-stack monorepo utilizing AI-driven Generative UI.
- The AI interacts with the UI via CopilotKit runtime, which currently introduces complexity and coupling, notably a monolithic frontend file (`page.tsx`) relying on fragile regex parsing of AI intent.
- Existing codebase maps (`ARCHITECTURE.md`, `STACK.md`, `CONCERNS.md`) highlight significant technical debt, including type safety issues, tight coupling, and performance bottlenecks on the client side.

## Constraints

- **Evidence-backed**: All findings must reference actual files, imports, or code patterns.
- **Concrete insights**: Call out uncertainty explicitly instead of guessing.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Focus heavily on the UI ↔ AI bridge | `page.tsx` contains fragile regex parsing for AI updates which is a massive risk. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after initialization*