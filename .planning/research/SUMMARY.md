# Project Research Summary

**Project:** CopilotKit AI Dashboard Audit
**Domain:** Architectural Audit and Refactoring Plan (AI-driven Dashboards)
**Researched:** May 2025
**Confidence:** HIGH

## Executive Summary

The CopilotKit AI Dashboard is a client-server monorepo that utilizes a Next.js App Router frontend, a NestJS backend, and CopilotKit for its generative UI capabilities. Currently, the architecture suffers from significant critical anti-patterns. Specifically, a monolithic frontend `page.tsx` relies on fragile regex parsing of raw AI text streams to trigger state changes, bypassing CopilotKit's native, structured `useCopilotAction` feature. The goal of this audit and refactoring project is to systematically map dependencies, resolve state desynchronization, and transition the app from raw text parsing to stable, structured AI tool calls.

The recommended approach relies heavily on exact AST-based dependency mapping (Knip, Dependency-Cruiser) and backend telemetry (Langfuse, @nestjs/devtools-integration) to establish truth, avoiding "blind" AI-generated architecture mapping. The strategy proposes a phased refactoring roadmap, prioritizing the stabilization of the UI ↔ AI bridge before tearing down monolithic React components.

Key risks include breaking the connection between AI intent and the UI layout, and bleeding context across multi-tenant sessions due to missing dependency arrays or unvalidated session scopes. These are mitigated by deploying strict Zod schema validation for AI actions, establishing rigid architectural boundaries using specialized linters, and ensuring correct `useCopilotReadable` usage.

## Key Findings

### Recommended Stack

The recommended stack leans into concrete code dependency mappers, linting rules, and visualization tools to provide actionable audit data. 

**Core technologies:**
- **Knip:** Dead code analysis — identifies unused hooks/components before refactoring `page.tsx`.
- **Dependency-Cruiser:** Dependency graphing — uncovers tight coupling and validates boundaries across the Next.js and NestJS monorepo.
- **@next/bundle-analyzer:** Client bundle visualization — measures bloat introduced by CopilotKit runtime and UI components.
- **Langfuse:** LLM Trace & Observability — traces exactly how the monolithic setup prompts the LLM.

### Expected Features

**Must have (table stakes):**
- Current State Architecture Mapping — essential to understand actual system dependencies.
- Dependency & Coupling Analysis — needed to tackle the monolithic "Big Ball of Mud".
- Risk & Vulnerability Log — highlights single points of failure.
- Tech Stack Evaluation — validates idiomatic usage of React 19 and NestJS 11.

**Should have (competitive):**
- UI ↔ AI Bridge Analysis — specific to generative UI and CopilotKit integration.
- AI Intent Parsing Assessment — focuses on shifting from regex-based extraction to structured alternatives.
- Evidence-Backed Refactoring Roadmap — actionable, prioritized guide pointing to specific code lines.

**Defer (v2+):**
- LLM Gateway Performance Check — secondary to resolving the structural coupling in the frontend.

### Architecture Approach

The application utilizes a Client-Server architecture but with significant deviations from ideal CopilotKit patterns, specifically concerning component overloading.

**Major components:**
1. **Frontend UI App (`page.tsx`)** — Renders views and acts as a God object handling layout, file data loading, auto-saves, and fragile AI tag parsing.
2. **Frontend State Layer (`useDashboard.ts`)** — Exposes schemas to the AI (`useCopilotReadable`) and handles complex data aggregation.
3. **Backend Copilot Runtime (`CopilotkitController`)** — Proxies CopilotKit requests to the Bifrost Gateway and handles Langfuse tracing.
4. **Backend REST API** — Manages business logic, JWT authentication, and file/configuration persistence in PostgreSQL/S3.

### Critical Pitfalls

1. **Ad-Hoc/Regex Parsing of AI Intent** — Relying on brittle string parsing of AI output in `page.tsx` causes unpredictable UI breaks. **Avoid by:** exclusively using native `useCopilotAction` handlers to process structured JSON from the LLM.
2. **State Desync and Tenant Bleed** — Sharing AI context across user sessions or acting on stale UI state. **Avoid by:** binding `useCopilotReadable` with exhaustive dependency arrays and strictly validating session scopes on the backend CopilotRuntime.
3. **Strict Event Ordering Assumptions** — Advanced agents breaking CopilotKit's serial event protocol expectations. **Avoid by:** ensuring the backend proxy sequences streaming events correctly before dispatching them.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Decouple & Stabilize AI Bridge
**Rationale:** The brittle regex tag parsing is the most critical risk factor and must be resolved before broad structural changes.
**Delivers:** A stable UI connection leveraging native CopilotKit structure outputs.
**Addresses:** UI ↔ AI Bridge Analysis, AI Intent Parsing Assessment.
**Avoids:** Ad-Hoc/Regex Parsing of AI Intent.

### Phase 2: State & Component Decomposition
**Rationale:** Once the AI bridge is stable, the monolithic `page.tsx` and overloaded state hooks can be safely refactored without breaking generative UI interactions.
**Delivers:** Granular React components (Layout, DataLayer, AILayer) and separated state hooks.
**Uses:** Knip, Dependency-Cruiser, eslint-plugin-boundaries.
**Implements:** Frontend UI App, Frontend State Layer.

### Phase 3: Backend & Data Flow Optimization
**Rationale:** Follows frontend stabilization. Large data parsing limits client performance and should be migrated.
**Delivers:** Offloading heavy dataset processing and aggregation to the NestJS backend API or workers.

### Phase Ordering Rationale

- Replacing the AI intent parser in Phase 1 guarantees that subsequent React refactoring will not sever the application's core feature (Generative UI capabilities).
- Decoupling the God object in Phase 2 reduces the blast radius of any individual change and dramatically increases testability.
- Optimizing backend flow in Phase 3 naturally builds on the newly modularized, stable frontend components.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Optimizing the data aggregation layer will require deeper research into NestJS background processing and how to sync the resulting data effectively with the CopilotKit context without introducing latency.

Phases with standard patterns (skip research-phase):
- **Phase 1 & Phase 2:** Using CopilotKit's built-in `useCopilotAction` and standard React code splitting are well-documented and established patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Validated against official docs for AST parsers (Knip, Dependency-Cruiser). |
| Features | HIGH | Directly maps to known Generative UI anti-patterns versus standard web audits. |
| Architecture | HIGH | Confirmed via specific `page.tsx` and `useDashboard.ts` codebase references. |
| Pitfalls | HIGH | Supported by CopilotKit's AG-UI protocol and known framework failure modes. |

**Overall confidence:** HIGH

### Gaps to Address

- **Multi-Tenant Validation Security:** Backend session management for `CopilotRuntime` instances was flagged as a potential vulnerability. It must be explicitly verified during implementation planning to ensure context bleed is technically impossible.

## Sources

### Primary (HIGH confidence)
- CopilotKit Documentation & Ecosystem Discussions — Best practices on `useCopilotAction` and `useCopilotReadable`.
- Core AST/Linting Tools Official Docs — Knip, Dependency-Cruiser, Next.js, and NestJS documentation.
- Project Codebase (`.planning/PROJECT.md`, `page.tsx`, `useDashboard.ts`) — Explicit verification of the regex parsing pitfall and God object implementations.

### Secondary (MEDIUM confidence)
- Community Post-Mortems — Insights into LangGraph integration gaps and event ordering strictness.

---
*Research completed: May 2025*
*Ready for roadmap: yes*