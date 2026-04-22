# Phase 1: Baseline Architecture & Flow Mapping - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

The team has a verified understanding of the current architecture, tech stack usage, and end-to-end data flows.
</domain>

<decisions>
## Implementation Decisions

### Dependency Mapping Approach
- **D-01:** Architecture map must be derived from actual code (imports, modules, runtime flow), not just documentation. Automated static analysis (Knip/dependency-cruiser) should be leveraged.
- **D-02:** Explicitly compare documented architecture vs real implementation and highlight mismatches.

### End-to-End Flow Depth
- **D-03:** The flow map (UI → AI → backend → DB → UI) must trace a real user action through the system end-to-end.
- **D-04:** The map must explicitly document data transformations, state ownership, sync vs async boundaries, and streaming behavior (e.g. SSE / CopilotKit).

### Idiomatic Evaluation Standard
- **D-05:** Evaluation of the tech stack must focus on whether React 19 and NestJS 11 are used idiomatically, identifying where implementation deviates from intended framework design.

### Claude's Discretion
- Formatting and tooling choices for the actual output deliverables (e.g., using Mermaid.js for flowcharts, specific formatting for tables).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` — Project context and core value
- `.planning/ROADMAP.md` — Phase goals and success criteria
- `.planning/REQUIREMENTS.md` — Active requirements (AUDIT-01, AUDIT-03, SYS-01)

### Prior Knowledge
- `.planning/research/SUMMARY.md` — Executive summary of architectural research
- `.planning/research/STACK.md` — Tooling recommendations for AST mapping (Knip, dependency-cruiser)

### Existing Project Documentation
- `.planning/codebase/ARCHITECTURE.md` — Documented architecture to be validated against reality

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Monolith entry point: `gui-dashboard-frontend-main/src/app/page.tsx`
- State context: `gui-dashboard-frontend-main/src/hooks/useDashboard.ts`
- CopilotKit backend proxy: `gui-dashboard-backend-feature-langfuse/src/modules/copilotkit/copilotkit.controller.ts`

### Established Patterns
- High client-side aggregation load using `flatMap` and mapping on render.
- Use of stringified intent parsing instead of native structure (Tool Calling).

### Integration Points
- Frontend (Next.js) ↔ Backend (NestJS API)
- Frontend (CopilotKit React) ↔ Backend (Bifrost Gateway / OpenAI)
- Backend (TypeORM) ↔ PostgreSQL Database

</code_context>

<specifics>
## Specific Ideas

- Focus on tracing a real user action end-to-end.
- Identify what abstractions are used and what they hide (what responsibilities are delegated, what isn't controlled).
- Highlight sync vs async boundaries and identify who owns state at every step.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-baseline-architecture-flow-mapping*
*Context gathered: 2026-04-22*