# Architecture Patterns

**Domain:** Full-Stack AI-Driven Dashboard
**Researched:** 2024-05-24

## Recommended Architecture

The current architecture is a Client-Server Monorepo utilizing an AI-driven Generative UI. It features a Next.js 16 App Router frontend, a NestJS 11 backend, and CopilotKit as the AI integration layer.

However, the current implementation reveals significant deviations from ideal CopilotKit patterns, specifically around how AI intent is processed on the client side.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Frontend UI App (`page.tsx`)** | Renders dashboard views, manages layout state, handles file data loading, auto-saves to backend. **Also handles fragile AI tag parsing.** | Frontend State (`useDashboard.ts`), Backend REST API, CopilotChatContext |
| **Frontend State Layer (`useDashboard.ts`)** | Exposes application state and data schemas to the AI (`useCopilotReadable`). Registers AI actions (`useCopilotAction`). Handles data aggregation. | CopilotKit Context, Frontend UI App |
| **Backend Copilot Runtime (`CopilotkitController`)** | Proxies CopilotKit requests to the LLM (Bifrost Gateway), handles Langfuse tracing via `OpenAIAdapter`. | Frontend CopilotKit client, Bifrost LLM Gateway |
| **Backend REST API (`Dashboard/Auth/File`)** | Handles business logic, authentication (JWT), file storage (AWS S3), and persistence of dashboard configurations (PostgreSQL). | Frontend UI App, PostgreSQL, AWS S3 |

### Data Flow

**Current AI Dashboard Generation Flow (with Anti-Patterns):**
1. **User Input:** User submits a natural language request via the chat interface (`CopilotChatContext`).
2. **Context Enrichment:** `useCopilotReadable` (in `useDashboard.ts`) automatically provides dataset schemas, sample data, and current dashboard layout to the AI agent.
3. **AI Processing:** CopilotKit client sends the prompt and context to the NestJS backend (`/copilotkit`), which routes it to the LLM via Bifrost Gateway.
4. **Action Execution (Anti-Pattern):** Instead of executing native CopilotKit tool calls cleanly, the LLM streams back raw text containing custom tags (e.g., `<function updateDashboardUI>{...}</function>`).
5. **Tag Parsing:** A `useEffect` in `app/page.tsx` monitors the chat context, runs a complex Regex over the streamed text to extract the JSON payload, and manually invokes the dashboard update handlers.
6. **UI Update & Persistence:** `useDashboard.ts` updates local state, re-rendering the widgets. Another `useEffect` in `page.tsx` detects the state change and auto-saves the configuration to the backend database.

## Patterns to Follow

### Pattern 1: Native CopilotKit Actions
**What:** Use CopilotKit's built-in `useCopilotAction` handler for executing UI changes rather than string parsing.
**When:** Whenever the AI needs to modify application state.
**Example:**
```typescript
useCopilotAction({
  name: "updateDashboardUI",
  description: "Modify the dashboard UI",
  parameters: [/*...*/],
  handler: async (args) => {
    // Rely on this handler executing natively instead of parsing chat text
    const element = prepareElement(args, localData);
    updateDashboard(args.action as string, element, args.elementId);
  }
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic Frontend Orchestration & Regex Tag Parsing
**What:** `app/page.tsx` acts as a God object, managing layout, data loading, auto-saving, AND parsing AI chat messages with Regex (`/<function(?:[./\(])(updateDashboardUI)...>/g`) to trigger state changes.
**Why bad:** Highly fragile. Any hallucination or malformed JSON from the LLM breaks the UI update. It tightly couples chat history to UI state, leading to massive re-renders and logic duplication (e.g., duplicate IDs, loop execution prevention).
**Instead:** Leverage proper LLM tool calling / structured outputs directly mapped to `useCopilotAction` handlers. The backend or CopilotKit runtime should guarantee JSON structure before the client attempts state updates.

### Anti-Pattern 2: Overloaded State Hooks
**What:** `useDashboard.ts` handles complex data aggregation, CopilotKit action registration, context providing, and API calls.
**Why bad:** Hard to test and maintain.
**Instead:** Separate data aggregation utilities, API fetching, and AI context binding into distinct hooks/services.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **AI Request Load** | Direct proxy to Bifrost is fine. | Need caching for common queries, rate limiting per user. | Dedicated LLM gateway, semantic caching, queue-based processing. |
| **Client-side Processing** | Current `aggregateData` works for small files. | Browser memory limits will crash tabs on large files. | Move heavy data parsing and aggregation to the NestJS backend or a dedicated worker. |
| **State Persistence** | Auto-saving on 2s debounce works. | High write volume to Postgres. | Switch to optimistic UI with batched background syncing or Redis caching. |

## Build Order Implications (Refactor Plan)

To integrate these architectural findings into the phase structure:

1. **Phase 1: Decouple & Stabilize AI Bridge (Highest Priority)**
   - Eliminate the Regex tag parsing in `page.tsx`.
   - Ensure the LLM uses native tool calling that triggers `useCopilotAction` handler directly.
   - Refactor `CopilotkitController` to enforce structured outputs if necessary.
2. **Phase 2: State & Component Decomposition**
   - Break apart the monolithic `page.tsx` into smaller, focused components (Layout, DataLayer, AILayer).
   - Extract data aggregation logic out of `useDashboard.ts` into utility functions or web workers.
3. **Phase 3: Backend & Data Flow Optimization**
   - Shift heavy dataset processing from the Next.js client to the NestJS backend to improve client performance and stability.

## Sources

- `.planning/PROJECT.md`
- `gui-dashboard-frontend-main/src/app/page.tsx`
- `gui-dashboard-frontend-main/src/hooks/useDashboard.ts`
- `gui-dashboard-backend-feature-langfuse/src/modules/copilotkit/copilotkit.controller.ts`