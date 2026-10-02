// ===========================================
// SentinelOps - Sentry Server Configuration
// ===========================================
// This file configures the Sentry SDK for the
// server-side of the application (API routes,
// Server Components, etc.).
// ===========================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // Debug mode OFF
  debug: false,
});
