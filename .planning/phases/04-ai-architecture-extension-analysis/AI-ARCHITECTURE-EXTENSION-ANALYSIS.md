# Phase 4: AI Architecture Extension Analysis

## 1. Current AI Behavior
*   **Invocation**: Utilizes `CopilotKit` (frontend) via `CopilotkitController` (backend) to reach the LLM (Bifrost). 
*   **Tasks**: UI manipulation (CRUD on charts/metrics) and NL queries.
*   **Integration**: Frontend `useDashboard.ts` hooks define the interaction boundary. Backend handles LLM orchestration and trace observability via `Langfuse`.
*   **Orchestration Logic**: Currently a flat, request-response execution flow where the LLM is trusted to provide scalar parameters which are then reconstructed into UI state.

## 2. AI Failure Modes and Limitations
*   **"Reconstruction-by-Trust"**: No formal validation layer exists; invalid LLM outputs flow directly into the `dashboard` state.
*   **Brittle Intent Parsing**: Relies on mapping NL to ~18 flat scalar parameters without a schema contract.
*   **Context Pressure**: Full dataset ingestion leads to potential context window limitations and hallucinated column references.
*   **Lack of Grounding**: UI elements are rendered blindly; schema mismatch or column drift causes runtime failures.

## 3. Agentic Extension Opportunities
| Agent Type | Problem Solved | Input Need | Output Produce | Architecture Fit |
| :--- | :--- | :--- | :--- | :--- |
| **Web Search Agent** | Answers outside dataset queries. | User Query | Search Results | Feasible (moderate) |
| **Data Enrichment** | Augments local data with external API info. | Local Data Row Keys | Enriched Data JSON | Feasible (moderate) |
| **Industry Analysis** | Benchmarks current trend data. | Local Trend Data | Benchmarking Insights | Feasible (high) |

## 4. Real-world Knowledge & External Data
*   **Value Add**: Integrating external market/industry data enables comparative analysis (KPIs vs. industry average).
*   **Risks**: Trust and citation are primary concerns. Requires strict attribution to mitigate hallucination.

## 5. Data Visualization Intelligence
*   **Current State**: Aggregations are handled client-side in `dashboard-utils.ts` without explicit column metadata.
*   **Requirements**: Need a structured **Schema Registry** to define column semantics (temporal/nominal), units, and data types, moving away from sample-based guessing.

## 6. Architecture Implications
*   **Orchestration**: Evolution from flat request-response to multi-step agentic loops is required to support complex tasks.
*   **Storage**: A persistent store for "AI Insights" is needed to move beyond transient, per-session analysis.
*   **Validation Layer**: A mandatory validation/contract layer (e.g., Zod) between the LLM output and the frontend state is the highest-priority architectural requirement.

## 7. Assessment Classification
| Capability | Classification | Reasoning |
| :--- | :--- | :--- |
| **GenUI Actions** | Already supported | Currently implemented via CopilotKit. |
| **Schema-aware context** | Feasible (moderate) | Requires structured metadata registry. |
| **Web Retrieval** | Feasible (moderate) | Feasible using `useCopilotAction`. |
| **Multi-step Agents** | Feasible (high complexity) | Requires agentic state persistency. |
| **Hard-coded Parsing** | Not a fit | System is natively LLM-driven; avoid hard-coding. |
