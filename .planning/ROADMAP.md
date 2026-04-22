# Project Roadmap

## Phases

- [ ] **Phase 1: Baseline Architecture & Flow Mapping** - Map current architecture, flow, and stack idiomatic usage
- [ ] **Phase 2: AI Integration & Frontend Complexity Audit** - Analyze the UI ↔ AI bridge, intent parsing, and coupling
- [ ] **Phase 3: Resilience, Performance & Risk Assessment** - Evaluate system risks, trade-offs, and scalability bottlenecks

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

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline Architecture & Flow Mapping | 0/2 | In progress | - |
| 2. AI Integration & Frontend Complexity Audit | 0/2 | Not started | - |
| 3. Resilience, Performance & Risk Assessment | 0/0 | Not started | - |
