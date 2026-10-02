# SentinelOps - Error Boundary Hardening

SentinelOps is a comprehensive Next.js web application built to demonstrate hardened error boundaries with Sentry integration.

## Problem Addressed

Two Next.js error boundary files (`procedures/[slug]/error.tsx` and `embed/error.tsx`) handled errors but silently dropped them because they did not report them using `Sentry.captureException()`. This resulted in crashes becoming invisible to the application's monitoring system.

## Solution

This project implements **hardened error boundaries** that:
1. Catch errors gracefully and display fallback UI
2. Explicitly report errors to Sentry using `Sentry.captureException()`
3. Use `Sentry.withScope()` to attach structured context and tags (`error_boundary`, `route_type`, `module`)
4. Create local database incident records for internal tracking
5. Prevent duplicate Sentry reports during re-renders

## Key Features

- **Interactive Dashboard**: View system metrics and trigger simulated failures
- **Procedures Management**: View and run internal procedures
- **Embed Application**: Simulate an embedded third-party widget
- **Incident Tracking**: Local database tracking of all application incidents
- **Demo Center**: Guided, interactive demonstration of the error boundary behavior
- **Observability Viewer**: Visual pipeline of the error flow
- **Hardening Comparison**: Before/after analysis of the error boundaries

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS (CSS Variables for tokens) + Lucide Icons
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library
- **Observability**: Sentry

## Getting Started

1. Copy `.env.example` to `.env` (Sentry configuration optional for local testing as mock endpoints exist)
2. Run database push: `npm run db:push`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architectural documentation.
