# Phase 01: Baseline Architecture & Flow Mapping - Research

**Researched:** 2025-05-20 (Simulated Date)
**Domain:** Architecture Mapping, E2E Flow Analysis, Framework Idiomatic Usage
**Confidence:** HIGH

## User Constraints

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Architecture map must be derived from actual code (imports, modules, runtime flow), not just documentation. Automated static analysis (Knip/dependency-cruiser) should be leveraged.
- **D-02:** Explicitly compare documented architecture vs real implementation and highlight mismatches.
- **D-03:** The flow map (UI → AI → backend → DB → UI) must trace a real user action through the system end-to-end.
- **D-04:** The map must explicitly document data transformations, state ownership, sync vs async boundaries, and streaming behavior (e.g. SSE / CopilotKit).
- **D-05:** Evaluation of the tech stack must focus on whether React 19 and NestJS 11 are used idiomatically, identifying where implementation deviates from intended framework design.

### the agent's Discretion
- Formatting and tooling choices for the actual output deliverables (e.g., using Mermaid.js for flowcharts, specific formatting for tables).

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUDIT-01 | Map current state architecture | Use Knip and Dependency-Cruiser for automated analysis |
| AUDIT-03 | Evaluate idiomatic usage (React 19 / NestJS 11) | Review framework-specific patterns against established documentation |
| SYS-01 | Map E2E Flow (UI → AI → backend → DB) | Trace key action (e.g., data dashboard update) via runtime & static analysis |
</phase_requirements>

## Summary

This research establishes the baseline for mapping the current architecture. The project is a monorepo containing a NestJS 11 backend and a Next.js 16 (App Router) frontend, utilizing CopilotKit for AI features. To comply with requirements, we will move away from manual diagramming to automated AST-derived mapping using Knip and Dependency-Cruiser.

**Primary recommendation:** Initialize the audit by configuring `dependency-cruiser` for graph-based dependency visualization and `Knip` for identifying orphaned modules or unused CopilotKit utilities before attempting to construct the system flow maps.

## Standard Stack

### Core (Audit & Analysis)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Knip | ^5.x | Dead code analysis | Identifies unused code/exports in modern TS |
| Dependency-Cruiser | ^16.x | Dependency graph generation | Essential for mapping actual code dependencies |

### Supporting (Framework Validation)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/devtools-integration | ^11.x | NestJS DI graph inspection | Visualizes runtime module/provider relations |
| eslint-plugin-nestjs | ^0.x | NestJS anti-pattern detection | Ensures idiomatic framework usage |

**Installation:**
```bash
npm install -D knip dependency-cruiser @nestjs/devtools-integration eslint-plugin-nestjs
```

## Architecture Patterns

### Recommended Project Structure
The project is divided into:
- `gui-dashboard-backend-feature-langfuse/`: NestJS 11 monorepo module
- `gui-dashboard-frontend-main/`: Next.js 16 app

### Pattern 1: Dependency Mapping
**What:** Automated mapping of module-to-module dependencies using `dependency-cruiser`.
**When to use:** Early in phase to establish the baseline truth.
**Example:**
```bash
# Generate visual dependency graph
npx depcruise src --output-type dot | dot -T svg > architecture-graph.svg
```

### Anti-Patterns to Avoid
- **Implicit Dependency Chains:** Avoid importing backend service logic into frontend components (violating monorepo boundaries).
- **Manual Documentation:** Do not rely on `ARCHITECTURE.md` as source of truth; use `dependency-cruiser` reports instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| System Flow Maps | Hand-drawn diagrams | Mermaid.js / Graphviz | Hand-drawn maps decay; automated graphs stay synced with code. |
| DI Analysis | Custom reflection | `@nestjs/devtools-integration` | Framework-native tools detect circular dependencies better. |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Database schema in TypeORM entities | Migrate based on flow analysis findings |
| Live service config | `.env` files not in git | Map required env vars to architecture baseline |
| OS-registered state | None | N/A |
| Secrets/env vars | None | N/A |
| Build artifacts | `dist/` folders | Clean build before audit |

## Common Pitfalls

### Pitfall 1: Ghost Dependencies
**What goes wrong:** Modules appear used but are orphaned, misleading the mapping.
**How to avoid:** Run `knip` before mapping to prune the dependency tree.

### Pitfall 2: Async Boundary Disconnect
**What goes wrong:** Sync execution assumptions in React 19 leading to race conditions in AI streaming.
**How to avoid:** Map specifically the `CopilotKit` hook boundaries and asynchronous event loops.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual audit | AST-based Dependency Mapping | 2025 | Accurate, version-controlled architecture |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Knip & Dependency-Cruiser work with the current monorepo structure. | Architecture Patterns | Low; standard tools for modern TS/NestJS. |

## Open Questions

1. **How do we handle the "CopilotKit proxy" bottleneck?**
   - We need to trace the exact HTTP/WS boundary in the controller `copilotkit.controller.ts`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `knip` | Audit | ✗ | — | `madge` |
| `dependency-cruiser` | Audit | ✗ | — | `madge` |

*(Missing tools are expected; planning phase includes installation.)*

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Backend) |
| Config file | `jest.config.ts` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDIT-01 | Dependency graph accuracy | Unit (static) | `npx depcruise` | ❌ |

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | Yes | class-validator / Zod |

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Industry standard tools for AST analysis.
- Architecture: HIGH - Monorepo structure is standard NestJS/Next.js.
- Pitfalls: MEDIUM - Dependent on actual codebase complexity.

**Research date:** 2025-05-20
**Valid until:** 2025-06-20
