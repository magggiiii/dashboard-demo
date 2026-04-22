# External Integrations

**Analysis Date:** 2024-10-24

## APIs & External Services

**AI Platforms:**
- OpenAI - Base LLM for generation and copilot
  - SDK/Client: `openai`, `@copilotkit/runtime`
  - Locations: `gui-dashboard-backend-feature-langfuse/src/modules/copilotkit/copilotkit.controller.ts`
- CopilotKit - Agent and conversational runtime
  - SDK/Client: `@copilotkit/runtime`, `@copilotkit/react-core`

**Observability:**
- Langfuse - AI telemetry and tracing
  - SDK/Client: `langfuse`
  - Locations: `gui-dashboard-backend-feature-langfuse/src/modules/copilotkit/copilotkit.controller.ts`, `gui-dashboard-backend-feature-langfuse/src/modules/langfuse/langfuse.service.ts`

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
  - Client: `typeorm`, `pg`

**File Storage:**
- AWS S3
  - Connection: via standard AWS auth
  - Client: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
  - Locations: `gui-dashboard-backend-feature-langfuse/src/modules/s3/s3.service.ts`

**Caching:**
- None explicitly configured (no Redis or Memcached clients)

## Authentication & Identity

**Auth Provider:**
- Custom JWT with Passport OAuth strategies
  - Implementation: JWT, Google OAuth (`passport-google-oauth20`), GitHub OAuth (`passport-github2`)
  - Config: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`

## Monitoring & Observability

**Error Tracking:**
- Langfuse for LLM traces/errors (`observeOpenAI`)

**Logs:**
- Built-in NestJS/TypeORM logging based on `NODE_ENV`

## CI/CD & Deployment

**Hosting:**
- Unspecified

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
- `FRONTEND_URL`, `PORT`

**Secrets location:**
- `.env` files (not committed, referenced in `gui-dashboard-backend-feature-langfuse/.env.example`)

## Webhooks & Callbacks

**Incoming:**
- OAuth Callbacks: `/auth/google/callback`, `/auth/github/callback`

**Outgoing:**
- None detected

---

*Integration audit: 2024-10-24*