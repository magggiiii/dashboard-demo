# Architecture

**Analysis Date:** 2024-05-23

## Pattern Overview

**Overall:** Client-Server Monorepo with AI-driven Generative UI

**Key Characteristics:**
- **Frontend App Router**: Next.js App Router with React Server Components and Client Components
- **Modular Backend**: NestJS modular architecture with Dependency Injection
- **AI-Driven UI Generation**: CopilotKit used for interpreting intent and triggering dashboard UI changes via `useCopilotAction`
- **RESTful API**: Communication between Next.js client and NestJS backend via standard REST endpoints

## Layers

**Frontend Presentation Layer:**
- Purpose: Render views, pages, and layout structure
- Location: `gui-dashboard-frontend-main/src/app/`
- Contains: Next.js page components (`page.tsx`, `layout.tsx`)
- Depends on: Components, Contexts, Hooks

**Frontend Component Layer:**
- Purpose: Reusable UI widgets and specific feature sections
- Location: `gui-dashboard-frontend-main/src/components/`
- Contains: React components (`GenUIRuntime.tsx`, charts, sidebars)
- Depends on: Contexts, Types, Utils, Recharts, CopilotKit UI

**Frontend State & Logic Layer:**
- Purpose: Application state management and AI agent tooling
- Location: `gui-dashboard-frontend-main/src/hooks/` and `src/context/`
- Contains: React hooks (`useDashboard.ts`) and contexts (`AuthContext.tsx`)
- Depends on: CopilotKit core, API lib layer

**Frontend API Integration Layer:**
- Purpose: REST API clients for backend communication
- Location: `gui-dashboard-frontend-main/src/lib/`
- Contains: Axios-based service functions (`dashboard.ts`, `auth.ts`, `chat.ts`)
- Used by: State & Logic Layer

**Backend Controller Layer:**
- Purpose: Handle incoming HTTP requests and map them to services
- Location: `gui-dashboard-backend-feature-langfuse/src/modules/**/*.controller.ts`
- Contains: NestJS controllers (e.g., `auth.controller.ts`)
- Depends on: Services, DTOs (Data Transfer Objects)

**Backend Service Layer:**
- Purpose: Business logic and database operations
- Location: `gui-dashboard-backend-feature-langfuse/src/modules/**/*.service.ts`
- Contains: NestJS services (e.g., `dashboard.service.ts`)
- Depends on: TypeORM Repositories, Entities

## Data Flow

**AI Dashboard Generation Flow:**
1. **User Input**: User submits a natural language request via the chat interface (`CopilotChatContext`).
2. **Context Enrichment**: `useCopilotReadable` in `useDashboard.ts` provides schema and currently connected dataset to the AI agent.
3. **AI Processing**: CopilotKit determines necessary UI modifications and invokes the exposed tool.
4. **Action Execution**: The `updateDashboardUI` handler (`useCopilotAction`) parses the AI's payload and calls `updateDashboard()`.
5. **UI Update**: `prepareElement` transforms the payload and local data into a standardized `UIElement`, updating local state.
6. **Persistence**: An auto-save effect in `app/page.tsx` detects the state change and calls the backend REST API (`updateDashboardToDb`) to persist the layout.

**State Management:**
- Client-side data sets and AI-generated component structure are managed in `useState` inside the `useDashboard` hook.
- Global authentication state is managed via `AuthContext`.
- Chat history state is synced via `CopilotChatContext`.

## Key Abstractions

**UIElement:**
- Purpose: Standardized data structure representing a dashboard widget (Chart, Metric, Table)
- Examples: `gui-dashboard-frontend-main/src/types/schema.ts`
- Pattern: Discriminated unions or tagged objects specifying visualization type, configuration, and data

**Dashboard / Dashboard Entity:**
- Purpose: Represents a collection of UIElements and their layout logic
- Examples: 
  - Frontend: `gui-dashboard-frontend-main/src/hooks/useDashboard.ts`
  - Backend: `gui-dashboard-backend-feature-langfuse/src/modules/dashboard/entities/dashboard.entity.ts`
- Pattern: Composite object storing serialized layout configuration

## Entry Points

**Frontend Application:**
- Location: `gui-dashboard-frontend-main/src/app/page.tsx`
- Triggers: User navigation
- Responsibilities: Main dashboard layout, context initialization, data loading, AI tool synchronization

**Backend Application:**
- Location: `gui-dashboard-backend-feature-langfuse/src/main.ts`
- Triggers: Server execution
- Responsibilities: NestJS bootstrap, CORS setup, global validation pipe configuration, listening on port

## Error Handling

**Strategy:** Global and localized catching

**Patterns:**
- **Frontend boundary**: `ErrorBoundary.tsx` prevents full application crashes on component failures
- **Frontend API**: Standard `try/catch` in data fetching methods inside hooks (`useDashboard.ts`) and API abstractions (`lib/auth.ts`)
- **Backend**: NestJS `ValidationPipe` for incoming DTOs (`main.ts`) and standard exception filters for HTTP errors

## Cross-Cutting Concerns

**Authentication:** 
- JWT-based authentication
- Handled via NestJS Passport strategies on backend (`JwtStrategy`, `GithubStrategy`)
- Protected by `AuthGuard` in frontend routing (`src/components/AuthGuard.tsx`)

**Validation:**
- Handled strictly on backend entry via `class-validator` and `class-transformer` decorators in DTOs

---

*Architecture analysis: 2024-05-23*