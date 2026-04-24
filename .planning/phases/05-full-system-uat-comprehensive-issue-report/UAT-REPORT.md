# Full System UAT & Comprehensive Issue Report

## Overview
This document outlines the findings of the comprehensive User Acceptance Test (UAT) conducted on the CopilotKit AI Dashboard. The test evaluated the core user flows including authentication, dashboard interaction, CopilotKit integration, and data visualization.

## Environment Details
- **Frontend URL:** `http://localhost:3000`
- **Backend URL:** `http://localhost:3500`

## Test Execution Summary

| Flow Tested | Status | Notes |
|-------------|--------|-------|
| **User Authentication (Signup)** | ✅ PASS | Dummy credentials successfully created a session. |
| **Dashboard Layout** | ✅ PASS | UI components loaded correctly upon login. |
| **CopilotKit AI Integration** | ✅ PASS (Fixed) | Frontend successfully communicates with backend. |
| **Data Visualization Container** | ✅ PASS (Fixed) | Recharts containers render axes and legends with correct dimensions. |
| **Data Connection (CSV Upload)** | ✅ PASS | Uploaded `NetFlix.csv`; system successfully parsed 7,787 records and 11 columns. |
| **AI Chart Generation (Mapping)** | ❌ FAIL | AI successfully creates charts based on intent, but hallucinates data mappings (e.g., assigning non-numeric string columns like `genres` as the Y-axis series), resulting in blank graphs. |

---

## Detailed Issue Findings & Root Causes

### 1. CopilotKit Integration Fails with 404 (Malformed Request URL)
- **Severity:** Critical
- **Symptoms:** Sending messages to the AI assistant fails silently or produces console errors. The frontend terminal showed repeated 404 errors attempting to `POST /%22http:/localhost:3500%22/copilotkit`.
- **Root Cause:** The `NEXT_PUBLIC_API_URL` environment variable in the frontend `.env` file contained explicit double quotes (`"http://localhost:3500"`). Next.js loads these quotes literally into the variable, causing `fetch` to treat the URL as a relative path to the current origin, URL-encoding the quotes as `%22`.
- **Resolution Status:** **FIXED** by removing the explicit double quotes from `.env`.

### 2. Recharts Visualization Empty (Width/Height -1)
- **Severity:** High
- **Symptoms:** All widgets loaded to the dashboard (Line, Bar, Pie charts) were completely invisible despite their containers appearing. The console logged a warning: `The width(-1) and height(-1) of chart should be greater than 0...`
- **Root Cause:** Recharts `ResponsiveContainer` requires its parent container to have a measurable dimensional height. The `ChartContainer.tsx` had `flex-1` with `min-h-0`, which allowed the chart to collapse to 0 pixels in height under certain layout constraints.
- **Resolution Status:** **FIXED** by changing `min-h-0` to `min-h-[300px]` in `ChartContainer.tsx` to guarantee a measurable rendering footprint.

### 3. AI Hallucinates Chart Data Mappings (Blank Graphs)
- **Severity:** High
- **Symptoms:** When asked to "Analyze the Netflix data and create some charts," the AI successfully connects to the dataset and generates dashboard widgets (e.g., "Movie Genre Distribution"). However, the chart bodies are blank. The axes render, but no data points or bars are visible. The legend indicates it is trying to plot a string field (e.g., `genres`) as the Y-axis value.
- **Root Cause:** The LLM intent parser or the CopilotKit action handler does not strictly validate the `config.series` against numeric types in the dataset. It hallucinates mappings, telling the frontend to plot a non-numeric string column on the Y-axis, which Recharts ignores, resulting in an empty chart.
- **Resolution Status:** **OPEN** - Requires deeper architectural changes to the AI intent parsing and stricter schema validation (Zod) before dispatching the visualization config to the frontend.

## Conclusions
The core infrastructure of the system (authentication, basic layout, AI gateway communication, data ingestion) is operational. We resolved the major crash bugs (404 malformed URLs and Recharts rendering crashes). However, the final end-to-end user value is blocked by **Issue #3**: the AI's inability to reliably map dataset columns to valid chart configurations. Fixing this will require enforcing strict schema boundaries on the AI's output.
