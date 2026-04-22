# AI Bridge Audit Report

## 1. Intent Parsing & Fragility Audit

The analysis of `useDashboard.ts` reveals significant dependency on regex-based string manipulation for intent parsing, which constitutes a "fragile" pattern in the current AI integration.

### Identified Fragile Patterns:
- **String Splitting:** The system relies heavily on `split(',')` for parsing comma-separated lists of configuration (e.g., `configSeries`, `configColors`, `tableColumns`).
  - *Risk:* If a user inputs a list containing commas in values (e.g., "North, South" region), the parsing will break.
- **Formula Regex:** The `prepareElement` function uses `match(/^(\w+)\((.+)\)$/)` to parse formulas like `sum(sales_amount)`.
  - *Risk:* Rigid formula structure; lacks robust error handling or advanced expression parsing.
- **Title-based ID Generation:** Elements are generated using `.toLowerCase().replace(/\s+/g, '-')`.
  - *Risk:* Collision potential for similarly named elements; fragile if the naming convention changes.
- **Type/Label Deduplication:** Uses index lookup based on partial string matching (e.g., `(e as any).title === (element as any).title`).
  - *Risk:* Brittle deduplication logic; relies on implicit UI property structures.

## 2. Structural Integrity & Tool Registration

- **CopilotAction Registration:** The `updateDashboardUI` action registration in `useDashboard.ts` uses flat, primitive types (string, number, boolean) to comply with CopilotKit Cloud requirements. 
- **Tool Call Inputs:** The complexity is shifted to the frontend `handler`, where JSON parsing of `dataJson` and manual object reconstruction occurs. 
- **Tool Count:** Currently, there is one major multifunctional action `updateDashboardUI` registered. 

## 3. Langfuse Tracing Status

- **Visibility:** Tracing is implemented but relies on `console.log` statements for debugging (e.g., `ACTION_HANDLER_DEBUG`). 
- **Manual Tracing:** There is no evidence of programmatic Langfuse SDK calls within the `useDashboard.ts` or `chat.ts` handlers.
- **Recommendation:** Integrate the `@langfuse/langfuse` SDK directly into the `handler` to capture input arguments, parsed object state, and eventual dashboard updates.

## 4. Data Schema Drift

- **Schema Discrepancy:** The `useDashboard` hook expects a flat schema for tool calls, but the backend entities (`DashboardResponse`) contain nested `data` and `charts` structures. 
- **Drift:** The frontend `parseBackendDashboard` function acts as a buffer layer to rehydrate the backend-agnostic `UIElement` from both legacy/relational and new JSON structures. This layer is currently the primary failure point for schema drift.

## 5. Tool Call Audit
- Total  calls found:        2
- All registered tools and their input schemas are currently consolidated in the single 'updateDashboardUI' handler.
