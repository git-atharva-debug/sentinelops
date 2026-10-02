# SentinelOps Architecture

## Overview

SentinelOps is a Next.js (App Router) application designed to demonstrate robust observability patterns, specifically focusing on React Error Boundary hardening with Sentry integration.

## Core Flow

1. **User Interaction**: User navigates to a procedure or embed page.
2. **Error Generation**: An error is thrown (either simulated via the UI or a genuine runtime error).
3. **Boundary Interception**: The Next.js route-level `error.tsx` boundary intercepts the exception, preventing a full page crash.
4. **Hardened Reporting**:
   - The error is captured via `Sentry.captureException(error)`.
   - Context is enriched using `Sentry.withScope()`.
   - Duplicate reporting (e.g., from React strict mode re-renders) is prevented using a `useRef` guard.
5. **Local Incident Creation**: Simultaneously, the boundary makes a call to the local `/api/simulate/...` endpoint to create a persistent application incident record in the SQLite database.
6. **Developer Observability**: The developer can view the incident in the local SentinelOps dashboard and cross-reference it with the external Sentry dashboard via the captured Event ID.

## Database Schema (Prisma / SQLite)

- **Incident**: Represents a discrete failure occurrence. Stores metadata, Sentry Event ID, route, module, and severity.
- **IncidentEvent**: An append-only log of updates to an incident (e.g., status changes, notes, Sentry linking).
- **SystemMetric**: Tracks simulated system health data.

## Key Technologies

- **Next.js 16**: App Router for server/client components and API routes.
- **Sentry**: Distributed tracing and error monitoring.
- **Prisma**: Type-safe ORM.
- **Vitest**: Fast unit testing for boundaries and APIs.
- **Tailwind CSS**: Utility-first styling (abstracted into CSS variables for theming).
- **Zod**: Runtime type validation for API endpoints.

## Project Structure

```
sentinelops/
├── prisma/                 # Database schema and local SQLite DB
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes, Error Boundaries)
│   ├── components/         # Reusable UI components
│   ├── lib/
│   │   ├── db/             # Prisma client instance
│   │   ├── sentry/         # Sentry utilities and client
│   │   ├── services/       # Core business logic (IncidentService)
│   │   └── validation/     # Zod schemas
│   └── instrumentation.ts  # Sentry edge/server initialization
├── tests/                  # Vitest test suites
├── sentry.*.config.ts      # Sentry configuration files
└── tailwind.config.ts      # Tailwind configuration
```
