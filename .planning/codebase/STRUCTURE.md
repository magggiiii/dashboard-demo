# Codebase Structure

**Analysis Date:** 2024-05-23

## Directory Layout

```
/
├── gui-dashboard-backend-feature-langfuse/ # NestJS Backend
│   ├── src/
│   │   ├── config/                         # Configuration setup (TypeORM)
│   │   ├── modules/                        # Feature-based module grouping
│   │   │   ├── auth/                       # Auth module (Strategies, Guards)
│   │   │   ├── chart/                      # Chart storage/endpoints
│   │   │   ├── chat/                       # Copilot/Chat history management
│   │   │   ├── copilotkit/                 # CopilotKit specific integrations
│   │   │   ├── dashboard/                  # Dashboard layout management
│   │   │   ├── file/                       # File handling 
│   │   │   ├── langfuse/                   # LLM observablity integration
│   │   │   ├── s3/                         # AWS S3 integration module
│   │   │   └── user/                       # User management module
│   │   └── main.ts                         # Backend entry point
│   └── test/                               # e2e tests
└── gui-dashboard-frontend-main/            # Next.js Frontend
    ├── public/                             # Static assets
    └── src/
        ├── app/                            # App Router views and layouts
        │   ├── auth/                       # OAuth callbacks
        │   ├── login/                      # Login page
        │   ├── signup/                     # Signup page
        │   └── page.tsx                    # Main dashboard view
        ├── components/                     # Shared React components
        │   ├── charts/                     # Recharts data visualizations
        │   └── GenUIRuntime.tsx            # Dynamic widget renderer
        ├── context/                        # React Context providers
        ├── data/                           # Mock/seed data
        ├── hooks/                          # Custom React Hooks
        ├── lib/                            # API client wrappers
        ├── types/                          # TypeScript type definitions
        └── utils/                          # Utility functions
```

## Directory Purposes

**`gui-dashboard-backend-feature-langfuse/src/modules/`:**
- Purpose: Group feature-specific logic following the NestJS modular architecture
- Contains: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `entities/`, `dto/`
- Key files: `auth/auth.controller.ts`, `dashboard/dashboard.service.ts`

**`gui-dashboard-frontend-main/src/components/charts/`:**
- Purpose: Visualization implementations for the dashboard
- Contains: React components wrapping the `recharts` library
- Key files: `AreaChart.tsx`, `BarChart.tsx`, `ChartContainer.tsx`

**`gui-dashboard-frontend-main/src/hooks/`:**
- Purpose: Encapsulate stateful logic and CopilotKit integrations
- Contains: Custom React hooks
- Key files: `useDashboard.ts` (Core logic for AI UI manipulation)

## Key File Locations

**Entry Points:**
- `gui-dashboard-backend-feature-langfuse/src/main.ts`: NestJS server bootstrap
- `gui-dashboard-frontend-main/src/app/page.tsx`: Main Dashboard UI entry point

**Configuration:**
- `gui-dashboard-backend-feature-langfuse/src/config/typeorm.config.ts`: Database connection settings
- `gui-dashboard-frontend-main/next.config.ts`: Next.js bundler and server configuration

**Core Logic:**
- `gui-dashboard-frontend-main/src/hooks/useDashboard.ts`: Manages generative AI layout actions and state
- `gui-dashboard-frontend-main/src/components/GenUIRuntime.tsx`: Dynamically renders widgets based on state

**Testing:**
- `gui-dashboard-backend-feature-langfuse/test/app.e2e-spec.ts`: End-to-end backend tests

## Naming Conventions

**Files:**
- Backend code: kebab-case with type suffix (`auth.controller.ts`, `user.entity.ts`, `app.module.ts`)
- Frontend Components: PascalCase (`AuthGuard.tsx`, `GenUIRuntime.tsx`)
- Frontend Hooks/Utils: camelCase or kebab-case (`useDashboard.ts`, `dashboard-utils.ts`)

**Directories:**
- Feature directories (backend): kebab-case (`copilotkit`, `dashboard`)
- App Router directories: kebab-case matching route paths (`signup`, `callback`)

## Where to Add New Code

**New Backend API Feature:**
- Primary code: Create a new folder under `gui-dashboard-backend-feature-langfuse/src/modules/[feature-name]/`
- Ensure to create `*.module.ts`, `*.controller.ts`, `*.service.ts`, and register the module in `app.module.ts`

**New Dashboard Visualization (Frontend):**
- Implementation: Add the chart component to `gui-dashboard-frontend-main/src/components/charts/`
- Register it in `gui-dashboard-frontend-main/src/components/GenUIRuntime.tsx`
- Add definition to `schema.ts` inside `src/types/`

**New API Client Logic (Frontend):**
- Shared API definitions: `gui-dashboard-frontend-main/src/lib/`

---

*Structure analysis: 2024-05-23*