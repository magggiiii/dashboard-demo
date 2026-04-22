# Requirements

**Phase:** v1.0

## v1 Requirements

### Audit Core
- [ ] **AUDIT-01**: Map the current state architecture and analyze dependencies
- [ ] **AUDIT-02**: Identify single points of failure in a Risk & Vulnerability Log
- [ ] **AUDIT-03**: Evaluate idiomatic usage of the tech stack (React 19, NestJS 11)

### AI Integration
- [ ] **AI-01**: Analyze the UI ↔ AI Bridge (Generative UI and CopilotKit integration)
- [ ] **AI-02**: Assess AI intent parsing to shift from regex-based extraction to structured JSON

### Dependency Control
- [ ] **CTRL-01**: Analyze Control vs Dependency (owned vs external, abstraction layers, failure risks)

### Deep System Analysis
- [ ] **SYS-01**: Map the End-to-End Flow (UI → AI → backend → DB → UI) including sync/async boundaries and state mutations
- [ ] **SYS-02**: Identify key Architectural Decisions (convenience vs control, speed vs robustness) and explain why
- [ ] **SYS-03**: Detail Underlying / Abstracted Away complexities (what responsibilities are delegated, what we don't control)

### Issue & Performance Profiling
- [ ] **PERF-01**: Analyze Performance & Scalability (what breaks at 10x data or 100x users, bottlenecks)
- [ ] **ISSUE-01**: Document specific Issues explicitly mapped by Symptom vs Root Cause vs Impact
- [ ] **CPL-01**: Identify Coupling & Hidden Complexity (tight coupling, fragile integrations, overloaded modules)

## v2 Requirements

### Refactoring
- [ ] **REF-01**: Produce an evidence-backed refactoring roadmap (Actionable, prioritized guide)

## Out of Scope

- **LLM Gateway Performance Check**: Deferred to focus on structural coupling in the frontend first.
- **Generic Architecture Explanations**: Must focus on real-world engineering implications based on actual code.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-01 | Phase 1 | Pending |
| AUDIT-02 | Phase 3 | Pending |
| AUDIT-03 | Phase 1 | Pending |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| CTRL-01 | Phase 3 | Pending |
| SYS-01 | Phase 1 | Pending |
| SYS-02 | Phase 3 | Pending |
| SYS-03 | Phase 3 | Pending |
| PERF-01 | Phase 3 | Pending |
| ISSUE-01 | Phase 3 | Pending |
| CPL-01 | Phase 2 | Pending |