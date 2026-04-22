# Domain Pitfalls

**Domain:** Full-Stack AI-Driven Dashboard (CopilotKit, Next.js, NestJS)
**Researched:** 2026-04-22 (Current Date)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Ad-Hoc/Regex Parsing of AI Intent
**What goes wrong:** The frontend relies on brittle regex parsing of AI messages (e.g., in a monolithic `page.tsx`) to trigger UI updates, extract data, or detect state changes.
**Why it happens:** Developers bypass `useCopilotAction` or CopilotKit's structured tool-calling in favor of text parsing because it feels faster initially or due to a lack of understanding of the framework's intent-driven capabilities.
**Consequences:** UI breaks unexpectedly when the LLM changes its phrasing slightly. It creates massive tech debt, prevents proper type safety, and causes severe state desync between the UI and AI.
**Prevention:** Always use `useCopilotAction` to handle structured JSON outputs and function calls triggered by the AI. Treat AI output as structured data, not plain text strings to be regexed.
**Detection:** Look for regex patterns like `/```json/`, `/action:/`, or explicit string manipulation inside message loop handlers in frontend components.

### Pitfall 2: State Desync and Tenant Bleed
**What goes wrong:** The AI acts on stale UI state, or worse, bleeds context across user sessions in multi-tenant environments.
**Why it happens:** Developers manually update UI state instead of using `useCopilotReadable` correctly with proper dependency arrays. On the backend, CopilotRuntime instances might share context if not explicitly scoped per user/session.
**Consequences:** AI hallucinates data, executes actions on outdated context, or exposes another user's context/data (a critical security failure).
**Prevention:** Strictly bind UI context to `useCopilotReadable` and ensure dependency arrays are exhaustive. Implement backend session stores and validate tenant/user IDs for all AI actions and state emissions.
**Detection:** Finding `useCopilotReadable` hooks without dependency arrays, or missing tenant validation in CopilotRuntime backend adapters.

### Pitfall 3: Strict Event Ordering Assumptions (Advanced Agents)
**What goes wrong:** Advanced agents (like LangGraph) streaming thoughts and tools concurrently break CopilotKit's expected serial event ordering.
**Why it happens:** CopilotKit's AG-UI Protocol expects a strict serial sequence (e.g., requiring a `TOOL_CALL_END` before a new `TEXT_MESSAGE_START`). Complex multi-agent teams naturally stream these concurrently.
**Consequences:** Unhandled exceptions, dropped tool calls, and frozen chat UIs.
**Prevention:** Ensure the backend proxy/adapter properly sequences and buffers events for the CopilotKit AG-UI Protocol, or use native CopilotKit agent integrations that manage this automatically.
**Detection:** "Stream stopped" errors or console warnings about invalid event transitions during complex AI tasks.

## Moderate Pitfalls

### Pitfall 1: Vague Action Descriptions and Weak Typing
**What goes wrong:** The AI fails to trigger actions or hallucinates parameter structures.
**Prevention:** Provide exhaustive, precise `description` strings for every `useCopilotAction`. Use strict Zod schemas for `parameters` rather than loose types to enforce structure. Treat LLM tool calls as untrusted input and validate thoroughly.

### Pitfall 2: Blocking the UI with Long Actions
**What goes wrong:** Complex tasks executed within a `useCopilotAction` handler freeze the chat interface, provide no user feedback, or lead to timeout errors.
**Prevention:** Use background processing or streaming for long-running tools. Return immediate status updates (e.g., "Searching...", "Processing...") rather than waiting for the entire operation to complete before responding.

### Pitfall 3: Serialization Failures in Readable State
**What goes wrong:** Complex frontend objects (Sets, Maps, circular references) passed to `useCopilotReadable` fail to serialize, dropping context silently.
**Prevention:** Ensure all context passed is JSON-serializable, or provide a custom `convert` function to safely serialize complex state structures before they are sent to the AI.

## Minor Pitfalls

### Pitfall 1: Exposing DevConsole in Production
**What goes wrong:** Internal stack traces and CopilotKit debug info are visible to end-users, creating a bad UX and potential security risk.
**Prevention:** Ensure `showDevConsole={false}` is strictly bound to environment variables (e.g., only true in local development).

### Pitfall 2: Endpoint Misconfiguration
**What goes wrong:** "Remote Endpoint not found" errors in Docker or local Node environments.
**Prevention:** Explicitly configure `runtimeUrl` using `127.0.0.1` instead of `localhost` in Node environments, and ensure the `/info` endpoint is exposed and reachable by the frontend.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase: Frontend Refactoring** | Ad-Hoc Regex Parsing in `page.tsx` | Replace all string parsing with `useCopilotAction` and strict Zod schemas. |
| **Phase: Backend & State Isolation** | Tenant State Bleed | Enforce session validation in the NestJS CopilotKit controller. |
| **Phase: AI / Agent Integration** | Event Ordering Conflicts | Sequence overlapping LangGraph/Agent events before sending to CopilotKit. |
| **Phase: UX Enhancements** | UI Freezes on Tool Calls | Implement streaming responses for all long-running `useCopilotAction` handlers. |
| **Phase: DevOps & Deployment** | DevConsole Exposed | Bind `showDevConsole` to `NODE_ENV !== 'production'`. |

## Sources

- [CopilotKit Documentation & Ecosystem Discussions] (HIGH CONFIDENCE) - Best practices on state synchronization, `useCopilotAction`, and `useCopilotReadable`.
- [Community Post-Mortems] (MEDIUM CONFIDENCE) - LangGraph integration gaps, event ordering strictness.
- [Project Codebase Assessment (.planning/PROJECT.md)] (HIGH CONFIDENCE) - Explicit identification of the monolithic regex parsing pitfall in the current implementation.