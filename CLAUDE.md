<!-- GSD:project-start source:PROJECT.md -->
## Project

**CopilotKit AI Dashboard – Architecture Audit**

A deep architectural audit of a full-stack AI-driven dashboard system (Next.js frontend + NestJS backend). The audit aims to understand the real system implementation—not just the intended design—by uncovering hidden complexity, identifying risks, and surfacing trade-offs to inform a prioritized refactor plan.

**Core Value:** Provide a concrete, evidence-backed architectural audit of the real system to guide actionable refactoring and scaling decisions.

### Constraints

- **Evidence-backed**: All findings must reference actual files, imports, or code patterns.
- **Concrete insights**: Call out uncertainty explicitly instead of guessing.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ES2023 (Backend) / ES2017 (Frontend) - `src/**/*.ts`, `src/**/*.tsx`
- JavaScript - Configuration and build utilities (`*.mjs`, `*.js`)
- CSS - Styling via Tailwind (`app/globals.css`)
## Runtime
- Node.js v22
- npm
- Lockfile: present (`package-lock.json`)
## Frameworks
- Next.js 16.1.6 - Frontend framework
- React 19.2.3 - UI library
- NestJS 11.0.1 - Backend framework
- Jest 30.0.0 - Backend testing and E2E
- Nest CLI 11.0.0 - Backend tooling
- Tailwind CSS v4 / PostCSS - Styling
- ESLint v9 & Prettier - Linting and formatting
## Key Dependencies
- `@copilotkit/react-core`, `@copilotkit/runtime` 1.54.x - AI application integration
- `openai` 6.33.0 / `@ai-sdk/groq` - AI Model connectivity
- `langfuse` 3.38.6 - AI Observability and tracing
- `recharts` 3.7.0 & `ag-grid-community` 35.1.0 - Frontend data visualization
- `typeorm` 0.3.28 - Relational ORM mapping
- `@aws-sdk/client-s3` 3.999.0 - Cloud storage client
- `passport` (JWT, Google, GitHub) - Authentication middleware
## Configuration
- `.env` files (templated via `.env.example`)
- Key configs required: Database credentials, JWT Secret, OAuth IDs
- `tsconfig.json` (TypeScript)
- `next.config.ts` (Next.js)
- `nest-cli.json` (NestJS)
## Platform Requirements
- Node.js & npm
- PostgreSQL
- Node.js environment
- Managed PostgreSQL database
- AWS S3 Bucket
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Frontend Components: PascalCase (e.g., `src/components/ChatDataSidebar.tsx`, `src/components/AuthGuard.tsx`).
- Frontend Hooks: camelCase (e.g., `src/hooks/useDashboard.ts`).
- Frontend Utils/Lib: kebab-case (e.g., `src/utils/dashboard-utils.ts`, `src/lib/dashboard.ts`).
- Next.js Routes: lowercase, standard Next.js naming (e.g., `src/app/page.tsx`, `src/app/layout.tsx`).
- Backend Code: kebab-case with type suffix (e.g., `src/modules/auth/auth.service.ts`, `src/app.controller.ts`).
- camelCase for standard functions and methods.
- PascalCase for React Functional Components (often implemented as arrow functions).
- Example: `updateDashboard`, `parseBackendDashboard`, `FilteredAssistantMessage`.
- camelCase for instances, primitives, arrays, etc.
- UPPER_SNAKE_CASE for constants (e.g., `INITIAL_MESSAGE` in `src/components/ChatDataSidebar.tsx`).
- PascalCase for interfaces, types, and DTOs (e.g., `Dashboard`, `UIElement`, `UseDashboardProps`, `SignupDto`).
## Code Style
- Prettier (Configured via `.prettierrc` in backend).
- Settings: `{ "singleQuote": true, "trailingComma": "all" }`.
- ESLint used across both frontend and backend.
- Frontend uses `eslint-config-next` (`eslint.config.mjs`).
- Backend uses `@typescript-eslint` recommended and Prettier plugin (`eslint.config.mjs`). Warnings on `no-floating-promises` and `no-unsafe-argument`.
## Import Organization
- Frontend: `@/*` maps to `src/*` (e.g., `@/components/`, `@/utils/`).
- Backend: Primarily relative paths are used (`./dto/auth.dto`, `../user/entities/user.entity`).
## Error Handling
- Backend: Relies on NestJS built-in HTTP Exceptions (e.g., `throw new UnauthorizedException('Invalid credentials');`, `throw new ConflictException(...)` found in `src/modules/auth/auth.service.ts`).
- Frontend: `try-catch` blocks for asynchronous API calls. Also utilizes React Error Boundaries (`src/components/ErrorBoundary.tsx`).
## Logging
- `console.log` heavily used for debugging and operational tracking in frontend hooks (e.g., `console.log('[useDashboard] Reconstructing elements from charts relation')`).
- `console.error` used within catch blocks for API failure reporting (e.g., `console.error("Failed to fetch instructions from backend:", error);`).
## Comments
- Comments are mostly inline and used to explain complex logic, fallbacks, or specific regex behaviors (e.g., `// Hyper-robust regex to catch updateDashboardUI tags` in `src/components/ChatDataSidebar.tsx`).
- "CRITICAL" prefixes are used in comments and parameter descriptions to emphasize AI instruction adherence in `useDashboard.ts`.
- Minimal formal JSDoc usage. Most documentation is embedded in schema definitions or CopilotKit action descriptions.
## Function Design
- Range from small utilities to highly complex handlers (e.g., `useDashboard` hook handler is extensive and handles parsing, deduplication, formatting, and AI prompt context logic).
- Frontend hooks accept parameter objects (e.g., `useDashboard({ parsedData: localData = [] })`).
- Backend class methods use standard positional arguments and DTOs for structured data (`login(loginDto: LoginDto)`).
- Handlers often return comprehensive state objects and API functions (e.g., `useDashboard` returns `{ dashboard, updateDashboard, prepareElement, saveDashboard, ... }`).
- Backend controllers and services return Promises of DTOs or entity models.
## Module Design
- Named exports are predominant in both frontend components and backend services/modules (`export const ChatDataSidebar = ...`, `export class AuthService`).
- Default exports are used for Next.js app router pages (`export default function Page()`).
- Not prominently utilized. Imports typically address the specific target file directly.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Frontend App Router**: Next.js App Router with React Server Components and Client Components
- **Modular Backend**: NestJS modular architecture with Dependency Injection
- **AI-Driven UI Generation**: CopilotKit used for interpreting intent and triggering dashboard UI changes via `useCopilotAction`
- **RESTful API**: Communication between Next.js client and NestJS backend via standard REST endpoints
## Layers
- Purpose: Render views, pages, and layout structure
- Location: `gui-dashboard-frontend-main/src/app/`
- Contains: Next.js page components (`page.tsx`, `layout.tsx`)
- Depends on: Components, Contexts, Hooks
- Purpose: Reusable UI widgets and specific feature sections
- Location: `gui-dashboard-frontend-main/src/components/`
- Contains: React components (`GenUIRuntime.tsx`, charts, sidebars)
- Depends on: Contexts, Types, Utils, Recharts, CopilotKit UI
- Purpose: Application state management and AI agent tooling
- Location: `gui-dashboard-frontend-main/src/hooks/` and `src/context/`
- Contains: React hooks (`useDashboard.ts`) and contexts (`AuthContext.tsx`)
- Depends on: CopilotKit core, API lib layer
- Purpose: REST API clients for backend communication
- Location: `gui-dashboard-frontend-main/src/lib/`
- Contains: Axios-based service functions (`dashboard.ts`, `auth.ts`, `chat.ts`)
- Used by: State & Logic Layer
- Purpose: Handle incoming HTTP requests and map them to services
- Location: `gui-dashboard-backend-feature-langfuse/src/modules/**/*.controller.ts`
- Contains: NestJS controllers (e.g., `auth.controller.ts`)
- Depends on: Services, DTOs (Data Transfer Objects)
- Purpose: Business logic and database operations
- Location: `gui-dashboard-backend-feature-langfuse/src/modules/**/*.service.ts`
- Contains: NestJS services (e.g., `dashboard.service.ts`)
- Depends on: TypeORM Repositories, Entities
## Data Flow
- Client-side data sets and AI-generated component structure are managed in `useState` inside the `useDashboard` hook.
- Global authentication state is managed via `AuthContext`.
- Chat history state is synced via `CopilotChatContext`.
## Key Abstractions
- Purpose: Standardized data structure representing a dashboard widget (Chart, Metric, Table)
- Examples: `gui-dashboard-frontend-main/src/types/schema.ts`
- Pattern: Discriminated unions or tagged objects specifying visualization type, configuration, and data
- Purpose: Represents a collection of UIElements and their layout logic
- Examples: 
- Pattern: Composite object storing serialized layout configuration
## Entry Points
- Location: `gui-dashboard-frontend-main/src/app/page.tsx`
- Triggers: User navigation
- Responsibilities: Main dashboard layout, context initialization, data loading, AI tool synchronization
- Location: `gui-dashboard-backend-feature-langfuse/src/main.ts`
- Triggers: Server execution
- Responsibilities: NestJS bootstrap, CORS setup, global validation pipe configuration, listening on port
## Error Handling
- **Frontend boundary**: `ErrorBoundary.tsx` prevents full application crashes on component failures
- **Frontend API**: Standard `try/catch` in data fetching methods inside hooks (`useDashboard.ts`) and API abstractions (`lib/auth.ts`)
- **Backend**: NestJS `ValidationPipe` for incoming DTOs (`main.ts`) and standard exception filters for HTTP errors
## Cross-Cutting Concerns
- JWT-based authentication
- Handled via NestJS Passport strategies on backend (`JwtStrategy`, `GithubStrategy`)
- Protected by `AuthGuard` in frontend routing (`src/components/AuthGuard.tsx`)
- Handled strictly on backend entry via `class-validator` and `class-transformer` decorators in DTOs
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
