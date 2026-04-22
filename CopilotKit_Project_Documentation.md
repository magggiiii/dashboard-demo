  
**CopilotKit AI Dashboard**

Comprehensive Project Documentation

Version 1.0.0

**Status: Active Development**

# **1\. Executive Summary**

CopilotKit AI Dashboard is a full-stack, AI-powered business intelligence platform that enables users to upload structured data files (spreadsheets, CSVs) and instantly generate interactive, customizable visual dashboards through a conversational AI interface.

The system is composed of two primary applications:

* copilotkit/ — NestJS REST API backend (TypeScript)

* copilotkit\_frontend/ — Next.js Gen-UI frontend (TypeScript \+ React 19\)

The platform leverages CopilotKit's agentic runtime, Bifrost (custom OpenAI-compatible LLM gateway), Langfuse for LLM observability, LangSmith for tracing, and AWS S3 for file storage. Persisted state is managed via a PostgreSQL relational database using TypeORM.

## **Core Value Proposition**

Users interact with a chat interface to instruct the AI to build dashboard panels — charts, tables, and KPI metrics — from uploaded data, entirely without writing code. The AI dynamically renders UI elements (Gen-UI) in real time, and all configurations are persisted for future sessions.

# **2\. System Architecture**

| Property | Details |
| :---- | :---- |
| Design Pattern | Modular Monolith (NestJS modules) \+ Component-based UI (React) |
| Communication | REST HTTP \+ Server-Sent Events (SSE) for AI streaming responses |
| Auth Strategy | OAuth 2.0 (Google, GitHub) \+ JWT Bearer Tokens |
| Persistence | PostgreSQL via TypeORM with entity synchronization |
| File Storage | AWS S3 with pre-signed URLs and multer-based upload handling |
| AI Gateway | Bifrost — OpenAI-compatible LLM gateway (self-hosted) |

## **2.1  Bifrost AI Gateway**

Bifrost is a self-hosted OpenAI-compatible API gateway that provides unified access to multiple LLM providers (Groq, OpenAI, Anthropic, etc.) through a single REST API. The CopilotKit backend connects to Bifrost instead of directly to LLM providers, enabling flexible model switching, centralized API key management, and consistent API contracts.

### **Benefits**

* **Unified API —** Single endpoint for multiple LLM providers

* **Model Flexibility —** Switch models without code changes

* **Centralized Auth —** Single API key for all LLM calls

* **Observability —** Langfuse traces all requests through Bifrost

* **Rate Limiting —** Bifrost can enforce request limits per model

* **Cost Control —** Centralized usage tracking per provider

### **Supported Models**

| Provider | Model |
| :---- | :---- |
| Groq | llama-3.3-70b-versatile  |
| Groq | mixtral-8x7b-32768 |
| Hugging Face | llama-3.3-70b-versatile  |

### **Integration Steps**

1. SDK Initialization — The backend creates an OpenAI client instance with Bifrost baseURL and API key.

2. Langfuse Observability Wrapping — If Langfuse is enabled, the OpenAI client is wrapped with observeOpenAI() for tracing and metrics.

3. Adapter Configuration — An OpenAIAdapter is created with the model name from BIFROST\_MODEL config.

4. Runtime Integration — The adapter is passed to CopilotRuntime along with the CopilotKit agent definitions.

# **3\. Technology Stack**

## **3.1  Backend (copilotkit/)**

| Category | Technology | Version |
| :---- | :---- | :---- |
| Runtime | Node.js | LTS |
| Framework | NestJS | ^11.0.1 |
| Language | TypeScript | ^5.7.3 |
| ORM | TypeORM | ^0.3.28 |
| Database Driver | pg (PostgreSQL) | ^8.18.0 |
| Auth | Passport.js (JWT, Google, GitHub OAuth2) | ^0.7.0 |
| JWT | @nestjs/jwt | ^11.0.2 |
| Password Hashing | bcrypt | ^6.0.0 |
| Validation | class-validator \+ class-transformer | ^0.14.3 / ^0.5.1 |
| AI SDK (Groq) | @ai-sdk/groq | ^3.0.29 |
| CopilotKit Runtime | @copilotkit/runtime | ^1.54.1 |
| LLM (OpenAI) | openai | ^6.33.0 |
| AI Orchestration | @langchain/core, @langchain/langgraph | ^1.1.33 / ^1.2.3 |
| Observability | langfuse | ^3.38.6 |
| File Uploads | multer | ^2.0.2 |
| Cloud Storage | @aws-sdk/client-s3, s3-request-presigner | ^3.999.0 |
| Config | @nestjs/config | ^4.0.3 |
| Testing | Jest \+ Supertest | ^30.0.0 / ^7.0.0 |
| Linting | ESLint \+ Prettier | ^9.18.0 / ^3.4.2 |

## **3.2  Frontend (copilotkit\_frontend/)**

| Category | Technology | Version |
| :---- | :---- | :---- |
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | ^5 |
| CopilotKit React Core | @copilotkit/react-core | ^1.51.4 |
| CopilotKit React UI | @copilotkit/react-ui | ^1.51.4 |
| Styling | Tailwind CSS | ^4 |
| Charts | Recharts | ^3.7.0 |
| Data Visualization | D3.js | ^7.9.0 |
| Data Grid | AG Grid (Community) | ^35.1.0 |
| HTTP Client | Axios | ^1.13.5 |
| Schema Validation | Zod | ^3.25.76 |
| Spreadsheet Parsing | xlsx | ^0.18.5 |
| Icons | lucide-react | ^0.563.0 |
| OpenAI (frontend) | openai | ^6.19.0 |
| Metadata | reflect-metadata | ^0.2.2 |

# **4\. Project Structure**

## **4.1  Repository Root**

/Copilotkit

├── copilotkit/                  \# Backend NestJS application

├── copilotkit\_frontend/         \# Frontend Next.js application

├── PROJECT\_STRUCTURE.md         \# High-level repo overview

├── test\_response.json           \# Sample API response (dev artifact)

├── test\_stream.txt              \# Sample streaming output (dev artifact)

└── test\_streaming\_response.txt  \# Extended streaming sample (dev artifact)

## **4.2  Backend Directory Tree (copilotkit/)**

copilotkit/src/

├── app.module.ts            \# Root NestJS module (all imports)

├── app.controller.ts        \# Root health/ping controller

├── main.ts                  \# Bootstrap (CORS, validation pipe, port)

├── config/typeorm.config.ts \# TypeORM async factory config

└── modules/

    ├── auth/                \# Auth module (OAuth \+ JWT)

    ├── user/                \# User profile module

    ├── dashboard/           \# Dashboard CRUD module

    ├── chart/               \# Chart management module

    ├── chat/                \# Chat/messaging module

    ├── file/                \# File metadata tracking

    ├── s3/                  \# AWS S3 integration

    ├── copilotkit/          \# CopilotKit runtime integration

    ├── langfuse/            \# Langfuse LLM observability

    ├── ai/                  \# AI agent logic

    └── copilot/             \# Copilot coordination

## **4.3  Frontend Directory Tree (copilotkit\_frontend/)**

copilotkit\_frontend/src/

├── app/page.tsx                   \# Main entry page

├── components/

│   ├── AuthGuard.tsx              \# Route auth protection

│   ├── CopilotProvider.tsx        \# CopilotKit context wrapper

│   ├── ChatDataSidebar.tsx        \# AI chat panel component

│   ├── DataConnectionSidebar.tsx  \# File upload UI component

│   ├── EmptyStateLanding.tsx      \# Landing/onboarding state

│   ├── ErrorBoundary.tsx          \# React error boundary

│   ├── GenUIRuntime.tsx           \# Dynamic AI-driven UI renderer

│   ├── SpreadsheetPreview.tsx     \# Parsed spreadsheet preview

│   └── charts/                    \# Chart component library (15 types)

├── context/

│   ├── AuthContext.tsx            \# Auth state (JWT, user)

│   └── CopilotChatContext.tsx     \# Chat message state

├── hooks/useDashboard.ts          \# Core dashboard state hook

├── lib/                           \# Axios API client wrappers

├── types/schema.ts                \# Zod schemas \+ TypeScript types

└── utils/                         \# Aggregation & JSON helpers

# **5\. Backend Module Specifications**

## **Auth Module**

Handles user authentication via Google OAuth 2.0, GitHub OAuth 2.0, and JWT. On successful OAuth callback, a JWT access token is issued and returned to the frontend. All protected routes use the JwtAuthGuard.

| Method | Path | Description |
| :---- | :---- | :---- |
| GET | /auth/google | Initiate Google OAuth |
| GET | /auth/google/callback | Google OAuth callback → JWT |
| GET | /auth/github | Initiate GitHub OAuth |
| GET | /auth/github/callback | GitHub OAuth callback → JWT |

## **User Module**

Manages user profiles. Stores user identity (name, email, avatar, provider) sourced from OAuth. Exposes endpoints for profile retrieval and update.

| Method | Path | Description |
| :---- | :---- | :---- |
| GET | /users/me | Get authenticated user profile |
| GET | /users/:id | Get user by ID |
| PUT | /users/:id | Update user profile |

## **Dashboard Module**

Core resource of the application. A dashboard belongs to a user and acts as a container for charts, the associated chat session, and layout configuration. Supports full CRUD operations.

| Method | Path | Description |
| :---- | :---- | :---- |
| POST | /dashboards | Create a new dashboard |
| GET | /dashboards | List all dashboards for user |
| GET | /dashboards/:id | Get dashboard by ID |
| PUT | /dashboards/:id | Update dashboard |
| DELETE | /dashboards/:id | Delete dashboard |

## **Chart Module**

Manages individual chart elements within a dashboard. Each chart stores its type identifier, display configuration (axes, series, colors), and raw data payload as JSON. Linked via dashboardId foreign key.

| Method | Path | Description |
| :---- | :---- | :---- |
| POST | /charts | Create chart |
| GET | /charts/dashboard/:dashboardId | List charts for dashboard |
| GET | /charts/:id | Get single chart |
| PUT | /charts/:id | Update chart |
| DELETE | /charts/:id | Delete chart |

## **Chat Module**

Stores conversational AI history associated with each dashboard. Each dashboard has exactly one Chat session which contains an ordered list of ChatMessage records (role: user | assistant). Enables persistent conversation context.

| Method | Path | Description |
| :---- | :---- | :---- |
| GET | /chats/dashboard/:dashboardId | Get chat session |
| GET | /chats/dashboard/:dashboardId/messages | Get all messages |
| POST | /chats/dashboard/:dashboardId/messages | Append message |
| DELETE | /chats/dashboard/:dashboardId/messages | Clear messages |
| PUT | /chats/dashboard/:dashboardId | Update chat title |

## **CopilotKit Module**

Exposes the CopilotKit runtime endpoint consumed by the frontend SDK. Routes AI agentic requests from @copilotkit/react-core through the @copilotkit/runtime server adapter to the configured LLM provider. Connects to Bifrost (OpenAI-compatible gateway) for LLM inference.

| Method | Path | Description |
| :---- | :---- | :---- |
| POST | /copilotkit | Handle AI requests via CopilotRuntime |
| GET | /copilotkit/instructions | Get dynamic instructions from Langfuse |

## **Langfuse Module**

Integrates Langfuse LLM observability. All AI interactions (prompts, completions, latencies, trace IDs) are logged to the Langfuse platform for monitoring, debugging, and evaluation. The OpenAI client is wrapped with observeOpenAI() for automatic tracing.

| Method | Path | Description |
| :---- | :---- | :---- |
| GET | /langfuse/prompt/:name | Retrieve prompt template from Langfuse |

# **6\. Database Schema**

PostgreSQL database managed by TypeORM with entity-based schema synchronization (suitable for development; migrations recommended for production).

### **Entity Relationship**

User (1) ──► (N) Dashboard (1) ──► (N) Chart

                    └──────────► (1) Chat (1) ──► (N) ChatMessage

### **Entity: User**

| Field | Type | Constraint / Notes |
| :---- | :---- | :---- |
| id | UUID | PK, generated |
| email | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | NULLABLE |
| avatar | TEXT | NULLABLE |
| provider | VARCHAR | google | github |
| providerId | VARCHAR | UNIQUE per provider |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | AUTO-UPDATE |

### **Entity: Dashboard**

| Field | Type | Constraint / Notes |
| :---- | :---- | :---- |
| id | UUID | PK, generated |
| name | VARCHAR | NOT NULL |
| description | TEXT | NULLABLE |
| userId | UUID | FK → User.id |
| createdAt | TIMESTAMP |  |
| updatedAt | TIMESTAMP |  |

### **Entity: Chart**

| Field | Type | Constraint / Notes |
| :---- | :---- | :---- |
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | bar|line|pie|area|scatter|... |
| config | JSONB | xAxis, yAxis, series, colors, stacked, aggregation |
| data | JSONB | Array of raw data records |
| dashboardId | UUID | FK → Dashboard.id |
| createdAt | TIMESTAMP |  |
| updatedAt | TIMESTAMP |  |

### **Entity: Chat**

| Field | Type | Constraint / Notes |
| :---- | :---- | :---- |
| id | UUID | PK |
| title | VARCHAR | NULLABLE |
| dashboardId | UUID | FK → Dashboard.id, UNIQUE |
| createdAt | TIMESTAMP |  |
| updatedAt | TIMESTAMP |  |

### **Entity: ChatMessage**

| Field | Type | Constraint / Notes |
| :---- | :---- | :---- |
| id | UUID | PK |
| content | TEXT | NOT NULL |
| role | VARCHAR | user | assistant |
| order | INTEGER | Sequence index |
| chatId | UUID | FK → Chat.id |
| createdAt | TIMESTAMP |  |

# **7\. AI and Gen-UI Data Flow**

**Step 1: Data Upload**

User uploads a spreadsheet (XLSX/CSV) via DataConnectionSidebar. The file is parsed client-side using the xlsx library, previewed in SpreadsheetPreview, then uploaded to the backend → S3 bucket.

**Step 2: AI Prompt Submission**

User types a natural-language instruction in ChatDataSidebar (e.g., "Show me monthly revenue by product as a bar chart"). The prompt is sent to the CopilotKit runtime endpoint via SSE.

**Step 3: CopilotKit Runtime Processing**

The backend CopilotKit runtime receives the request. It forwards to Bifrost (OpenAI-compatible gateway) via the configured OpenAIAdapter using BIFROST\_BASE\_URL and BIFROST\_MODEL.

**Step 4: LLM Inference via Bifrost**

Bifrost routes the request to the configured LLM provider (Groq in default config). The LLM processes the prompt with the CopilotKit agent tools and generates structured tool calls.

**Step 5: Observability (Langfuse \+ LangSmith)**

Langfuse wraps the OpenAI client with observeOpenAI() for tracing prompts, completions, latency, and metadata. LangSmith provides optional client-side tracing.

**Step 6: Tool Call Execution**

The frontend @copilotkit/react-core SDK receives the streamed tool call payload. Registered useCopilotAction handlers parse the arguments, validate them against Zod schemas (UIElementSchema), and dispatch updates to the useDashboard hook.

**Step 7: Gen-UI Rendering**

GenUIRuntime receives validated UIElement descriptors and dynamically renders the appropriate React chart/table/metric component. Data is optionally aggregated by aggregateData() before render.

**Step 8: Persistence**

On user confirmation or auto-save, the frontend calls the backend dashboard and chart CRUD APIs. Chart configurations and data are stored as JSONB in PostgreSQL. Chat messages are appended to the ChatMessage table.

# **8\. Complete API Reference**

**Base URL:** http://localhost:3500

**Auth Header:** Authorization: Bearer {JWT\_TOKEN}

**Content-Type:** application/json

## **8.1  Authentication**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| GET | /auth/google | none | Redirect to Google OAuth |
| GET | /auth/google/callback | none | Google callback → issues JWT |
| GET | /auth/github | none | Redirect to GitHub OAuth |
| GET | /auth/github/callback | none | GitHub callback → issues JWT |

## **8.2  Users**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| GET | /users/me | JWT | Get current user profile |
| GET | /users/:id | JWT | Get user by ID |
| PUT | /users/:id | JWT | Update user profile |

## **8.3  Dashboards**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| POST | /dashboards | JWT | Create dashboard |
| GET | /dashboards | JWT | List user dashboards |
| GET | /dashboards/:id | JWT | Get dashboard |
| PUT | /dashboards/:id | JWT | Update dashboard |
| DELETE | /dashboards/:id | JWT | Delete dashboard |

## **8.4  Charts**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| POST | /charts | JWT | Create chart |
| GET | /charts/dashboard/:dashboardId | JWT | Get charts for dashboard |
| GET | /charts/:id | JWT | Get chart |
| PUT | /charts/:id | JWT | Update chart |
| DELETE | /charts/:id | JWT | Delete chart |

## **8.5  Chat**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| GET | /chats/dashboard/:dashboardId | JWT | Get chat session |
| GET | /chats/dashboard/:dashboardId/messages | JWT | Get all messages |
| POST | /chats/dashboard/:dashboardId/messages | JWT | Append message |
| DELETE | /chats/dashboard/:dashboardId/messages | JWT | Clear messages |
| PUT | /chats/dashboard/:dashboardId | JWT | Update chat title |

## **8.6  CopilotKit Runtime**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| POST | /copilotkit | JWT | CopilotKit agentic runtime (SSE streaming) |
| GET | /copilotkit/instructions | JWT | Get dynamic AI instructions from Langfuse |

## **8.7  Langfuse Observability**

| Method | Path | Auth | Description |
| :---- | :---- | :---- | :---- |
| GET | /langfuse/prompt/:name | JWT | Retrieve prompt template from Langfuse |

# **9\. Environment Configuration**

## **9.1  Backend (.env)**

| Variable | Default / Status | Description |
| :---- | :---- | :---- |
| DB\_HOST | localhost | PostgreSQL host |
| DB\_PORT | 5432 | PostgreSQL port |
| DB\_USERNAME | postgres | Database username |
| DB\_PASSWORD | postgres | Database password |
| DB\_NAME | copilotkit | Database name |
| JWT\_SECRET | REQUIRED | Secret key for JWT signing |
| GOOGLE\_CLIENT\_ID | REQUIRED | Google OAuth 2.0 client ID |
| GOOGLE\_CLIENT\_SECRET | REQUIRED | Google OAuth 2.0 client secret |
| GOOGLE\_CALLBACK\_URL | http://localhost:3000/auth/google/callback | Google auth callback |
| GITHUB\_CLIENT\_ID | REQUIRED | GitHub OAuth app client ID |
| GITHUB\_CLIENT\_SECRET | REQUIRED | GitHub OAuth app client secret |
| GITHUB\_CALLBACK\_URL | http://localhost:3000/auth/github/callback | GitHub auth callback |
| FRONTEND\_URL | http://localhost:5173 | CORS allowed origin |
| PORT | 3500 | Server listen port |
| NODE\_ENV | development | Runtime environment |
| AWS\_ACCESS\_KEY\_ID | REQUIRED for S3 | AWS credentials |
| AWS\_SECRET\_ACCESS\_KEY | REQUIRED for S3 | AWS credentials |
| AWS\_REGION | REQUIRED for S3 | S3 bucket region |
| AWS\_S3\_BUCKET | REQUIRED for S3 | S3 bucket name |
| LANGFUSE\_PUBLIC\_KEY | Optional | Langfuse public key |
| LANGFUSE\_SECRET\_KEY | Optional | Langfuse secret key |
| LANGFUSE\_BASE\_URL | Optional | Langfuse API base URL (default: cloud) |
| BIFROST\_BASE\_URL | http://localhost:8080/v1 | Bifrost gateway base URL |
| BIFROST\_API\_KEY | REQUIRED | Bifrost API key |
| BIFROST\_MODEL | groq/llama-3.3-70b-versatile | Default LLM model |
| LANGSMITH\_TRACING | Optional | Enable LangSmith tracing |
| LANGSMITH\_ENDPOINT | Optional | LangSmith API endpoint |
| LANGSMITH\_API\_KEY | Optional | LangSmith API key |

## **9.2  Frontend (.env.local)**

| Variable | Default / Status | Description |
| :---- | :---- | :---- |
| NEXT\_PUBLIC\_COPILOT\_CLOUD\_API\_KEY | Optional | CopilotKit Cloud API key (or use self-hosted runtime) |
| NEXT\_PUBLIC\_API\_URL | http://localhost:3500 | Backend base URL |
| NEXT\_PUBLIC\_COPILOTKIT\_URL | http://localhost:3500 | CopilotKit runtime URL |
| LANGSMITH\_TRACING | Optional | Enable LangSmith tracing |
| LANGSMITH\_ENDPOINT | Optional | LangSmith API endpoint |
| LANGSMITH\_API\_KEY | Optional | LangSmith API key |
| LANGSMITH\_PROJECT | Optional | LangSmith project name |

# **10\. Setup and Local Development**

## **10.1  Prerequisites**

* Node.js LTS (≥20)

* PostgreSQL ≥14

* AWS account with S3 bucket (for file uploads)

* Google OAuth App credentials

* GitHub OAuth App credentials

* OpenAI or Groq API key

## **10.2  Backend Setup**

5. Step 1: cd copilotkit

6. Step 2: npm install

7. Step 3: cp .env.example .env  \# then fill in all required values

8. Step 4: createdb copilotkit   \# create PostgreSQL database

9. Step 5: npm run start:dev     \# starts on port 3500 with hot-reload

## **10.3  Frontend Setup**

10. Step 1: cd copilotkit\_frontend

11. Step 2: npm install

12. Step 3: cp .env.example .env.local  \# then fill in public env vars

13. Step 4: npm run dev                 \# starts Next.js dev server (default :3000)

## **10.4  NPM Scripts**

| App | Script | Description |
| :---- | :---- | :---- |
| Backend | start:dev | nest start \--watch (hot reload) |
| Backend | start:prod | node dist/main |
| Backend | build | nest build |
| Backend | test | jest |
| Backend | test:e2e | jest \--config ./test/jest-e2e.json |
| Backend | lint | eslint \--fix |
| Frontend | dev | next dev |
| Frontend | build | next build |
| Frontend | start | next start |
| Frontend | lint | eslint |

# **11\. Security Considerations**

| Severity | ID | Description |
| :---- | :---- | :---- |
| **HIGH** | SEC-01 | JWT\_SECRET must be a cryptographically random string ≥32 characters. Never commit the actual secret to version control. |
| **HIGH** | SEC-02 | CORS is currently configured with origin: true (allow all origins). In production, restrict to specific allowed frontend domain(s). |
| **MEDIUM** | SEC-03 | TypeORM synchronize: true is suitable for development only. Production deployments must use migration-based schema changes. |
| **MEDIUM** | SEC-04 | All API routes that mutate data should be protected by JwtAuthGuard. Confirm no endpoints leak data without authentication. |
| **MEDIUM** | SEC-05 | S3 presigned URLs should have a short TTL. Ensure bucket policy blocks public access and only allows pre-signed URL access. |
| **LOW** | SEC-06 | Input validation is enforced globally via ValidationPipe with whitelist:true and forbidNonWhitelisted:true — prevents extra field injection attacks. |
| **LOW** | SEC-07 | Client-side Zod schema validation prevents invalid AI tool output from crashing the UI, but server-side validation should also be enforced. |

# **12\. Production Readiness Checklist**

☐  Set NODE\_ENV=production

☐  Use a strong, random JWT\_SECRET (≥64 chars)

☐  Configure CORS to specific allowed origins

☐  Disable TypeORM synchronize; run proper migrations

☐  Enable HTTPS (TLS certificates via Let's Encrypt or load balancer)

☐  Set up structured application logging (e.g., Winston, Pino)

☐  Configure proper S3 bucket policies and IAM least-privilege roles

☐  Set up CI/CD pipeline (GitHub Actions, etc.)

☐  Monitor with Langfuse for LLM observability

☐  Add rate limiting middleware to prevent API abuse

☐  Set up Docker / container orchestration for deployment

☐  Validate environment variables at startup (fail-fast)

☐  Configure Bifrost gateway in production (secure endpoint, API key management)

☐  Set up Langfuse project and configure environment variables

☐  Configure LangSmith for additional tracing (optional)

# **13\. Known Limitations and Future Work**

## **13.1  Known Limitations**

* **LIM-01 —** No row-level security on dashboards. Any authenticated user could potentially access dashboards by ID if they know or guess the UUID. Ownership checks should be enforced in service layer queries.

* **LIM-02 —** The frontend currently has no dashboard layout persistence mechanism for drag-and-drop grid rearrangement between sessions.

* **LIM-03 —** File uploads are tracked in the DB but there is no file deletion endpoint or S3 lifecycle policy to clean up orphaned files.

* **LIM-04 —** Histogram chart type is implemented by reusing the BarChart component without true bucket/bin calculation logic.

## **13.2  Future Enhancements**

* Enhance the GenUI performance of Copilot in the frontend for improved responsiveness and user experience.

* Dashboard sharing (public links, embed codes)

* Scheduled AI report generation via cron jobs

* Export dashboards to PDF / PNG

* WebSocket real-time collaboration on dashboards

* Custom SQL / database data source connection

* Role-based access control (RBAC) for teams