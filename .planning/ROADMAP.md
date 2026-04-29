# Project Roadmap

## Phases

- [ ] **Phase 1: Baseline Architecture & Flow Mapping** - Map current architecture, flow, and stack idiomatic usage
- [ ] **Phase 2: AI Integration & Frontend Complexity Audit** - Analyze the UI ↔ AI bridge, intent parsing, and coupling
- [ ] **Phase 3: Resilience, Performance & Risk Assessment** - Evaluate system risks, trade-offs, and scalability bottlenecks
- [ ] **Phase 4: AI Architecture Extension Analysis** - Assess current AI limits and evaluate agentic extension opportunities
- [ ] **Phase 5: Full System UAT and Comprehensive Issue Report** - Perform a complete check of all possible actions and issues in the system
- [ ] **Phase 6: Dockerization and Flexible API Configuration without Rebuilds** - Plan Docker setup supporting dynamic API configs without rebuilding images
- [ ] **Phase 7: Codebase Standardization, PR Governance, and Production Readiness** - Standardize contributor flow, enforce strict quality gates, refactor for consistency, and harden runtime reliability

## Phase Details

### Phase 1: Baseline Architecture & Flow Mapping
**Goal**: The team has a verified understanding of the current architecture, tech stack usage, and end-to-end data flows.
**Depends on**: Nothing
**Requirements**: AUDIT-01, AUDIT-03, SYS-01
**Success Criteria** (what must be TRUE):
  1. Team can view a verified architecture map showing actual code dependencies.
  2. Team can trace the end-to-end execution flow from UI to Database and back.
  3. Team understands where the implementation deviates from idiomatic React 19 and NestJS 11.
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Establish baseline architecture truth using automated static analysis (Knip/dependency-cruiser).
- [ ] 01-02-PLAN.md — Map end-to-end user data flow and perform idiomatic assessment of framework usage.

### Phase 2: AI Integration & Frontend Complexity Audit
**Goal**: The team understands the risks, coupling, and failure modes within the UI and CopilotKit AI bridge.
**Depends on**: Phase 1
**Requirements**: AI-01, AI-02, CPL-01
**Success Criteria** (what must be TRUE):
  1. Team can review specific code examples of fragile AI intent parsing (e.g., regex extraction).
  2. Team can identify overloaded frontend components and tight coupling.
  3. Team understands the architectural risks associated with the current Generative UI implementation.
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Audit intent parsing and AI bridge tracing.
- [ ] 02-02-PLAN.md — Map frontend state orchestration and component coupling.

### Phase 3: Resilience, Performance & Risk Assessment
**Goal**: The team has a comprehensive log of system vulnerabilities, architectural trade-offs, and scalability bottlenecks.
**Depends on**: Phase 2
**Requirements**: AUDIT-02, CTRL-01, SYS-02, SYS-03, PERF-01, ISSUE-01
**Success Criteria** (what must be TRUE):
  1. Team can review a documented Risk & Vulnerability Log highlighting single points of failure.
  2. Team understands the abstracted complexities and risks associated with third-party dependencies.
  3. Team can review explicitly mapped issues linking symptoms to root causes and impact.
  4. Team knows which components will break under 10x to 100x data or user load.
**Plans**: TBD

### Phase 4: AI Architecture Extension Analysis
**Goal**: Assess current AI limits and evaluate agentic extension opportunities.
**Depends on**: Phase 3
**Requirements**: N/A
**Success Criteria** (what must be TRUE):
  1. Agentic extension opportunities are documented.
**Plans**: TBD

### Phase 5: Full System UAT and Comprehensive Issue Report
**Goal**: Perform a complete check of all possible actions and issues in the system.
**Depends on**: Phase 4
**Requirements**: N/A
**Success Criteria** (what must be TRUE):
  1. All system actions are checked.
  2. A comprehensive report of issues is created.
**Plans**: TBD

### Phase 6: Dockerization and Flexible API Configuration without Rebuilds
**Goal**: Plan the dockerization of the system while letting the user setup their own API configs via env without rebuilding images.
**Depends on**: Phase 5
**Requirements**: N/A
**Success Criteria** (what must be TRUE):
  1. The system can be containerized.
  2. End users can configure model, Bifrost, Langfuse, etc. via environment variables at runtime.
  3. No image rebuilds are required when changing these configurations.
**Plans**: TBD

### Phase 7: Codebase Standardization, PR Governance, and Production Readiness
**Goal**: Establish enforceable engineering standards, controlled PR process, and production-grade runtime reliability baseline.
**Depends on**: Phase 6
**Requirements**: N/A
**Success Criteria** (what must be TRUE):
  1. PRs are gated by strict CI checks for lint, tests, and build.
  2. Contributors follow a documented PR contract and definition of done.
  3. Refactor changes are behavior-preserving and isolated in stacked branch flow.
  4. Runtime config and failure-path behavior are hardened for production use.
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline Architecture & Flow Mapping | 0/2 | In progress | - |
| 2. AI Integration & Frontend Complexity Audit | 0/2 | Not started | - |
| 3. Resilience, Performance & Risk Assessment | 0/0 | Not started | - |
| 4. AI Architecture Extension Analysis | 0/0 | Not started | - |
| 5. Full System UAT and Comprehensive Issue Report | 0/0 | Not started | - |
| 6. Dockerization and Flexible API Configuration without Rebuilds | 0/0 | Not started | - |
| 7. Codebase Standardization, PR Governance, and Production Readiness | 0/0 | Not started | - |
