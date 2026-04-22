# Feature Landscape

**Domain:** Architectural Audit and Refactoring Plan (AI-driven Dashboards)
**Researched:** 2026-04-22 (Current Context)

## Table Stakes

Features users expect from any architectural audit. Missing = product feels incomplete and lacks fundamental technical credibility.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Current State Architecture Mapping** | Essential to understand how the system *actually* works vs. how it was documented. | High | Involves tracing dependencies across Next.js and NestJS. |
| **Dependency & Coupling Analysis** | Teams need to know where the "Big Ball of Mud" exists and what modules are tightly coupled. | Medium | Critical for identifying issues in monolithic files. |
| **Risk & Vulnerability Log** | Identifies single points of failure, security risks, and bottlenecks in data flow. | Medium | Must prioritize based on impact and likelihood. |
| **Tech Stack Evaluation** | Validates if the current stack (React 19, NestJS 11, TypeORM) is being used effectively and idiomatically. | Low | |

## Differentiators

Features that set this specific AI Dashboard audit apart. Not expected in standard web app audits, but highly valued for generative UI systems.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **UI ↔ AI Bridge Analysis** | Evaluates the specific CopilotKit runtime integration and state synchronization between AI and UI. | High | Unique to generative UI applications. |
| **AI Intent Parsing Assessment** | Identifies fragile parsing (e.g., regex-based AI intent extraction in `page.tsx`) and proposes structured alternatives. | High | Crucial for system stability and scalability. |
| **Evidence-Backed Refactoring Roadmap** | Provides a phased, prioritized plan (quick wins vs structural) referencing exact code lines and files, avoiding abstract advice. | High | Makes the audit immediately actionable. |
| **LLM Gateway Performance Check** | Assesses the connection layer to OpenAI SDKs (Bifrost) for latency, token usage, and error handling. | Medium | |

## Anti-Features

Features to explicitly NOT build or include in the audit deliverables.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Generic Architecture Explanations** | Stakeholders don't need a textbook definition of microservices or clean architecture; it wastes time. | Provide concrete, code-level examples of architectural issues specific to this repository. |
| **Documentation-Based Assumptions** | Blindly trusting `ARCHITECTURE.md` or `STACK.md` leads to flawed refactoring plans if the code has drifted. | Manually or systematically verify the implementation against the code (e.g., tracing imports). |
| **Automated "Blind" Refactoring Scripts** | Running large automated refactoring tools without context can break nuanced AI state management. | Provide an explicit step-by-step refactoring guide for developers to execute intentionally. |

## Feature Dependencies

```
Current State Architecture Mapping → Dependency & Coupling Analysis
UI ↔ AI Bridge Analysis → AI Intent Parsing Assessment
Dependency & Coupling Analysis → Evidence-Backed Refactoring Roadmap
Risk & Vulnerability Log → Evidence-Backed Refactoring Roadmap
```

## MVP Recommendation

Prioritize:
1. Current State Architecture Mapping
2. UI ↔ AI Bridge Analysis
3. Evidence-Backed Refactoring Roadmap

Defer: LLM Gateway Performance Check (Secondary to structural coupling issues in the frontend).

## Sources

- .planning/PROJECT.md (Project specific requirements)
- Competitor analysis of software architectural audit deliverables (Web Search)
