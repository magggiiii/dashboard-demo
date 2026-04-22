# Testing Patterns

**Analysis Date:** 2024-05-24

## Test Framework

**Runner:**
- Jest (Version ^30.0.0) with `ts-jest` for the backend (`gui-dashboard-backend-feature-langfuse`).
- No testing framework is currently configured for the frontend (`gui-dashboard-frontend-main`).

**Assertion Library:**
- Built-in Jest `expect`.

**Run Commands (Backend):**
```bash
npm run test           # Run all unit tests
npm run test:watch     # Run unit tests in watch mode
npm run test:cov       # Generate test coverage report
npm run test:e2e       # Run End-to-End tests
```

## Test File Organization

**Location:**
- Unit Tests: Co-located with the source files in the `src/` directory.
- End-to-End Tests: Separated into a dedicated `test/` directory at the project root.

**Naming:**
- Unit Tests: `*.spec.ts` (e.g., `src/app.controller.spec.ts`).
- E2E Tests: `*.e2e-spec.ts` (e.g., `test/app.e2e-spec.ts`).

**Structure:**
```
gui-dashboard-backend-feature-langfuse/
├── src/
│   ├── app.controller.ts
│   └── app.controller.spec.ts    # Co-located unit test
└── test/
    ├── app.e2e-spec.ts           # Separate E2E test
    └── jest-e2e.json             # E2E specific Jest config
```

## Test Structure

**Suite Organization:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Setup and module initialization
  });

  describe('root', () => {
    it('should behave as expected', () => {
      // Assertions
    });
  });
});
```

**Patterns:**
- **Setup:** Uses `beforeEach` to set up the testing module using NestJS's `Test.createTestingModule({...}).compile()`.
- **Teardown:** Managed by Jest and NestJS testing utilities.
- **Assertion:** Uses standard `expect(result).toBe(expected)` matchers.

## Mocking

**Framework:** Jest and `@nestjs/testing`.

**Patterns:**
```typescript
const app: TestingModule = await Test.createTestingModule({
  controllers: [AppController],
  providers: [
    // Standard service or mocked provider
    AppService 
  ],
}).compile();
```

**What to Mock:**
- Database repositories (`TypeORM` Repositories).
- External services (e.g., AWS S3 clients, Langchain).
- Guards and strategies (e.g., `JwtService`).

**What NOT to Mock:**
- Pure functions and simple DTO validation logic.

## Fixtures and Factories

**Test Data:**
- Frontend contains some mock data configurations (`gui-dashboard-frontend-main/mock-chart-data.json`, `src/data/mockData.ts`) used for UI development rather than automated testing.
- Backend tests construct required entities dynamically in test setups.

**Location:**
- Mock data in frontend is placed in `src/data/` or project root.

## Coverage

**Requirements:** None explicitly enforced in the repository configuration.

**View Coverage:**
```bash
npm run test:cov
```
- Configured to collect coverage from `**/*.(t|j)s` inside the `src/` directory, outputting to `../coverage`.

## Test Types

**Unit Tests:**
- Backend: Tests focus on individual Controllers and Services. Heavily relies on mocking dependencies via NestJS DI container.

**Integration Tests:**
- Handled implicitly alongside E2E tests, verifying the interaction between controllers, services, and the database.

**E2E Tests:**
- Backend: Uses `supertest` to perform HTTP requests against the running NestJS application.
- Target the fully initialized application module (`AppModule`).

## Common Patterns

**Async Testing:**
```typescript
it('should perform async operation', async () => {
  const result = await someAsyncServiceMethod();
  expect(result).toBeDefined();
});
```

**Error Testing:**
- Typically done by wrapping the call and asserting the thrown NestJS exception (e.g., `ConflictException`, `UnauthorizedException`).
