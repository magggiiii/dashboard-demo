# Coding Conventions

**Analysis Date:** 2024-05-24

## Naming Patterns

**Files:**
- Frontend Components: PascalCase (e.g., `src/components/ChatDataSidebar.tsx`, `src/components/AuthGuard.tsx`).
- Frontend Hooks: camelCase (e.g., `src/hooks/useDashboard.ts`).
- Frontend Utils/Lib: kebab-case (e.g., `src/utils/dashboard-utils.ts`, `src/lib/dashboard.ts`).
- Next.js Routes: lowercase, standard Next.js naming (e.g., `src/app/page.tsx`, `src/app/layout.tsx`).
- Backend Code: kebab-case with type suffix (e.g., `src/modules/auth/auth.service.ts`, `src/app.controller.ts`).

**Functions:**
- camelCase for standard functions and methods.
- PascalCase for React Functional Components (often implemented as arrow functions).
- Example: `updateDashboard`, `parseBackendDashboard`, `FilteredAssistantMessage`.

**Variables:**
- camelCase for instances, primitives, arrays, etc.
- UPPER_SNAKE_CASE for constants (e.g., `INITIAL_MESSAGE` in `src/components/ChatDataSidebar.tsx`).

**Types:**
- PascalCase for interfaces, types, and DTOs (e.g., `Dashboard`, `UIElement`, `UseDashboardProps`, `SignupDto`).

## Code Style

**Formatting:**
- Prettier (Configured via `.prettierrc` in backend).
- Settings: `{ "singleQuote": true, "trailingComma": "all" }`.

**Linting:**
- ESLint used across both frontend and backend.
- Frontend uses `eslint-config-next` (`eslint.config.mjs`).
- Backend uses `@typescript-eslint` recommended and Prettier plugin (`eslint.config.mjs`). Warnings on `no-floating-promises` and `no-unsafe-argument`.

## Import Organization

**Order:**
1. React/Next.js core imports (`import React, { useState } from 'react';`).
2. Third-party library imports (`import { MessageSquare } from 'lucide-react';`, `import { Injectable } from '@nestjs/common';`).
3. Internal alias imports in frontend (`import { Dashboard } from '@/types/schema';`).
4. Relative internal imports (`import { SpreadsheetPreview } from './SpreadsheetPreview';`, `import { User } from '../user/entities/user.entity';`).

**Path Aliases:**
- Frontend: `@/*` maps to `src/*` (e.g., `@/components/`, `@/utils/`).
- Backend: Primarily relative paths are used (`./dto/auth.dto`, `../user/entities/user.entity`).

## Error Handling

**Patterns:**
- Backend: Relies on NestJS built-in HTTP Exceptions (e.g., `throw new UnauthorizedException('Invalid credentials');`, `throw new ConflictException(...)` found in `src/modules/auth/auth.service.ts`).
- Frontend: `try-catch` blocks for asynchronous API calls. Also utilizes React Error Boundaries (`src/components/ErrorBoundary.tsx`).

## Logging

**Framework:** `console`

**Patterns:**
- `console.log` heavily used for debugging and operational tracking in frontend hooks (e.g., `console.log('[useDashboard] Reconstructing elements from charts relation')`).
- `console.error` used within catch blocks for API failure reporting (e.g., `console.error("Failed to fetch instructions from backend:", error);`).

## Comments

**When to Comment:**
- Comments are mostly inline and used to explain complex logic, fallbacks, or specific regex behaviors (e.g., `// Hyper-robust regex to catch updateDashboardUI tags` in `src/components/ChatDataSidebar.tsx`).
- "CRITICAL" prefixes are used in comments and parameter descriptions to emphasize AI instruction adherence in `useDashboard.ts`.

**JSDoc/TSDoc:**
- Minimal formal JSDoc usage. Most documentation is embedded in schema definitions or CopilotKit action descriptions.

## Function Design

**Size:**
- Range from small utilities to highly complex handlers (e.g., `useDashboard` hook handler is extensive and handles parsing, deduplication, formatting, and AI prompt context logic).

**Parameters:**
- Frontend hooks accept parameter objects (e.g., `useDashboard({ parsedData: localData = [] })`).
- Backend class methods use standard positional arguments and DTOs for structured data (`login(loginDto: LoginDto)`).

**Return Values:**
- Handlers often return comprehensive state objects and API functions (e.g., `useDashboard` returns `{ dashboard, updateDashboard, prepareElement, saveDashboard, ... }`).
- Backend controllers and services return Promises of DTOs or entity models.

## Module Design

**Exports:**
- Named exports are predominant in both frontend components and backend services/modules (`export const ChatDataSidebar = ...`, `export class AuthService`).
- Default exports are used for Next.js app router pages (`export default function Page()`).

**Barrel Files:**
- Not prominently utilized. Imports typically address the specific target file directly.
