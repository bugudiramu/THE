# Week 1 Monorepo Setup: Missing Pieces

Based on a detailed audit of the repository against the `@planning/week-01-monorepo-setup.md` blueprint, the following items are missing or require refinement to reach "Day 1" architectural compliance.

## High Priority: Backend (NestJS API) Refinements

The API is functional and includes several Week 2+ features, but it has drifted from the foundational monorepo structure in its core architecture.

| Item | Description | Impact |
|---|---|---|
| `PrismaModule` | Missing global module for the database service. | Current approach (providing `PrismaService` per module) leads to multiple client instances and redundant boilerplate. |
| `HttpExceptionFilter` | Missing global exception filter for structured error logging. | Inconsistent error responses across endpoints and lack of structured logs. |
| Global Architecture | Features are not using a global `PrismaModule`. | Each module currently provides its own `PrismaService`, violating the singleton pattern and "Deliverable 4" spec. |

## Medium Priority: Documentation & Env

| Item | Description | Impact |
|---|---|---|
| App-specific `.env.example` | Root `.env.example` exists, but per-app files are missing. | Developers might have to guess which subset of root envs applies to which app. |

## Suggested Implementation Strategy

The best approach is to fix the core architecture now before the API grows further.

1. **Create `common/prisma.module.ts`**:
   - Define it as a `@Global()` module.
   - Export `PrismaService`.
2. **Refactor `AppModule`**:
   - Import `PrismaModule` at the root level.
3. **Refactor Feature Modules**:
   - Remove `PrismaService` from `providers` in all modules (Catalog, Orders, etc.).
4. **Implement `HttpExceptionFilter`**:
   - Create `common/filters/http-exception.filter.ts` per spec.
   - Register it globally in `main.ts`.

---
*Created by Gemini CLI on 30 March 2026*
