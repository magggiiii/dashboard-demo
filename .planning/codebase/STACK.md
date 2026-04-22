# Technology Stack

**Analysis Date:** 2024-10-24

## Languages

**Primary:**
- TypeScript ES2023 (Backend) / ES2017 (Frontend) - `src/**/*.ts`, `src/**/*.tsx`

**Secondary:**
- JavaScript - Configuration and build utilities (`*.mjs`, `*.js`)
- CSS - Styling via Tailwind (`app/globals.css`)

## Runtime

**Environment:**
- Node.js v22

**Package Manager:**
- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.1.6 - Frontend framework
- React 19.2.3 - UI library
- NestJS 11.0.1 - Backend framework

**Testing:**
- Jest 30.0.0 - Backend testing and E2E

**Build/Dev:**
- Nest CLI 11.0.0 - Backend tooling
- Tailwind CSS v4 / PostCSS - Styling
- ESLint v9 & Prettier - Linting and formatting

## Key Dependencies

**Critical:**
- `@copilotkit/react-core`, `@copilotkit/runtime` 1.54.x - AI application integration
- `openai` 6.33.0 / `@ai-sdk/groq` - AI Model connectivity
- `langfuse` 3.38.6 - AI Observability and tracing
- `recharts` 3.7.0 & `ag-grid-community` 35.1.0 - Frontend data visualization

**Infrastructure:**
- `typeorm` 0.3.28 - Relational ORM mapping
- `@aws-sdk/client-s3` 3.999.0 - Cloud storage client
- `passport` (JWT, Google, GitHub) - Authentication middleware

## Configuration

**Environment:**
- `.env` files (templated via `.env.example`)
- Key configs required: Database credentials, JWT Secret, OAuth IDs

**Build:**
- `tsconfig.json` (TypeScript)
- `next.config.ts` (Next.js)
- `nest-cli.json` (NestJS)

## Platform Requirements

**Development:**
- Node.js & npm
- PostgreSQL

**Production:**
- Node.js environment
- Managed PostgreSQL database
- AWS S3 Bucket

---

*Stack analysis: 2024-10-24*