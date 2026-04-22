# Frontend Complexity Audit Report

## 1. State Orchestration Audit

`useDashboard.ts` is currently acting as a "God Hook," managing:
- **Data Orchestration:** Loading and merging data from multiple sources.
- **Action Handling:** Mapping AI intents to `updateDashboard` operations.
- **API Interaction:** Wrapping CRUD operations for dashboard persistent storage.
- **Data Transformation:** Aggregating data, formula parsing, and numeric formatting.

### Component Dependency Mapping
The hook is primarily consumed in `page.tsx`. While not used directly in every component via `useDashboard`, it passes down state and handler functions through props, creating a deep coupling between the AI intent-parsing logic (in the hook) and the visual components.

### Fragile Nodes:
- **Element Reconstruction:** The hook contains massive switch-case blocks for element creation (`prepareElement`). Any UI component change requires updates to this central hook.
- **Aggregation Logic:** Numeric formatting, formula parsing, and data aggregation logic is all coupled to the `updateDashboardUI` action handler, making it difficult to test or reuse.

## 2. Component Coupling & Registry

- **Chart Registry:** There are 15 chart components in `src/components/charts/`.
- **Decoupling Issues:** Components currently expect a rigid `config` and `data` structure provided by `useDashboard`. They have no awareness of the "original" data; they are "blind" executors of the dashboard state.
- **Mapping Findings:** The effort to "reconstruct" UI elements is high because the system lacks a centralized component registry. The `useDashboard` hook is the hard-coded registry.

## 3. Recommendations
- **Decouple Data Transformation:** Move `aggregateData` and data parsing logic out of `useDashboard` and into dedicated utility functions or a separate data context.
- **Component Registry:** Introduce a declarative mapping between chart types and component types to remove the `switch` blocks in the hook.
- **State Partitioning:** Separate the *AI Action Handling* from *Data Storage/Orchestration* to reduce the hook's responsibility.
