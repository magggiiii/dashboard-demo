# Gen-UI Dashboard Frontend

This repository contains the frontend implementation for the Gen-UI Dashboard, built with Next.js, CopilotKit, and Recharts.

## Recent Updates & Enhancements

### 1. Robust Data Visualization
- **Smart Auto-Aggregation**: The system now intelligently detects data types (numeric vs categorical). It automatically chooses the best aggregation method (e.g., defaulting to `count` for text columns and `sum` for numeric columns).
- **Categorical Fallbacks**: If a value-based aggregation (like `sum`) is requested on a non-numeric column, the system automatically falls back to `count` to ensure charts always render correctly.
- **Improved Distribution Charts**: Enhanced support for Pie and Bar charts to handle "Distribution" requests (e.g., "Employees by Department") even when parameters are incomplete.

### 2. Smart Tables
- **Table Aggregation**: Aggregation logic (sum, count, avg) has been extended to table elements.
- **Smart Grouping**: If an aggregation is requested for a table without an explicit grouping key, the system intelligently defaults to grouping by the first column.

### 3. Stability & Robustness
- **Zod Schema Fixes**: Updated visualization schemas to allow `null` values for optional fields, preventing rendering failures for saved dashboards.
- **Defensive Parsing**: Improved the dashboard loading hook to handle missing or malformed backend data gracefully.
- **State Management**: Resolved race conditions between dashboard loading and auto-save mechanisms in the main dashboard page.

### 4. AI Tool Optimization
- Refined the descriptions for `updateDashboardUI` parameters to better guide the Copilot AI in selecting the correct columns for X-Axis and Series.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - For full-stack development from the repo root, use root `.env` (`cp ../.env.example ../.env`) and run Docker Compose.
   - For frontend-only local run, create `.env.local` with:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3500
     NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard.
