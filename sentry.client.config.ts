// ===========================================
// SentinelOps - Sentry Client Configuration
// ===========================================
// This file configures the Sentry SDK for the
// browser/client-side of the application.
// ===========================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // Debug mode ON to see network errors
  debug: true,

  // Filter sensitive data
  beforeSend(event) {
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
