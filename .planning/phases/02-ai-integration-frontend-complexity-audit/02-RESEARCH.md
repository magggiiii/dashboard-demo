# Phase 02: AI Integration & Frontend Complexity Audit - Research

**Researched:** 2025-05-15
**Domain:** AI-Driven Frontend / NestJS / Next.js
**Confidence:** HIGH

## Summary

The project utilizes a highly coupled, event-driven flow between an LLM-agent backend and a Gen-UI frontend. The bridge is heavily dependent on `@copilotkit` runtime primitives for agent-to-UI communication, relying on `useCopilotAction` to trigger dynamic React component updates in the frontend's `useDashboard` hook.

The primary fragility point is the **schema-driven bridge**. The frontend must flatten complex objects into scalar primitives to satisfy the CopilotKit Cloud API (or specific limitations in its runtime implementation), requiring manual "re-construction" of UI elements in the frontend's `prepareElement` helper. This layer is overloaded and prone to drift from the actual UI component props.

**Primary recommendation:** Formalize the UI Schema (Zod) shared between backend/frontend and move towards a single source of truth for component configurations to eliminate the current "flatten-reconstruct" fragile pattern.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @copilotkit/runtime | ^1.54.1 | Agentic runtime server | Handles SSE streaming/Tool calls |
| @copilotkit/react-core| ^1.51.4 | Frontend integration | Manages tool registration/context |
| NestJS | ^10.x | Backend framework | Standard for structured TS microservices |
| Next.js | 15.x | Frontend framework | App Router used for GenUI rendering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Langfuse | - | Observability | Tracking LLM traces/prompts |
| Zod | - | Schema validation | Runtime-safe parsing of AI outputs |
| TypeORM | - | Database ORM | Persisting dashboards/charts |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/              # Next.js App Router (GenUI host)
├── components/       # GenUI component library
├── hooks/            # AI-to-Dashboard bridging logic
├── lib/              # API and auth abstractions
└── types/            # Shared schema definitions (Zod/TS)
```

### Pattern 1: Gen-UI Injection (Event-Driven)
**What:** AI tool calls trigger handlers in `useCopilotAction`, which updates a local React state (`dashboard`) that is rendered by `GenUIRuntime`.
**When to use:** Dynamic UI creation via LLM output.
**Example:**
```typescript
useCopilotAction({
  name: "updateDashboardUI",
  handler: async (args) => {
    // 1. Receive flattened params
    // 2. Reconstruct UI object via prepareElement()
    // 3. updateDashboard() (setState)
  }
});
```

### Anti-Patterns to Avoid
- **Flatten-Reconstruct Drift:** Manually mapping parameters to objects in `prepareElement` instead of using shared Zod schemas.
- **Overloaded Hooks:** `useDashboard` is currently doing too much (data fetching, state orchestration, UI reconstruction, and AI tool orchestration).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI Tracing | Custom logger | Langfuse | Complex E2E visibility/prompt management |
| API Gateway | Custom logic | CopilotKit / Bifrost | Handles streaming/SSE complexity |
| UI State Sync | Custom pub/sub | CopilotKit Contexts | Native SDK support |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Database schema for dashboards, charts, and elements | Potential migration if schema changes |
| Live service config | Bifrost base URL, LLM API keys | None |
| OS-registered state | None — verified | None |
| Secrets/env vars | API keys in .env | None |
| Build artifacts | `dist/` and `node_modules/@copilotkit` | Rebuild after refactor |

## Common Pitfalls

### Pitfall 1: Flattened Parameter Drift
**What goes wrong:** New fields added to `UIElement` schema are missed in `prepareElement` (frontend) or `parameters` (CopilotAction).
**Why it happens:** Manual mapping of parameters to the UI component model.
**How to avoid:** Use a single, shared Zod schema file that exports both the type and a parser that can handle the raw `args` object from `useCopilotAction`.

## Phase Requirements

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-01 | UI ↔ AI Bridge | Analyzed `useDashboard` bridge logic and primitive constraints |
| AI-02 | Intent Parsing | Identified Zod parsing limitations in `prepareElement` |
| CPL-01 | Coupling | Identified deep coupling in `useDashboard` tool-to-state flow |
</phase_requirements>

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Zod (implemented) |
| V6 Cryptography | yes | TLS for SSE/API traffic |

### Known Threat Patterns
- **Prompt Injection:** Attackers manipulating instructions passed to CopilotKit.
- **Insecure Tool Execution:** `updateDashboardUI` handler should strictly sanitize `dataJson` input before passing to `safeJsonParse`.

## Sources

### Primary
- `gui-dashboard-frontend-main/src/hooks/useDashboard.ts` - Foundative bridge logic
- `CopilotKit_Project_Documentation.md` - Context on system flow
- `@copilotkit/runtime` docs

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CopilotKit Cloud API primitive flattening limitation | Common Pitfalls | Might be resolvable with latest SDK |

## Open Questions

1. **Can we replace `prepareElement` manual mapping with a centralized Zod parser?**
   - What we know: Currently uses manual key-value mapping.
   - What's unclear: If `useCopilotAction` parameters can reliably map to Zod schemas directly.
   - Recommendation: Investigate `zod-to-json-schema` to dynamically generate tool definitions.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| CopilotKit | AI Features | ✓ | 1.54.1 | — |
| NestJS | Backend | ✓ | 10.x | — |
| Langfuse | Tracing | ✓ | — | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest |
| Quick run command | `npm test` |

### Wave 0 Gaps
- [ ] Add unit tests for `useDashboard` prepareElement mapping.
- [ ] Add E2E tests for AI-triggered UI updates.
